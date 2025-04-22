// src/pages/AuthorDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, MapPin, Award, Calendar } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import { useAuth } from '../auth/AuthContext';
import authorService from '../services/authorService';
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

// Error Boundary Component
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

const AuthorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    const loadAuthorDetails = async () => {
      try {
        setLoading(true);
        const authorData = await authorService.getAuthorById(id);
        
        if (!authorData) {
          navigate('/not-found');
          return;
        }
        
        setAuthor(authorData);
      } catch (error) {
        console.error("Error loading author details:", error);
        setError(error.message || "Failed to load author details");
      } finally {
        setLoading(false);
      }
    };
    
    loadAuthorDetails();
  }, [id, currentUser, navigate]);
  
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
  
  if (!author) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Author details not available.</div>
        </div>
      </div>
    );
  }
  
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
          
          {/* Author Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl font-bold">
                {author?.name ? safeToString(author.name.charAt(0)) : '?'}
              </div>
              
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-800">{safeToString(author?.name || 'Unknown Author')}</h1>
                <div className="flex flex-wrap mt-2">
                  {author?.birthYear && (
                    <div className="flex items-center text-sm text-gray-600 mr-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{safeToString(author.birthYear)} - {safeToString(author?.deathYear || 'Present')}</span>
                    </div>
                  )}
                  
                  {author?.nationality && (
                    <div className="flex items-center text-sm text-gray-600 mr-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{safeToString(author.nationality)}</span>
                    </div>
                  )}
                  
                  {author?.awards && author.awards.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{safeToString(author.awards.length)} Award{author.awards.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Author Bio */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Biography</h2>
            <div className="text-gray-700">
              {author?.bio ? (
                <p>{safeToString(author.bio)}</p>
              ) : (
                <p className="text-gray-500 italic">No biography available</p>
              )}
            </div>
          </div>
          
          {/* Author's Books */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Books by {safeToString(author?.name || 'Unknown Author')}</h2>
            
            {author?.books && author.books.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {author.books.map((book) => {
                  // Get color name from the utility function
                  const colorName = getConsistentColor(safeToString(book?.id || ''));
                  // Get the corresponding Tailwind class
                  const colorClass = getColorClass(colorName);
                  
                  return (
                    <div 
                      key={book?.id || Math.random()} 
                      className="cursor-pointer"
                      onClick={() => navigate(`/book/${safeToString(book?.id || '')}`)}
                    >
                      <div className={`${colorClass} h-48 rounded-lg shadow mb-2`}></div>
                      <div className="font-medium text-gray-800">{safeToString(book?.title || 'Untitled')}</div>
                      <div className="text-sm text-gray-600">
                        {book?.publishedYear && `Published: ${safeToString(book.publishedYear)}`}
                      </div>
                      <div className="flex items-center mt-1">
                        <Book className="h-4 w-4 text-indigo-500 mr-1" />
                        <span className="text-xs text-gray-500">View book</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No books found for this author</p>
            )}
          </div>
          
          {/* Author's Awards */}
          {author?.awards && author.awards.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Awards</h2>
              <ul className="list-disc list-inside space-y-2">
                {author.awards.map((award, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-medium">{safeToString(award?.name || 'Unknown Award')}</span>
                    {award?.year && <span className="text-gray-500"> ({safeToString(award.year)})</span>}
                    {award?.work && <span className="text-gray-500"> for {safeToString(award.work)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Similar Authors */}
          {author?.similarAuthors && author.similarAuthors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Similar Authors</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {author.similarAuthors.map((similarAuthor) => (
                  <div 
                    key={similarAuthor?.id || Math.random()}
                    className="text-center cursor-pointer"
                    onClick={() => navigate(`/author/${safeToString(similarAuthor?.id || '')}`)}
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mx-auto mb-2">
                      {similarAuthor?.name ? safeToString(similarAuthor.name.charAt(0)) : '?'}
                    </div>
                    <div className="text-sm font-medium text-gray-800">{safeToString(similarAuthor?.name || 'Unknown Author')}</div>
                    <div className="text-xs text-gray-500">
                      {safeToString(similarAuthor?.nationality || similarAuthor?.genre || '')}
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

// Export the component with the Error Boundary
export default function AuthorDetailPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AuthorDetailPage />
    </ErrorBoundary>
  );
};