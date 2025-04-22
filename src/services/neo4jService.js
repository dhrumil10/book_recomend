import neo4j from 'neo4j-driver';

class Neo4jService {
  constructor() {
    this.driver = null;
    this.session = null;
  }

  // Initialize the Neo4j connection
  initialize(uri, username, password) {
    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
      console.log('Neo4j connection initialized');
    } catch (error) {
      console.error('Failed to initialize Neo4j connection:', error);
      throw error;
    }
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
}

// Singleton instance
const neo4jService = new Neo4jService();

export default neo4jService;