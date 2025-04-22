// src/pages/GenreDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, User, Tag, Filter } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import { useAuth } from '../auth/AuthContext';
import genreService from '../services/genreService';
import { getConsistentColor } from '../utils/colorUtils';

// Function to map color names to Tailwind classes
const getColorClass = (colorName) => {
  const colorMap = {
    'red': 'bg-red-200',
    'blue': 'bg-blue-200',
    'green': 'bg-green-200',
    'yellow': 'bg-yellow-200',
    'purple': 'bg-purple-200',
    'pink': 'bg-pink-200',
    'indigo': 'bg-indigo-200',
    'gray': 'bg-gray-200',
    // Add more colors as needed
    // Default fallback
    'default': 'bg-gray-200'
  };
  
  return colorMap[colorName] || colorMap.default;
};

// Function for text color classes
const getTextColorClass = (colorName) => {
  const colorMap = {
    'red': 'text-red-600',
    'blue': 'text-blue-600',
    'green': 'text-green-600',
    'yellow': 'text-yellow-600',
    'purple': 'text-purple-600',
    'pink': 'text-pink-600',
    'indigo': 'text-indigo-600',
    'gray': 'text-gray-600',
    // Default fallback
    'default': 'text-gray-600'
  };
  
  return colorMap[colorName] || colorMap.default;
};

// Function for background hover classes
const getHoverBgClass = (colorName) => {
  const colorMap = {
    'red': 'hover:bg-red-200',
    'blue': 'hover:bg-blue-200',
    'green': 'hover:bg-green-200',
    'yellow': 'hover:bg-yellow-200',
    'purple': 'hover:bg-purple-200',
    'pink': 'hover:bg-pink-200',
    'indigo': 'hover:bg-indigo-200',
    'gray': 'hover:bg-gray-200',
    // Default fallback
    'default': 'hover:bg-gray-200'
  };
  
  return colorMap[colorName] || colorMap.default;
};

// Function for light background classes
const getLightBgClass = (colorName) => {
  const colorMap = {
    'red': 'bg-red-100',
    'blue': 'bg-blue-100',
    'green': 'bg-green-100',
    'yellow': 'bg-yellow-100',
    'purple': 'bg-purple-100',
    'pink': 'bg-pink-100',
    'indigo': 'bg-indigo-100',
    'gray': 'bg-gray-100',
    // Default fallback
    'default': 'bg-gray-100'
  };
  
  return colorMap[colorName] || colorMap.default;
};

// Function for text darker color classes
const getDarkTextColorClass = (colorName) => {
  const colorMap = {
    'red': 'text-red-700',
    'blue': 'text-blue-700',
    'green': 'text-green-700',
    'yellow': 'text-yellow-700',
    'purple': 'text-purple-700',
    'pink': 'text-pink-700',
    'indigo': 'text-indigo-700',
    'gray': 'text-gray-700',
    // Default fallback
    'default': 'text-gray-700'
  };
  
  return colorMap[colorName] || colorMap.default;
};

// Helper function to safely convert objects to string representation
const safeToString = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    // If object has a toString method, use it
    if (value.toString !== Object.prototype.toString) {
      return value.toString();
    }
    
    // Handle objects with low/high properties (likely Firestore numeric values)
    if (value.hasOwnProperty('low') && value.hasOwnProperty('high')) {
      return `${value.low}`;
    }
    
    // For other objects, convert to JSON string
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }
  
  return String(value);
};

// Create an Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-700 mb-4">The application encountered an error.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const GenreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity'); // popularity, rating, newest
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    const loadGenreDetails = async () => {
      try {
        setLoading(true);
        const genreData = await genreService.getGenreById(id);
        
        if (!genreData) {
          navigate('/not-found');
          return;
        }
        
        setGenre(genreData);
      } catch (error) {
        console.error("Error loading genre details:", error);
        setError(error.message || "Failed to load genre details");
      } finally {
        setLoading(false);
      }
    };
    
    loadGenreDetails();
  }, [id, currentUser, navigate]);
  
  // Sort books based on selected sorting option
  const getSortedBooks = () => {
    if (!genre?.books) return [];
    
    const booksCopy = [...genre.books];
    
    switch (sortBy) {
      case 'popularity':
        return booksCopy.sort((a, b) => {
          const aCount = a.readersCount ? (typeof a.readersCount === 'object' && a.readersCount.hasOwnProperty('low') ? a.readersCount.low : a.readersCount) : 0;
          const bCount = b.readersCount ? (typeof b.readersCount === 'object' && b.readersCount.hasOwnProperty('low') ? b.readersCount.low : b.readersCount) : 0;
          return bCount - aCount;
        });
      case 'rating':
        return booksCopy.sort((a, b) => {
          const aRating = a.averageRating ? (typeof a.averageRating === 'object' && a.averageRating.hasOwnProperty('low') ? a.averageRating.low : a.averageRating) : 0;
          const bRating = b.averageRating ? (typeof b.averageRating === 'object' && b.averageRating.hasOwnProperty('low') ? b.averageRating.low : b.averageRating) : 0;
          return bRating - aRating;
        });
      case 'newest':
        return booksCopy.sort((a, b) => {
          const aYear = a.publishedYear ? (typeof a.publishedYear === 'object' && a.publishedYear.hasOwnProperty('low') ? a.publishedYear.low : a.publishedYear) : 0;
          const bYear = b.publishedYear ? (typeof b.publishedYear === 'object' && b.publishedYear.hasOwnProperty('low') ? b.publishedYear.low : b.publishedYear) : 0;
          return bYear - aYear;
        });
      default:
        return booksCopy;
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }
  
  if (!genre) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Genre details not available.</div>
        </div>
      </div>
    );
  }
  
  const sortedBooks = getSortedBooks();
  
  // Get colors for the genre
  const genreColorName = getConsistentColor(safeToString(genre?.name || ''));
  const genreLightBgClass = getLightBgClass(genreColorName);
  const genreBgClass = getColorClass(genreColorName);
  const genreTextClass = getTextColorClass(genreColorName);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopNavigation />
      
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-4">
          {/* Navigation */}
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </button>
          </div>
          
          {/* Genre Header */}
          <div className={`${genreLightBgClass} rounded-lg shadow p-6 mb-6`}>
            <div className="flex items-center">
              <div className={`w-16 h-16 rounded-full ${genreBgClass} flex items-center justify-center ${genreTextClass} flex-shrink-0`}>
                <Tag className="h-8 w-8" />
              </div>
              
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-800">{safeToString(genre?.name)}</h1>
                <div className="flex items-center mt-2">
                  <Book className="h-4 w-4 text-gray-600 mr-1" />
                  <span className="text-sm text-gray-600">{safeToString(genre?.bookCount || 0)} Books</span>
                  
                  {genre?.readerCount && Number(safeToString(genre.readerCount)) > 0 && (
                    <div className="flex items-center ml-4">
                      <User className="h-4 w-4 text-gray-600 mr-1" />
                      <span className="text-sm text-gray-600">{safeToString(genre.readerCount)} Readers</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Genre Description */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">About {safeToString(genre?.name)}</h2>
            <div className="text-gray-700">
              {genre?.description ? (
                <p>{safeToString(genre.description)}</p>
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>
          </div>
          
          {/* Books in this genre */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Books in {safeToString(genre?.name)}</h2>
              
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-500 mr-1" />
                <select 
                  className="text-sm border-none bg-transparent focus:outline-none text-gray-600"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            
            {sortedBooks && sortedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedBooks.map((book) => {
                  if (!book) return null;
                  const bookColorName = getConsistentColor(safeToString(book?.id || ''));
                  const bookColorClass = getColorClass(bookColorName);
                  
                  return (
                    <div 
                      key={safeToString(book?.id || Math.random())} 
                      className="flex cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      onClick={() => navigate(`/book/${safeToString(book?.id || '')}`)}
                    >
                      <div className={`${bookColorClass} w-20 h-28 rounded shadow flex-shrink-0`}></div>
                      
                      <div className="ml-4">
                        <div className="font-medium text-gray-800">{safeToString(book?.title || 'Untitled')}</div>
                        <div className="text-sm text-gray-600">
                          by {safeToString(book?.author || 'Unknown Author')}
                        </div>
                        
                        <div className="flex flex-wrap mt-2">
                          {book?.publishedYear && (
                            <div className="text-xs text-gray-500 mr-3">
                              Published: {safeToString(book.publishedYear)}
                            </div>
                          )}
                          
                          {book?.averageRating && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="h-3 w-3 text-yellow-500 fill-current mr-1" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                              <span>{safeToString(book.averageRating)} ({safeToString(book?.ratingsCount || 0)})</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-2">
                          <Book className="h-3 w-3 text-indigo-500 mr-1" />
                          <span className="text-xs text-gray-500">View details</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No books found in this genre</p>
            )}
          </div>
          
          {/* Popular authors in this genre */}
          {genre?.popularAuthors && genre.popularAuthors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Authors in {safeToString(genre?.name)}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {genre.popularAuthors.map((author) => {
                  if (!author) return null;
                  return (
                    <div 
                      key={safeToString(author?.id || Math.random())}
                      className="text-center cursor-pointer"
                      onClick={() => navigate(`/author/${safeToString(author?.id || '')}`)}
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mx-auto mb-2">
                        <div>{author?.name ? safeToString(author.name.charAt(0)) : '?'}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-800">{safeToString(author?.name || 'Unknown')}</div>
                      <div className="text-xs text-gray-500">
                        {safeToString(author?.bookCount || 0)} {Number(safeToString(author?.bookCount || 0)) === 1 ? 'book' : 'books'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Related genres */}
          {genre?.relatedGenres && genre.relatedGenres.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Related Genres</h2>
              
              <div className="flex flex-wrap">
                {genre.relatedGenres.map((relatedGenre) => {
                  if (!relatedGenre) return null;
                  const relatedGenreColorName = getConsistentColor(safeToString(relatedGenre?.name || ''));
                  const relatedGenreBgClass = getLightBgClass(relatedGenreColorName);
                  const relatedGenreTextClass = getDarkTextColorClass(relatedGenreColorName);
                  const relatedGenreHoverClass = getHoverBgClass(relatedGenreColorName);
                  
                  return (
                    <div 
                      key={safeToString(relatedGenre?.id || Math.random())}
                      className={`${relatedGenreBgClass} ${relatedGenreTextClass} px-3 py-2 rounded-lg mr-2 mb-2 cursor-pointer ${relatedGenreHoverClass}`}
                      onClick={() => navigate(`/genre/${safeToString(relatedGenre?.id || '')}`)}
                    >
                      <div>{safeToString(relatedGenre?.name || 'Unknown')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the component with the Error Boundary
export default function GenreDetailPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <GenreDetailPage />
    </ErrorBoundary>
  );
};