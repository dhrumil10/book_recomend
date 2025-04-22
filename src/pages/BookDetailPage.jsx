// src/pages/BookDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, Users, Clock, BookOpen, Heart, Calendar, 
  FileText, Check, Award, Languages, Film, Tag
} from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import { useAuth } from '../auth/AuthContext';
import bookService from '../services/bookService';
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

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingStatus, setReadingStatus] = useState('none'); // none, want-to-read, reading, finished
  const [userRating, setUserRating] = useState(0);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    const loadBookDetails = async () => {
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(id);
        
        if (!bookData) {
          navigate('/not-found');
          return;
        }
        
        setBook(bookData);
        
        // Get user's reading status for this book
        const status = await bookService.getUserBookStatus(currentUser.id, id);
        setReadingStatus(status?.status || 'none');
        setUserRating(status?.rating || 0);
      } catch (error) {
        console.error("Error loading book details:", error);
        setError(error.message || "Failed to load book details");
      } finally {
        setLoading(false);
      }
    };
    
    loadBookDetails();
  }, [id, currentUser, navigate]);
  
  const handleStatusChange = async (newStatus) => {
    try {
      await bookService.updateUserBookStatus(currentUser.id, id, newStatus);
      setReadingStatus(newStatus);
    } catch (error) {
      console.error("Error updating reading status:", error);
    }
  };
  
  const handleRatingChange = async (rating) => {
    try {
      await bookService.rateBook(currentUser.id, id, rating);
      setUserRating(rating);
    } catch (error) {
      console.error("Error setting rating:", error);
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
  
  if (!book) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Book details not available.</div>
        </div>
      </div>
    );
  }
  
  // Safely get color for book cover
  const bookColorName = getConsistentColor(book?.id || '');
  const bookColorClass = getColorClass(bookColorName);
  
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
          
          {/* Book Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row">
              <div className={`${bookColorClass} w-32 h-48 rounded shadow-md flex-shrink-0 mb-4 md:mb-0`}></div>
              
              <div className="md:ml-6 flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{safeToString(book?.title) || 'Untitled'}</h1>
                <p className="text-lg text-indigo-600 mb-2">
                  by <span 
                    className="cursor-pointer hover:underline" 
                    onClick={() => navigate(`/author/${safeToString(book?.authorId || '')}`)}
                  >
                    {safeToString(book?.author) || 'Unknown Author'}
                  </span>
                </p>
                
                {/* Book meta information */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {book?.publishedYear && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Published: {safeToString(book.publishedYear)}</span>
                    </div>
                  )}
                  
                  {book?.pageCount && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{safeToString(book.pageCount)} pages</span>
                    </div>
                  )}
                  
                  {book?.language && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Languages className="h-4 w-4 mr-1" />
                      <span>Language: {safeToString(book.language)}</span>
                    </div>
                  )}
                  
                  {book?.averageRating && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span>{safeToString(book.averageRating)} ({safeToString(book?.ratingsCount || 0)} ratings)</span>
                    </div>
                  )}
                </div>
                
                {/* Book tags/genres */}
                {book?.genres && book.genres.length > 0 && (
                  <div className="flex flex-wrap mb-4">
                    {book.genres.map((genre, index) => {
                      const genreId = typeof genre === 'object' ? genre?.id : genre;
                      const genreName = typeof genre === 'object' ? genre?.name : genre;
                      
                      if (!genreName) return null;
                      
                      const genreColor = getConsistentColor(safeToString(genreName));
                      const genreBgClass = getLightBgClass(genreColor);
                      const genreTextClass = getTextColorClass(genreColor);
                      const genreHoverClass = getHoverBgClass(genreColor);
                      
                      return (
                        <div 
                          key={index}
                          className={`${genreBgClass} ${genreTextClass} px-2 py-1 rounded-full text-xs mr-2 mb-2 cursor-pointer ${genreHoverClass}`}
                          onClick={() => navigate(`/genre/${safeToString(genreId || genreName)}`)}
                        >
                          {safeToString(genreName)}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* User actions */}
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                      readingStatus === 'want-to-read' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleStatusChange('want-to-read')}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Want to Read
                  </button>
                  
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                      readingStatus === 'reading' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleStatusChange('reading')}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Reading
                  </button>
                  
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                      readingStatus === 'finished' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleStatusChange('finished')}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Finished
                  </button>
                </div>
                
                {/* Rating */}
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-1">Your Rating:</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 cursor-pointer ${
                          star <= userRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                        onClick={() => handleRatingChange(star)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Book Description */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
            <div className="text-gray-700">
              {book?.description ? (
                <p>{safeToString(book.description)}</p>
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>
          </div>
          
          {/* Reading statistics */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reading Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-indigo-700">{safeToString(book?.readersCount || 0)}</div>
                <div className="text-xs text-gray-600">Currently Reading</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{safeToString(book?.finishedCount || 0)}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-700">{safeToString(book?.averageRating || '0.0')}</div>
                <div className="text-xs text-gray-600">Average Rating</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{safeToString(book?.averageReadingTime || 'N/A')}</div>
                <div className="text-xs text-gray-600">Average Reading Time</div>
              </div>
            </div>
          </div>
          
          {/* Friends reading this book */}
          {book?.friendsReading && book.friendsReading.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Friends Reading This Book</h2>
              <div className="space-y-4">
                {book.friendsReading.map((friend) => (
                  <div key={friend?.id || Math.random()} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <div className="text-gray-600">{
                        friend?.name ? safeToString(friend.name.charAt(0)) : '?'
                      }</div>
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-800">{safeToString(friend?.name || 'Unknown')}</div>
                      <div className="text-xs text-gray-500">
                        {friend?.status === 'reading' ? 'Currently reading' : 
                         friend?.status === 'finished' ? 'Has finished reading' : 
                         'Wants to read'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Similar books */}
          {book?.similarBooks && book.similarBooks.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Similar Books</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {book.similarBooks.map((similarBook) => {
                  const similarBookColor = getConsistentColor(safeToString(similarBook?.id || ''));
                  const similarBookColorClass = getColorClass(similarBookColor);
                  
                  return (
                    <div 
                      key={similarBook?.id || Math.random()}
                      className="cursor-pointer"
                      onClick={() => navigate(`/book/${safeToString(similarBook?.id || '')}`)}
                    >
                      <div className={`${similarBookColorClass} h-32 rounded-lg shadow mb-2`}></div>
                      <div className="text-sm font-medium text-gray-800 truncate">{safeToString(similarBook?.title || 'Untitled')}</div>
                      <div className="text-xs text-gray-500">{safeToString(similarBook?.author || 'Unknown Author')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Book adaptations */}
          {book?.adaptations && book.adaptations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Adaptations</h2>
              <div className="space-y-4">
                {book.adaptations.map((adaptation) => (
                  <div key={adaptation?.id || Math.random()} className="flex items-start">
                    <div className="bg-red-100 w-16 h-24 rounded flex-shrink-0"></div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-800">{safeToString(adaptation?.title || 'Untitled')}</div>
                      <div className="text-sm text-gray-600">{safeToString(adaptation?.releaseYear || '')}</div>
                      <div className="text-xs text-gray-500 mt-1">Director: {safeToString(adaptation?.director || 'Unknown')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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

// Export the component with the Error Boundary
export default function BookDetailPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <BookDetailPage />
    </ErrorBoundary>
  );
};