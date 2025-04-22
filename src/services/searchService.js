// src/services/searchService.js
import neo4jService from './neo4jService';

class SearchService {
  /**
   * Search for books, authors, and genres based on query
   * @param {string} query - The search query
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Object>} - Search results categorized by type
   */
  async search(query, limit = 5) {
    if (!query || query.trim().length < 2) {
      return { books: [], authors: [], genres: [] };
    }
    
    const searchQuery = `
      // Search for books by title
      MATCH (b:BOOK)
      WHERE toLower(b.title) CONTAINS toLower($query)
      WITH b, 1 as relevance
      OPTIONAL MATCH (b)<-[:WROTE]-(a:AUTHOR)
      RETURN b, a, "book" as type, relevance, null as item
      
      UNION
      
      // Search for authors
      MATCH (a:AUTHOR)
      WHERE toLower(a.name) CONTAINS toLower($query)
      RETURN null as b, a, "author" as type, 1 as relevance, null as item
      
      UNION
      
      // Search for genres
      MATCH (g:GENRE)
      WHERE toLower(g.name) CONTAINS toLower($query)
      RETURN null as b, null as a, "genre" as type, 1 as relevance, g as item
      
      // Order by relevance and limit results
      ORDER BY relevance DESC
      LIMIT toInteger($limit)
    `;
    
    const results = await neo4jService.executeQuery(searchQuery, { 
      query: query.toLowerCase(),
      limit: parseInt(limit, 10)
    });
    
    // Process and categorize results
    const books = [];
    const authors = [];
    const genres = [];
    
    results.forEach(record => {
      const type = record.get('type');
      
      if (type === 'book') {
        const book = record.get('b').properties;
        const author = record.get('a')?.properties;
        books.push({
          ...book,
          author: author?.name || 'Unknown Author'
        });
      } else if (type === 'author') {
        const author = record.get('a').properties;
        authors.push(author);
      } else if (type === 'genre') {
        const genre = record.get('item').properties;
        genres.push(genre);
      }
    });
    
    return { books, authors, genres };
  }
  
  /**
   * Get search suggestions based on partial query
   * @param {string} query - Partial query to get suggestions for
   * @param {number} limit - Maximum number of suggestions to return
   * @returns {Promise<Array>} - List of suggestions
   */
  async getSuggestions(query, limit = 5) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const suggestionsQuery = `
      // Get book title suggestions
      MATCH (b:BOOK)
      WHERE toLower(b.title) CONTAINS toLower($query)
      RETURN b.title as text, "book" as type, b.id as id
      
      UNION
      
      // Get author name suggestions
      MATCH (a:AUTHOR)
      WHERE toLower(a.name) CONTAINS toLower($query)
      RETURN a.name as text, "author" as type, a.id as id
      
      UNION
      
      // Get genre name suggestions
      MATCH (g:GENRE)
      WHERE toLower(g.name) CONTAINS toLower($query)
      RETURN g.name as text, "genre" as type, g.id as id
      
      // Limit results
      LIMIT toInteger($limit)
    `;
    
    const results = await neo4jService.executeQuery(suggestionsQuery, { 
      query: query.toLowerCase(),
      limit: parseInt(limit, 10)
    });
    
    return results.map(record => ({
      text: record.get('text'),
      type: record.get('type'),
      id: record.get('id')
    }));
  }
}

export default new SearchService();