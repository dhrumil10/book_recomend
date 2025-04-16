import neo4j from 'neo4j-driver';

class Neo4jService {
  constructor() {
    this.driver = null;
    this.session = null;
  }

  // Initialize the Neo4j connection
  initialize(uri, username, password) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    console.log('Neo4j connection initialized');
  }

  // Get a new session
  getSession() {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }
    return this.driver.session();
  }

  // Close the driver when application shuts down
  close() {
    if (this.driver) {
      this.driver.close();
    }
  }

  // Execute a query with parameters
  async executeQuery(query, params = {}) {
    const session = this.getSession();
    try {
      const result = await session.run(query, params);
      return result.records;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    } finally {
      session.close();
    }
  }

  // Get book recommendations based on user ID
  async getBookRecommendations(userId, limit = 5) {
    const query = `
      MATCH (u:USER {id: $userId})-[:RATES]->(b:BOOK)
      WITH u, avg(b.publishedYear) as avgYear, collect(b.id) as readBooks
      
      MATCH (u)-[:RATES]->(b:BOOK)-[:BELONGS_TO]->(g:GENRE)<-[:BELONGS_TO]-(rec:BOOK)
      WHERE NOT rec.id IN readBooks
      
      WITH rec, count(*) as genreOverlap, avgYear
      
      MATCH (rec)-[:BELONGS_TO]->(t:THEME)<-[:PREFERS_THEME]-(u)
      WITH rec, genreOverlap, count(*) as themeOverlap, avgYear
      
      MATCH (rec)-[:WRITTEN_IN]->(l:LANGUAGE)<-[:PREFERS_LANGUAGE]-(u)
      WITH rec, genreOverlap, themeOverlap, count(*) as languageMatch, avgYear
      
      RETURN rec,
        genreOverlap * 3 + themeOverlap * 2 + languageMatch * 1 +
        (10 - abs(rec.publishedYear - avgYear) / 10) as score
      ORDER BY score DESC
      LIMIT $limit
    `;

    const params = { userId, limit };
    const records = await this.executeQuery(query, params);
    
    return records.map(record => {
      const book = record.get('rec').properties;
      const score = record.get('score');
      return { ...book, matchScore: Math.round(score * 10) };
    });
  }

  // Get trending books based on recent user activity
  async getTrendingBooks(limit = 5) {
    const query = `
      MATCH (u:USER)-[r:RATES]->(b:BOOK)
      WHERE r.timestamp > datetime() - duration('P30D')
      WITH b, count(u) as userCount, avg(r.rating) as avgRating
      WHERE userCount > 5
      RETURN b, userCount, avgRating
      ORDER BY userCount * avgRating DESC
      LIMIT $limit
    `;

    const params = { limit };
    const records = await this.executeQuery(query, params);
    
    return records.map(record => {
      const book = record.get('b').properties;
      const userCount = record.get('userCount').toNumber();
      const avgRating = record.get('avgRating');
      return { ...book, readers: userCount, rating: avgRating };
    });
  }

  // Get friend recommendations based on similar tastes
  async getFriendRecommendations(userId, limit = 5) {
    const query = `
      MATCH (u:USER {id: $userId})-[:RATES]->(b:BOOK)<-[:RATES]-(other:USER)
      WHERE NOT (u)-[:FRIEND|FOLLOWS]-(other) AND u <> other
      
      WITH other, count(b) as commonBooks
      
      MATCH (u)-[:PREFERS_GENRE]->(g:GENRE)<-[:PREFERS_GENRE]-(other)
      WITH other, commonBooks, count(g) as commonGenres
      
      MATCH (u)-[:PREFERS_THEME]->(t:THEME)<-[:PREFERS_THEME]-(other)
      WITH other, commonBooks, commonGenres, count(t) as commonThemes
      
      MATCH (u)-[:LIVES_IN]->(:CITY)-[:PART_OF]->(:STATE)<-[:PART_OF]-(:CITY)<-[:LIVES_IN]-(other)
      WITH other, commonBooks, commonGenres, commonThemes, count(*) as sameState
      
      RETURN other, 
        commonBooks * 2 + commonGenres * 3 + commonThemes * 2 + sameState * 1 as matchScore,
        commonBooks
      ORDER BY matchScore DESC
      LIMIT $limit
    `;

    const params = { userId, limit };
    const records = await this.executeQuery(query, params);
    
    return records.map(record => {
      const user = record.get('other').properties;
      const matchScore = record.get('matchScore');
      const commonBooks = record.get('commonBooks').toNumber();
      const matchPercent = Math.min(Math.round((matchScore / 50) * 100), 99);
      return { ...user, matchScore: matchPercent, commonBooks };
    });
  }

  // Get upcoming events based on user location and interests
  async getUpcomingEvents(userId, limit = 5) {
    const query = `
      MATCH (u:USER {id: $userId})-[:LIVES_IN]->(:CITY)-[:PART_OF]->(s:STATE)
      MATCH (e:EVENT)-[:LOCATED_IN]->(:CITY)-[:PART_OF]->(s)
      WHERE e.date > datetime()
      
      WITH u, e
      
      OPTIONAL MATCH (e)-[:FEATURES]->(b:BOOK)<-[:RATES]-(u)
      WITH u, e, count(b) as readRelevantBooks
      
      OPTIONAL MATCH (e)-[:FEATURES]->(b:BOOK)-[:BELONGS_TO]->(g:GENRE)<-[:PREFERS_GENRE]-(u)
      WITH u, e, readRelevantBooks, count(g) as genreRelevance
      
      OPTIONAL MATCH (u)-[:FRIEND]->(f:USER)-[:ATTENDED]->(e)
      WITH e, readRelevantBooks, genreRelevance, count(f) as friendsAttending
      
      RETURN e, readRelevantBooks, genreRelevance, friendsAttending,
        readRelevantBooks * 3 + genreRelevance * 2 + friendsAttending * 4 as relevanceScore
      ORDER BY e.date ASC, relevanceScore DESC
      LIMIT $limit
    `;

    const params = { userId, limit };
    const records = await this.executeQuery(query, params);
    
    return records.map(record => {
      const event = record.get('e').properties;
      const friendsAttending = record.get('friendsAttending').toNumber();
      return { ...event, friendsAttending };
    });
  }

  // Process user query for Graph RAG
  async processUserQuery(userId, query) {
    // Simple keyword matching for demonstration
    const keywords = query.toLowerCase().split(' ');
    
    if (keywords.some(k => ['recommend', 'suggestion', 'similar'].includes(k))) {
      const recommendations = await this.getBookRecommendations(userId, 3);
      return {
        type: 'recommendations',
        data: recommendations,
        response: "Based on your reading history and preferences, I've found some books you might enjoy. These recommendations are personalized based on your previous ratings, the genres you prefer, and what similar readers have enjoyed."
      };
    }
    
    if (keywords.some(k => ['author', 'wrote', 'writer'].includes(k))) {
      // Extract potential author name from query
      // This is simplified - in a real app you'd use NLP
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
        
        const records = await this.executeQuery(authorQuery, { name: authorName });
        
        if (records.length > 0) {
          const author = records[0].get('a').properties;
          const books = records[0].get('books').map(b => b.properties);
          
          return {
            type: 'author',
            data: { author, books },
            response: `${author.name} (${author.birthYear}-${author.deathYear || 'present'}) is known for works like ${books.slice(0, 3).map(b => `'${b.title}'`).join(', ')}. ${author.bio}`
          };
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
      
      const records = await this.executeQuery(genreQuery, { userId });
      
      if (records.length > 0) {
        const genres = records.map(r => ({ 
          name: r.get('genre'), 
          percentage: Math.round((r.get('bookCount').toNumber() / 10) * 100) 
        }));
        
        return {
          type: 'genres',
          data: genres,
          response: `Looking at your reading history, your top genres are:\n\n1. ${genres[0].name} (${genres[0].percentage}% of books)\n2. ${genres[1].name} (${genres[1].percentage}% of books)\n3. ${genres[2].name} (${genres[2].percentage}% of books)`
        };
      }
    }
    
    if (keywords.some(k => ['friend', 'similar', 'people'].includes(k))) {
      const friendRecs = await this.getFriendRecommendations(userId, 3);
      
      if (friendRecs.length > 0) {
        return {
          type: 'friends',
          data: friendRecs,
          response: `I've found ${friendRecs.length} users with reading tastes very similar to yours:\n\n${friendRecs.map(f => `- ${f.name} (${f.matchScore}% match) - You share ${f.commonBooks} books in common`).join('\n')}\n\nWould you like me to suggest connecting with them?`
        };
      }
    }
    
    if (keywords.some(k => ['event', 'festival', 'club', 'meetup'].includes(k))) {
      const events = await this.getUpcomingEvents(userId, 3);
      
      if (events.length > 0) {
        return {
          type: 'events',
          data: events,
          response: `There are ${events.length} upcoming book events in your area:\n\n${events.map((e, i) => `${i+1}. ${e.name} - ${e.date} ${e.friendsAttending > 0 ? `(${e.friendsAttending} of your friends are attending)` : ''}`).join('\n')}\n\nWould you like more details on any of these?`
        };
      }
    }
    
    // Default response
    return {
      type: 'default',
      data: null,
      response: "I've searched our knowledge graph for that information. To give you the most helpful answer, could you tell me more specifically what you're looking for? I can provide recommendations, author information, genre insights, or connect you with like-minded readers."
    };
  }
}

// Singleton instance
const neo4jService = new Neo4jService();

export default neo4jService;