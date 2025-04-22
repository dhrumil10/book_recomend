// src/services/genreService.js
import neo4jService from './neo4jService';

class GenreService {
  async getGenreById(id) {
    const query = `
      MATCH (g:GENRE {id: $id})
      
      OPTIONAL MATCH (g)<-[:BELONGS_TO]-(b:BOOK)
      WITH g, collect(b) as genreBooks
      
      RETURN g, genreBooks, size(genreBooks) as bookCount
    `;
    
    const result = await neo4jService.executeQuery(query, { id });
    
    if (result.length === 0) {
      return null;
    }
    
    const record = result[0];
    const genre = record.get('g').properties;
    const booksData = record.get('genreBooks');
    const bookCount = record.get('bookCount').toNumber();
    
    // Get reader count
    const readerCountQuery = `
      MATCH (g:GENRE {id: $id})<-[:BELONGS_TO]-(b:BOOK)<-[:RATES]-(u:USER)
      RETURN count(DISTINCT u) as readerCount
    `;
    
    const readerCountResult = await neo4jService.executeQuery(readerCountQuery, { id });
    const readerCount = readerCountResult[0].get('readerCount').toNumber();
    
    // Get detailed books information
    const booksQuery = `
      MATCH (g:GENRE {id: $id})<-[:BELONGS_TO]-(b:BOOK)
      OPTIONAL MATCH (b)<-[:WROTE]-(a:AUTHOR)
      OPTIONAL MATCH (b)<-[r:RATES]-(u:USER)
      WITH b, a, avg(r.rating) as avgRating, count(r) as ratingsCount
      
      OPTIONAL MATCH (b)<-[:READING]-(reader:USER)
      WITH b, a, avgRating, ratingsCount, count(reader) as readersCount
      
      RETURN b, a.name as authorName, avgRating, ratingsCount, readersCount
      LIMIT 20
    `;
    
    const booksResult = await neo4jService.executeQuery(booksQuery, { id });
    
    const books = booksResult.map(record => {
      const book = record.get('b').properties;
      const authorName = record.get('authorName');
      const avgRating = record.get('avgRating');
      const ratingsCount = record.get('ratingsCount').toNumber();
      const readersCount = record.get('readersCount').toNumber();
      
      return {
        ...book,
        author: authorName,
        averageRating: avgRating,
        ratingsCount,
        readersCount
      };
    });
    
    // Get popular authors in this genre
    const authorsQuery = `
      MATCH (g:GENRE {id: $id})<-[:BELONGS_TO]-(b:BOOK)<-[:WROTE]-(a:AUTHOR)
      WITH a, count(b) as bookCount
      RETURN a, bookCount
      ORDER BY bookCount DESC
      LIMIT 4
    `;
    
    const authorsResult = await neo4jService.executeQuery(authorsQuery, { id });
    
    const popularAuthors = authorsResult.map(record => {
      const author = record.get('a').properties;
      const bookCount = record.get('bookCount').toNumber();
      
      return {
        ...author,
        bookCount
      };
    });
    
    // Get related genres
    const relatedGenresQuery = `
      MATCH (g:GENRE {id: $id})<-[:BELONGS_TO]-(b:BOOK)-[:BELONGS_TO]->(related:GENRE)
      WHERE related.id <> $id
      WITH related, count(b) as commonBooks
      RETURN related, commonBooks
      ORDER BY commonBooks DESC
      LIMIT 5
    `;
    
    const relatedGenresResult = await neo4jService.executeQuery(relatedGenresQuery, { id });
    
    const relatedGenres = relatedGenresResult.map(record => {
      return record.get('related').properties;
    });
    
    return {
      ...genre,
      bookCount,
      readerCount,
      books,
      popularAuthors,
      relatedGenres
    };
  }
}

export default new GenreService();