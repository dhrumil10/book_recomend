import neo4jService from './neo4jService';
import bookDataService from './bookDataService'; 
import axios from 'axios';

class ChatbotService {
  constructor() {
    this.userId = 'USER-1'; // Default user for testing
    this.openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.useAgenticRag = true; // Toggle to switch between old and new implementations
    this.agenticRagUrl = 'http://localhost:5050/api/frontend-chat'; // URL to the agentic_rag API
  }

  // Set the active user
  setUser(userId) {
    this.userId = userId;
  }

  // Process a user message using Graph RAG
  async processMessage(message) {
    try {
      // If using agentic_rag, delegate to that service
      if (this.useAgenticRag) {
        return await this.processMessageWithAgenticRag(message);
      }
      
      // Original implementation
      // Step 1: Retrieve relevant graph data from Neo4j
      const graphData = await this.retrieveGraphData(message);
      
      // Step 2: Generate embeddings and construct the prompt (in a real app)
      // The embeddings would be used to find similar content in the graph
      
      // Step 3: Send to OpenAI API with retrieved context
      const response = await this.generateResponseWithOpenAI(message, graphData);
      
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        type: 'error',
        content: "I'm sorry, I encountered an error while searching the knowledge graph. Please try again with a different question.",
        data: null
      };
    }
  }
  
  // New method to use agentic_rag backend
  async processMessageWithAgenticRag(message) {
    try {
      // Send request to agentic_rag backend
      const response = await axios.post(this.agenticRagUrl, {
        message: message,
        userId: this.userId
      });
      
      // Return the response data
      return response.data;
    } catch (error) {
      console.error('Error calling agentic_rag service:', error);
      
      // Fall back to the original implementation if agentic_rag fails
      console.log('Falling back to original implementation...');
      this.useAgenticRag = false;
      const result = await this.processMessage(message);
      this.useAgenticRag = true; // Reset for next time
      return result;
    }
  }

  // Retrieve relevant data from the graph based on the query
  async retrieveGraphData(query) {
    const keywords = query.toLowerCase().split(' ');
    let graphData = {};
    
    // Determine what types of data to retrieve based on query content
    if (keywords.some(k => ['recommend', 'suggestion', 'similar', 'like'].includes(k))) {
      graphData.recommendations = await bookDataService.getBookRecommendations(this.userId, 3);
      graphData.type = 'recommendations';
    } 
    
    if (keywords.some(k => ['author', 'wrote', 'writer'].includes(k))) {
      // Extract potential author name from query (simplified)
      const potentialAuthor = query.match(/about (.+?)( wrote| author|$)/i);
      const authorName = potentialAuthor ? potentialAuthor[1] : '';
      
      if (authorName) {
        const authorQuery = `
          MATCH (a:AUTHOR)
          WHERE a.name CONTAINS $name
          OPTIONAL MATCH (a)-[:WROTE]->(b:BOOK)
          RETURN a, collect(b) as books
          LIMIT 1
        `;
        
        const records = await bookDataService.executeQuery(authorQuery, { name: authorName });
        
        if (records.length > 0) {
          graphData.author = records[0].get('a').properties;
          graphData.books = records[0].get('books').map(b => b.properties);
          graphData.type = 'author';
        }
      }
    }
    
    if (keywords.some(k => ['genre', 'type', 'category'].includes(k))) {
      const genreQuery = `
        MATCH (u:USER {id: $userId})-[:RATES]->(b:BOOK)-[:BELONGS_TO]->(g:GENRE)
        WITH g.name as genre, count(*) as bookCount, u
        ORDER BY bookCount DESC
        LIMIT 3
      `;
      
      const records = await bookDataService.executeQuery(genreQuery, { userId: this.userId });
      
      if (records.length > 0) {
        graphData.genres = records.map(r => ({ 
          name: r.get('genre'), 
          percentage: Math.round((r.get('bookCount').toNumber() / 10) * 100) 
        }));
        graphData.type = 'genres';
      }
    }
    
    if (keywords.some(k => ['friend', 'similar', 'people'].includes(k))) {
      graphData.friendRecommendations = await bookDataService.getFriendRecommendations(this.userId, 3);
      graphData.type = 'friends';
    }
    
    if (keywords.some(k => ['event', 'festival', 'club', 'meetup'].includes(k))) {
      graphData.events = await bookDataService.getUpcomingEvents(this.userId, 3);
      graphData.type = 'events';
    }
    
    return graphData;
  }

  // Generate response using OpenAI with graph context
  async generateResponseWithOpenAI(userQuery, graphData) {
    try {
      // Format the graph data for inclusion in the prompt
      let contextText = "Based on the user's graph data:\n\n";
      
      if (graphData.type === 'recommendations' && graphData.recommendations?.length > 0) {
        contextText += "Book Recommendations:\n";
        graphData.recommendations.forEach((book, index) => {
          contextText += `${index + 1}. "${book.title}" by ${book.author || 'Unknown'} - ${book.matchScore}% match\n`;
        });
      }
      
      if (graphData.type === 'author' && graphData.author) {
        contextText += `Author Information:\n${graphData.author.name} (${graphData.author.birthYear}-${graphData.author.deathYear || 'present'})\n`;
        contextText += `Known for: ${graphData.books.map(b => b.title).join(', ')}\n`;
        contextText += `Bio: ${graphData.author.bio || 'No biography available'}\n`;
      }
      
      if (graphData.type === 'genres' && graphData.genres?.length > 0) {
        contextText += "User's Top Genres:\n";
        graphData.genres.forEach((genre, index) => {
          contextText += `${index + 1}. ${genre.name} (${genre.percentage}% of books)\n`;
        });
      }
      
      if (graphData.type === 'friends' && graphData.friendRecommendations?.length > 0) {
        contextText += "Friend Recommendations:\n";
        graphData.friendRecommendations.forEach((friend, index) => {
          contextText += `${index + 1}. ${friend.name} - ${friend.matchScore}% taste match with ${friend.commonBooks} common books\n`;
        });
      }
      
      if (graphData.type === 'events' && graphData.events?.length > 0) {
        contextText += "Upcoming Events:\n";
        graphData.events.forEach((event, index) => {
          contextText += `${index + 1}. ${event.name} - ${event.date}${event.friendsAttending > 0 ? ` (${event.friendsAttending} friends attending)` : ''}\n`;
        });
      }
      
      // If no specific data was retrieved, provide a general context
      if (!graphData.type) {
        contextText += "No specific data found in the knowledge graph for this query. Please provide a general response about books, reading, or recommendations.";
      }
      
      // Prepare the prompt for OpenAI
      const prompt = `
        You are a helpful assistant for a book social network called BookLovers. 
        You have access to a knowledge graph that contains information about users, books, authors, genres, and more.
        
        ${contextText}
        
        User query: "${userQuery}"
        
        Please respond to the user in a helpful, conversational manner using the knowledge graph data provided.
        Make your response friendly and concise. If recommending books, explain briefly why they might enjoy them.
      `;
      
      // For this example, we'll use the OpenAI API, similar to your Python code
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openAiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Process the response
      const aiResponse = response.data.choices[0].message.content;
      
      // Return formatted response with type and data
      return {
        type: graphData.type || 'general',
        content: aiResponse,
        data: graphData.type === 'recommendations' ? graphData.recommendations : 
              graphData.type === 'friends' ? graphData.friendRecommendations :
              graphData.type === 'events' ? graphData.events : null
      };
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      
      // Fallback responses based on graph data type
      if (graphData.type === 'recommendations' && graphData.recommendations?.length > 0) {
        return {
          type: 'recommendations',
          content: `Based on your reading history and preferences, I've found some books you might enjoy. These recommendations are personalized based on your previous ratings, genres you prefer, and what similar readers have enjoyed.`,
          data: graphData.recommendations
        };
      }
      
      if (graphData.type === 'author' && graphData.author) {
        return {
          type: 'author',
          content: `${graphData.author.name} (${graphData.author.birthYear}-${graphData.author.deathYear || 'present'}) is known for works like ${graphData.books.slice(0, 3).map(b => `"${b.title}"`).join(', ')}. ${graphData.author.bio}`,
          data: null
        };
      }
      
      if (graphData.type === 'genres' && graphData.genres?.length > 0) {
        return {
          type: 'genres',
          content: `Looking at your reading history, your top genres are:\n\n1. ${graphData.genres[0].name} (${graphData.genres[0].percentage}% of books)\n2. ${graphData.genres[1].name} (${graphData.genres[1].percentage}% of books)\n3. ${graphData.genres[2].name} (${graphData.genres[2].percentage}% of books)`,
          data: null
        };
      }
      
      if (graphData.type === 'friends' && graphData.friendRecommendations?.length > 0) {
        return {
          type: 'friends',
          content: `I've found ${graphData.friendRecommendations.length} users with reading tastes very similar to yours:\n\n${graphData.friendRecommendations.map(f => `- ${f.name} (${f.matchScore}% match) - You share ${f.commonBooks} books in common`).join('\n')}\n\nWould you like me to suggest connecting with them?`,
          data: graphData.friendRecommendations
        };
      }
      
      if (graphData.type === 'events' && graphData.events?.length > 0) {
        return {
          type: 'events',
          content: `There are ${graphData.events.length} upcoming book events in your area:\n\n${graphData.events.map((e, i) => `${i+1}. ${e.name} - ${e.date} ${e.friendsAttending > 0 ? `(${e.friendsAttending} of your friends are attending)` : ''}`).join('\n')}\n\nWould you like more details on any of these?`,
          data: graphData.events
        };
      }
      
      // Default fallback response
      return {
        type: 'general',
        content: "I've searched our knowledge graph for that information. To give you the most helpful answer, could you tell me more specifically what you're looking for? I can provide recommendations, author information, genre insights, or connect you with like-minded readers.",
        data: null
      };
    }
  }

  // Get trending books for recommendations
  async getTrendingBooks(limit = 5) {
    try {
      return await bookDataService.getTrendingBooks(limit);
    } catch (error) {
      console.error('Error getting trending books:', error);
      return [];
    }
  }

  // Get personalized book recommendations
  async getBookRecommendations(limit = 5) {
    try {
      return await bookDataService.getBookRecommendations(this.userId, limit);
    } catch (error) {
      console.error('Error getting book recommendations:', error);
      return [];
    }
  }

  // Get friend recommendations based on similar tastes
  async getFriendRecommendations(limit = 5) {
    try {
      return await bookDataService.getFriendRecommendations(this.userId, limit);
    } catch (error) {
      console.error('Error getting friend recommendations:', error);
      return [];
    }
  }

  // Get upcoming events
  async getUpcomingEvents(limit = 5) {
    try {
      return await bookDataService.getUpcomingEvents(this.userId, limit);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }
}

// Singleton instance
const chatbotService = new ChatbotService();

export default chatbotService;