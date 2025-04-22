// src/services/bookDataService.js
import neo4jService from './neo4jService';

class BookDataService {
  // Get currently reading books for a user
  async getCurrentlyReadingBooks(userId) {
    const query = `
      MATCH (u:USER {id: $userId})-[:HAS_HISTORY]->(rh:READING_HISTORY)-[:CONTAINS_ENTRY]->(he:HISTORY_ENTRY)
      WHERE he.action = 'started' AND NOT EXISTS {
        MATCH (rh)-[:CONTAINS_ENTRY]->(finished:HISTORY_ENTRY)
        WHERE finished.action = 'finished' AND finished.timestamp > he.timestamp
      }
      MATCH (he)-[:REFERENCES_BOOK]->(b:BOOK)
      OPTIONAL MATCH (b)-[:WRITTEN_BY]->(a:AUTHOR)
      RETURN b, a, he.timestamp as startDate, b.id as bookId
      ORDER BY startDate DESC
      LIMIT 5
    `;
    
    const result = await neo4jService.executeQuery(query, { userId });
    
    return result.map(record => {
      const book = record.get('b').properties;
      const author = record.get('a') ? record.get('a').properties : null;
      return {
        ...book,
        author: author ? author.name : 'Unknown Author',
        progress: this._calculateBookProgress(book.id)
      };
    });
  }
  
  // Calculate book progress (would normally be based on page/chapter data)
  _calculateBookProgress(bookId) {
    // In a real implementation, this would fetch actual progress data
    return Math.floor(Math.random() * 100);
  }
  
  // Get trending books
  async getTrendingBooks() {
    const query = `
      MATCH (u:USER)-[r:RATES]->(b:BOOK)
      WHERE r.timestamp > datetime() - duration('P30D')
      WITH b, count(u) as userCount, avg(r.rating) as avgRating
      WHERE userCount > 2
      OPTIONAL MATCH (b)<-[:WROTE]-(a:AUTHOR)
      OPTIONAL MATCH (b)-[:BELONGS_TO]->(g:GENRE)
      RETURN b, a, collect(g.name) as genres, userCount, avgRating
      ORDER BY userCount * avgRating DESC
      LIMIT 2
    `;
    
    const result = await neo4jService.executeQuery(query);
    
    return result.map(record => {
      const book = record.get('b').properties;
      const author = record.get('a') ? record.get('a').properties : null;
      const genres = record.get('genres') || [];
      const readers = record.get('userCount').toNumber();
      
      return {
        ...book,
        author: author ? author.name : 'Unknown Author',
        genres: genres.slice(0, 2),
        readers
      };
    });
  }
  
  // Get personalized book recommendations
  async getBookRecommendations(userId) {
    const query = `
      MATCH (u:USER {id: $userId})-[:RATES]->(b:BOOK)
      WITH u, avg(b.publishedYear) as avgYear
      
      MATCH (u)-[:RATES]->(b:BOOK)-[:BELONGS_TO]->(g:GENRE)<-[:BELONGS_TO]-(rec:BOOK)
      WHERE NOT EXISTS {
        MATCH (u)-[:RATES]->(rec)
      }
      
      WITH rec, count(*) as genreOverlap, avgYear
      OPTIONAL MATCH (rec)<-[:WROTE]-(a:AUTHOR)
      
      RETURN rec, a,
        genreOverlap * 3 + (10 - abs(coalesce(rec.publishedYear, 2020) - coalesce(avgYear, 2020)) / 10) as score
      ORDER BY score DESC
      LIMIT 3
    `;
    
    const result = await neo4jService.executeQuery(query, { userId });
    
    return result.map(record => {
      const book = record.get('rec').properties;
      const author = record.get('a') ? record.get('a').properties : null;
      const score = record.get('score');
      
      return {
        ...book,
        author: author ? author.name : 'Unknown Author',
        matchPercent: Math.min(Math.round(score * 10), 99)
      };
    });
  }
  
  // Get upcoming events
  async getUpcomingEvents(userId) {
    const query = `
      MATCH (u:USER {id: $userId})-[:LIVES_IN]->(:CITY)-[:PART_OF]->(s:STATE)
      MATCH (e:EVENT)-[:LOCATED_IN]->(:CITY)-[:PART_OF]->(s)
      WHERE e.date > datetime()
      
      OPTIONAL MATCH (e)-[:FEATURES]->(b:BOOK)<-[:RATES]-(u)
      WITH u, e, count(b) as readRelevantBooks
      
      OPTIONAL MATCH (u)-[:FRIEND]->(f:USER)-[:ATTENDED]->(e)
      OPTIONAL MATCH (e)-[:LOCATED_IN]->(c:CITY)
      
      RETURN e, count(f) as friendsAttending, c.name as cityName
      ORDER BY e.date ASC
      LIMIT 1
    `;
    
    const result = await neo4jService.executeQuery(query, { userId });
    
    return result.map(record => {
      const event = record.get('e').properties;
      const friendsAttending = record.get('friendsAttending').toNumber();
      const cityName = record.get('cityName');
      
      return {
        ...event,
        friendsAttending,
        location: cityName
      };
    });
  }
  
  // Get recently added books - FIXED QUERY
  async getRecentlyAddedBooks() {
    const query = `
      MATCH (b:BOOK)
      WHERE b.publishedYear IS NOT NULL AND b.publishedYear >= 2023
      RETURN b
      ORDER BY b.publishedYear DESC
      LIMIT 2
    `;
    
    const result = await neo4jService.executeQuery(query);
    
    return result.map(record => {
      const book = record.get('b').properties;
      return {
        ...book,
        daysAgo: 2 // In a real app, this would be calculated from creation date
      };
    });
  }
  
  // Get book adaptations
  async getBookAdaptations(userId) {
    const query = `
      MATCH (m:MOVIE)-[:ADAPTED_FROM]->(b:BOOK)
      OPTIONAL MATCH (u:USER {id: $userId})-[:RATES]->(b)
      RETURN m, b, exists((u)-[:RATES]->(b)) as hasRead
      ORDER BY m.releaseYear DESC
      LIMIT 1
    `;
    
    const result = await neo4jService.executeQuery(query, { userId });
    
    return result.map(record => {
      const movie = record.get('m').properties;
      const book = record.get('b').properties;
      const hasRead = record.get('hasRead');
      
      return {
        ...movie,
        bookTitle: book.title,
        hasRead
      };
    });
  }
}

export default new BookDataService();