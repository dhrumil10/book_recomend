// src/services/bookService.js
import neo4jService from './neo4jService';

class BookService {
  async getBookById(id) {
    const query = `
      MATCH (b:BOOK {id: $id})
      OPTIONAL MATCH (b)<-[:WROTE]-(a:AUTHOR)
      OPTIONAL MATCH (b)-[:BELONGS_TO]->(g:GENRE)
      
      WITH b, a, collect(g.name) as genres
      
      OPTIONAL MATCH (u:USER)-[r:RATES]->(b)
      WITH b, a, genres, avg(r.rating) as avgRating, count(r) as ratingsCount
      
      OPTIONAL MATCH (u:USER)-[:READING]->(b)
      WITH b, a, genres, avgRating, ratingsCount, count(u) as readersCount
      
      OPTIONAL MATCH (u:USER)-[:FINISHED]->(b)
      WITH b, a, genres, avgRating, ratingsCount, readersCount, count(u) as finishedCount
      
      OPTIONAL MATCH (b)-[:ADAPTED_TO]->(m:MOVIE)
      WITH b, a, genres, avgRating, ratingsCount, readersCount, finishedCount, collect(m) as adaptations
      
      RETURN b, a, 
        genres, 
        avgRating, 
        ratingsCount, 
        readersCount, 
        finishedCount,
        adaptations
    `;
    
    const result = await neo4jService.executeQuery(query, { id });
    
    if (result.length === 0) {
      return null;
    }
    
    const record = result[0];
    const book = record.get('b').properties;
    const author = record.get('a')?.properties;
    const genres = record.get('genres');
    const avgRating = record.get('avgRating');
    const ratingsCount = record.get('ratingsCount').toNumber();
    const readersCount = record.get('readersCount').toNumber();
    const finishedCount = record.get('finishedCount').toNumber();
    const adaptations = record.get('adaptations').map(m => m.properties);
    
    // Get friends reading this book
    const friendsQuery = `
      MATCH (u:USER {id: $userId})-[:FRIEND]->(friend:USER)-[r:READING|FINISHED|WANTS_TO_READ]->(b:BOOK {id: $bookId})
      RETURN friend, type(r) as status
      LIMIT 5
    `;
    
    const friendsResult = await neo4jService.executeQuery(friendsQuery, { 
      userId: "USER-1", // Using a default user ID
      bookId: id 
    });
    
    const friendsReading = friendsResult.map(record => {
      const friend = record.get('friend').properties;
      const status = record.get('status').toLowerCase();
      return { ...friend, status };
    });
    
    // Get similar books
    const similarBooksQuery = `
      MATCH (b:BOOK {id: $id})-[:BELONGS_TO]->(g:GENRE)<-[:BELONGS_TO]-(similar:BOOK)
      WHERE similar.id <> $id
      WITH similar, count(g) as genreOverlap
      
      OPTIONAL MATCH (similar)<-[:WROTE]-(a:AUTHOR)
      
      RETURN similar, a.name as authorName, genreOverlap
      ORDER BY genreOverlap DESC
      LIMIT 4
    `;
    
    const similarBooksResult = await neo4jService.executeQuery(similarBooksQuery, { id });
    
    const similarBooks = similarBooksResult.map(record => {
      const similar = record.get('similar').properties;
      const authorName = record.get('authorName');
      return { ...similar, author: authorName };
    });
    
    return {
      ...book,
      author: author?.name,
      authorId: author?.id,
      genres,
      averageRating: avgRating,
      ratingsCount,
      readersCount,
      finishedCount,
      adaptations,
      friendsReading,
      similarBooks
    };
  }
  
  async getUserBookStatus(userId, bookId) {
    const query = `
      MATCH (u:USER {id: $userId}), (b:BOOK {id: $bookId})
      
      OPTIONAL MATCH (u)-[reading:READING]->(b)
      OPTIONAL MATCH (u)-[finished:FINISHED]->(b)
      OPTIONAL MATCH (u)-[wantToRead:WANTS_TO_READ]->(b)
      OPTIONAL MATCH (u)-[r:RATES]->(b)
      
      RETURN 
        CASE
          WHEN reading IS NOT NULL THEN 'reading'
          WHEN finished IS NOT NULL THEN 'finished'
          WHEN wantToRead IS NOT NULL THEN 'want-to-read'
          ELSE 'none'
        END as status,
        r.rating as rating
    `;
    
    const result = await neo4jService.executeQuery(query, { userId, bookId });
    
    if (result.length === 0) {
      return { status: 'none', rating: 0 };
    }
    
    const status = result[0].get('status');
    const rating = result[0].get('rating');
    
    return { status, rating: rating || 0 };
  }
  
  async updateUserBookStatus(userId, bookId, status) {
    // First remove any existing status relationships
    const removeQuery = `
      MATCH (u:USER {id: $userId})-[r:READING|FINISHED|WANTS_TO_READ]->(b:BOOK {id: $bookId})
      DELETE r
    `;
    
    await neo4jService.executeQuery(removeQuery, { userId, bookId });
    
    // Then add the new status relationship
    let relationshipType;
    switch (status) {
      case 'reading':
        relationshipType = 'READING';
        break;
      case 'finished':
        relationshipType = 'FINISHED';
        break;
      case 'want-to-read':
        relationshipType = 'WANTS_TO_READ';
        break;
      default:
        return; // No relationship to create
    }
    
    const createQuery = `
      MATCH (u:USER {id: $userId}), (b:BOOK {id: $bookId})
      CREATE (u)-[:${relationshipType} {date: datetime()}]->(b)
    `;
    
    await neo4jService.executeQuery(createQuery, { userId, bookId });
    
    // Add a history entry
    const historyQuery = `
      MATCH (u:USER {id: $userId}), (b:BOOK {id: $bookId})
      MERGE (u)-[:HAS_HISTORY]->(rh:READING_HISTORY {id: "RH-" + u.id + "-" + b.id})
      
      WITH u, b, rh
      
      CREATE (he:HISTORY_ENTRY {
        id: "ENTRY-" + apoc.create.uuid(),
        action: $action,
        timestamp: datetime(),
        context: "app"
      })
      
      CREATE (rh)-[:CONTAINS_ENTRY]->(he)
      CREATE (he)-[:REFERENCES_BOOK]->(b)
    `;
    
    let action;
    switch (status) {
      case 'reading':
        action = 'started';
        break;
      case 'finished':
        action = 'finished';
        break;
      case 'want-to-read':
        action = 'want-to-read';
        break;
      default:
        action = 'none';
    }
    
    await neo4jService.executeQuery(historyQuery, { userId, bookId, action });
    
    return { status };
  }
  
  async rateBook(userId, bookId, rating) {
    const query = `
      MATCH (u:USER {id: $userId}), (b:BOOK {id: $bookId})
      
      MERGE (u)-[r:RATES]->(b)
      ON CREATE SET r.rating = $rating, r.timestamp = datetime()
      ON MATCH SET r.rating = $rating, r.timestamp = datetime()
      
      RETURN r.rating as rating
    `;
    
    const result = await neo4jService.executeQuery(query, { userId, bookId, rating });
    
    return result[0].get('rating');
  }
}

export default new BookService();