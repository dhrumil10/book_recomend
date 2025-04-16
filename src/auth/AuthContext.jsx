// AuthContext.jsx
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
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Sign in function (no password for simplicity)

  // Updated signIn function to allow login with user ID
const signIn = async (username) => {
    try {
      setLoading(true);
      
      // Modified query to search by ID instead of name/email
      const query = `
        MATCH (u:USER)
        WHERE u.id = $username
        RETURN u
      `;
      
      const records = await neo4jService.executeQuery(query, { username });
      
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

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // First check if user already exists
      const checkQuery = `
        MATCH (u:USER)
        WHERE u.email = $email OR u.name = $name
        RETURN count(u) as count
      `;
      
      const checkResult = await neo4jService.executeQuery(checkQuery, { 
        email: userData.email,
        name: userData.name
      });
      
      if (checkResult[0].get('count').toNumber() > 0) {
        throw new Error('User with this email or name already exists');
      }
      
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
          firstName: $firstName,
          lastName: $lastName,
          email: $email,
          age: $age,
          profession: $profession,
          relationshipStatus: $relationshipStatus,
          hobbies: $hobbies,
          activityLevel: $activityLevel
        })
        RETURN u
      `;
      
      const userResult = await neo4jService.executeQuery(createUserQuery, {
        id: userId,
        name: userData.name,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        age: parseInt(userData.age) || 0,
        profession: userData.profession || '',
        relationshipStatus: userData.relationshipStatus || '',
        hobbies: userData.hobbies || '',
        activityLevel: userData.activityLevel || 'Medium'
      });
      
      const newUser = userResult[0].get('u').properties;
      
      // Connect user to city/location if provided
      if (userData.city) {
        try {
          // Try to find existing city first
          const findCityQuery = `
            MATCH (c:CITY {name: $cityName})
            RETURN c
          `;
          
          const cityResult = await neo4jService.executeQuery(findCityQuery, { cityName: userData.city });
          
          let cityId;
          
          if (cityResult.length === 0) {
            // City doesn't exist, create a new one
            const cityCountResult = await neo4jService.executeQuery(
              `MATCH (c:CITY) RETURN count(c) as count`
            );
            const cityCount = cityCountResult[0].get('count').toNumber();
            cityId = `CITY-${cityCount + 1}`;
            
            // Create city
            await neo4jService.executeQuery(`
              CREATE (c:CITY {id: $id, name: $name})
              
              // Connect to state if available
              WITH c
              MATCH (s:STATE {id: $stateId})
              CREATE (c)-[:PART_OF]->(s)
            `, {
              id: cityId,
              name: userData.city,
              stateId: userData.state || 'STATE-1' // Default to first state if not specified
            });
          } else {
            cityId = cityResult[0].get('c').properties.id;
          }
          
          // Connect user to city
          await neo4jService.executeQuery(`
            MATCH (u:USER {id: $userId})
            MATCH (c:CITY {id: $cityId})
            CREATE (u)-[:LIVES_IN]->(c)
          `, { userId, cityId });
        } catch (error) {
          console.error('Error connecting user to location:', error);
          // Continue with registration even if location connection fails
        }
      }
      
      // Connect user to genre preferences if provided
      if (userData.genrePreferences && userData.genrePreferences.length > 0) {
        for (const genreName of userData.genrePreferences) {
          try {
            // Find or create genre
            const findGenreQuery = `
              MATCH (g:GENRE {name: $genreName})
              RETURN g
            `;
            
            const genreResult = await neo4jService.executeQuery(findGenreQuery, { genreName });
            
            let genreId;
            
            if (genreResult.length === 0) {
              // Genre doesn't exist, create a new one
              const genreCountResult = await neo4jService.executeQuery(
                `MATCH (g:GENRE) RETURN count(g) as count`
              );
              const genreCount = genreCountResult[0].get('count').toNumber();
              genreId = `GENRE-${genreCount + 1}`;
              
              // Create genre
              await neo4jService.executeQuery(`
                CREATE (g:GENRE {
                  id: $id, 
                  name: $name,
                  description: $description
                })
              `, {
                id: genreId,
                name: genreName,
                description: `Books in the ${genreName} category`
              });
            } else {
              genreId = genreResult[0].get('g').properties.id;
            }
            
            // Connect user to genre with random strength between 0.7 and 0.9
            const strength = (Math.floor(Math.random() * 3) + 7) / 10; // 0.7, 0.8, or 0.9
            
            await neo4jService.executeQuery(`
              MATCH (u:USER {id: $userId})
              MATCH (g:GENRE {id: $genreId})
              CREATE (u)-[:PREFERS_GENRE {strength: $strength}]->(g)
            `, { userId, genreId, strength });
          } catch (error) {
            console.error(`Error connecting user to genre ${genreName}:`, error);
            // Continue with other genres
          }
        }
      }
      
      // Connect user to author preferences if provided
      if (userData.authorPreferences && userData.authorPreferences.length > 0) {
        for (const authorName of userData.authorPreferences) {
          try {
            // Find or create author
            const findAuthorQuery = `
              MATCH (a:AUTHOR {name: $authorName})
              RETURN a
            `;
            
            const authorResult = await neo4jService.executeQuery(findAuthorQuery, { authorName });
            
            let authorId;
            
            if (authorResult.length === 0) {
              // Author doesn't exist, create a new one
              const authorCountResult = await neo4jService.executeQuery(
                `MATCH (a:AUTHOR) RETURN count(a) as count`
              );
              const authorCount = authorCountResult[0].get('count').toNumber();
              authorId = `AUTHOR-${authorCount + 1}`;
              
              // Create author with minimal details
              await neo4jService.executeQuery(`
                CREATE (a:AUTHOR {
                  id: $id, 
                  name: $name,
                  nationality: $nationality,
                  bio: $bio
                })
              `, {
                id: authorId,
                name: authorName,
                nationality: userData.authorNationality || 'Unknown',
                bio: `Author of various works`
              });
            } else {
              authorId = authorResult[0].get('a').properties.id;
            }
            
            // Connect user to author with random strength between 0.7 and 0.9
            const strength = (Math.floor(Math.random() * 3) + 7) / 10; // 0.7, 0.8, or 0.9
            
            await neo4jService.executeQuery(`
              MATCH (u:USER {id: $userId})
              MATCH (a:AUTHOR {id: $authorId})
              CREATE (u)-[:PREFERS_AUTHOR {strength: $strength}]->(a)
            `, { userId, authorId, strength });
          } catch (error) {
            console.error(`Error connecting user to author ${authorName}:`, error);
            // Continue with other authors
          }
        }
      }
      
      // Connect user to theme preferences if provided
      if (userData.themePreferences && userData.themePreferences.length > 0) {
        for (const themeName of userData.themePreferences) {
          try {
            // Find or create theme
            const findThemeQuery = `
              MATCH (t:THEME {name: $themeName})
              RETURN t
            `;
            
            const themeResult = await neo4jService.executeQuery(findThemeQuery, { themeName });
            
            let themeId;
            
            if (themeResult.length === 0) {
              // Theme doesn't exist, create a new one
              const themeCountResult = await neo4jService.executeQuery(
                `MATCH (t:THEME) RETURN count(t) as count`
              );
              const themeCount = themeCountResult[0].get('count').toNumber();
              themeId = `THEME-${themeCount + 1}`;
              
              // Create theme
              await neo4jService.executeQuery(`
                CREATE (t:THEME {
                  id: $id, 
                  name: $name,
                  description: $description
                })
              `, {
                id: themeId,
                name: themeName,
                description: `Books exploring the theme of ${themeName}`
              });
            } else {
              themeId = themeResult[0].get('t').properties.id;
            }
            
            // Connect user to theme with random strength between 0.7 and 0.9
            const strength = (Math.floor(Math.random() * 3) + 7) / 10; // 0.7, 0.8, or 0.9
            
            await neo4jService.executeQuery(`
              MATCH (u:USER {id: $userId})
              MATCH (t:THEME {id: $themeId})
              CREATE (u)-[:PREFERS_THEME {strength: $strength}]->(t)
            `, { userId, themeId, strength });
          } catch (error) {
            console.error(`Error connecting user to theme ${themeName}:`, error);
            // Continue with other themes
          }
        }
      }
      
      // Create reading context for the user
      try {
        const readingContextQuery = `
          CREATE (rc:READING_CONTEXT {
            id: $id,
            environment: $environment,
            environmentPreference: $environmentPreference,
            timeOfDay: $timeOfDay,
            timePreference: $timePreference,
            formatPreference: $formatPreference,
            readingDuration: $readingDuration,
            updateDate: $updateDate
          })
          WITH rc
          MATCH (u:USER {id: $userId})
          CREATE (u)-[:HAS_READING_CONTEXT]->(rc)
        `;
        
        // Default reading context values
        const environment = userData.readingEnvironment || 'home, cafe, commute';
        const timeOfDay = userData.readingTime || 'morning, evening, weekend';
        
        // Create JSON preference objects
        const envPrefs = {};
        environment.split(',').forEach((env, i) => {
          const trimmed = env.trim();
          if (trimmed) {
            envPrefs[trimmed] = 5 - i % 3; // 5, 4, or 3
          }
        });
        
        const timePrefs = {};
        timeOfDay.split(',').forEach((time, i) => {
          const trimmed = time.trim();
          if (trimmed) {
            timePrefs[trimmed] = 5 - i % 3; // 5, 4, or 3
          }
        });
        
        // Default format preferences
        const formatPrefs = {
          "physical": userData.formatPreference === 'physical' ? 5 : 3,
          "ebook": userData.formatPreference === 'ebook' ? 5 : 3,
          "audiobook": userData.formatPreference === 'audiobook' ? 5 : 2
        };
        
        const readingContextId = `RC-${userId}`;
        
        await neo4jService.executeQuery(readingContextQuery, {
          id: readingContextId,
          environment: environment,
          environmentPreference: JSON.stringify(envPrefs),
          timeOfDay: timeOfDay,
          timePreference: JSON.stringify(timePrefs),
          formatPreference: JSON.stringify(formatPrefs),
          readingDuration: userData.readingDuration || '45min',
          updateDate: new Date().toISOString(),
          userId
        });
      } catch (error) {
        console.error('Error creating reading context:', error);
        // Continue with registration even if reading context creation fails
      }
      
      // Store user in local storage and update state
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export the AuthProvider component as default
export default AuthProvider;