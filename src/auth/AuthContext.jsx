import React, { createContext, useState, useContext, useEffect } from 'react';
import neo4jService from '../services/neo4jService';

// Create a context for authentication
const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on component mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };
    
    checkUserSession();
  }, []);

  // Sign in function - simplified to use only user ID
  const signIn = async (userId) => {
    try {
      setLoading(true);
      
      // Query Neo4j for user with this ID
      const query = `
        MATCH (u:USER)
        WHERE u.id = $userId
        RETURN u
      `;
      
      const records = await neo4jService.executeQuery(query, { userId });
      
      if (records.length === 0) {
        throw new Error('User not found');
      }
      
      const user = records[0].get('u').properties;
      
      // Store user in local storage
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // Register a new user - basic functionality
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Generate a unique ID for the new user
      const userCountResult = await neo4jService.executeQuery(
        `MATCH (u:USER) RETURN count(u) as count`
      );
      const userCount = userCountResult[0].get('count').toNumber();
      const userId = `USER-${userCount + 1}`;
      
      // Create new user node
      const createUserQuery = `
        CREATE (u:USER {
          id: $id,
          name: $name,
          email: $email,
          joinedDate: $joinedDate
        })
        RETURN u
      `;
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      const userResult = await neo4jService.executeQuery(createUserQuery, {
        id: userId,
        name: userData.name || '',
        email: userData.email || '',
        joinedDate: currentDate
      });
      
      const newUser = userResult[0].get('u').properties;
      
      // Store user in local storage
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Value for the context provider
  const value = {
    currentUser,
    loading,
    signIn,
    signOut,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

// Export the AuthProvider component as default
export default AuthProvider;