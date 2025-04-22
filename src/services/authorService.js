// src/services/authorService.js
import neo4jService from './neo4jService';

class AuthorService {
  async getAuthorById(id) {
    const query = `
      MATCH (a:AUTHOR {id: $id})
      
      OPTIONAL MATCH (a)-[:WROTE]->(b:BOOK)
      WITH a, collect(b) as authorBooks
      
      RETURN a, authorBooks
    `;
    
    const result = await neo4jService.executeQuery(query, { id });
    
    if (result.length === 0) {
      return null;
    }
    
    const record = result[0];
    const author = record.get('a').properties;
    const books = record.get('authorBooks').map(b => b.properties);
    
    // Get similar authors
    const similarAuthorsQuery = `
      MATCH (a:AUTHOR {id: $id})-[:WROTE]->(:BOOK)-[:BELONGS_TO]->(g:GENRE)<-[:BELONGS_TO]-(:BOOK)<-[:WROTE]-(similar:AUTHOR)
      WHERE similar.id <> $id
      WITH similar, count(g) as genreOverlap
      
      RETURN similar, genreOverlap
      ORDER BY genreOverlap DESC
      LIMIT 4
    `;
    
    const similarAuthorsResult = await neo4jService.executeQuery(similarAuthorsQuery, { id });
    
    const similarAuthors = similarAuthorsResult.map(record => {
      return record.get('similar').properties;
    });
    
    // Get awards (simulated - would come from database in a real app)
    const awards = [];
    
    return {
      ...author,
      books,
      similarAuthors,
      awards
    };
  }
}

export default new AuthorService();