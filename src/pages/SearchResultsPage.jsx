// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Book, User, Tag, ArrowLeft } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import SearchBar from '../Components/SearchBar';
import searchService from '../services/searchService';
import { getConsistentColor } from '../utils/colorUtils';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ books: [], authors: [], genres: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Parse query from URL on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q');
    
    if (q) {
      setQuery(q);
      performSearch(q);
    } else {
      navigate('/');
    }
  }, [location.search, navigate]);
  
  // Perform search with current query
  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const searchResults = await searchService.search(searchQuery, 20);
      setResults(searchResults);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle new search from search bar
  const handleSearch = (newQuery, type, id) => {
    if (type && id) {
      // Direct navigation based on suggestion click
      switch (type) {
        case 'book':
          navigate(`/book/${id}`);
          return;
        case 'author':
          navigate(`/author/${id}`);
          return;
        case 'genre':
          navigate(`/genre/${id}`);
          return;
        default:
          break;
      }
    }
    
    // Update URL with new query
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };
  
  // Count total results
  const totalResults = results.books.length + results.authors.length + results.genres.length;
  
  // Get filtered results based on active tab
  const getFilteredResults = () => {
    switch (activeTab) {
      case 'books':
        return { ...results, authors: [], genres: [] };
      case 'authors':
        return { ...results, books: [], genres: [] };
      case 'genres':
        return { ...results, books: [], authors: [] };
      default:
        return results;
    }
  };
  
  const filteredResults = getFilteredResults();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopNavigation />
      
      <div className="flex-1">
        {/* Search header */}
        <div className="bg-indigo-600 text-white p-6">
          <SearchBar onSearch={handleSearch} initialQuery={query} />
        </div>
        
        {/* Results area */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="mr-3 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {loading ? 'Searching...' : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
            </h1>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'books' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('books')}
            >
              Books ({results.books.length})
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'authors' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('authors')}
            >
              Authors ({results.authors.length})
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'genres' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('genres')}
            >
              Genres ({results.genres.length})
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12 text-gray-700 bg-white rounded-lg shadow p-8">
              <p className="text-xl">No results found for "{query}"</p>
              <p className="text-gray-500 mt-4">Try a different search term or browse categories</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Book results */}
              {filteredResults.books.length > 0 && (
                <div>
                  {activeTab === 'all' && <h2 className="text-lg font-semibold mb-4 text-gray-800">Books</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResults.books.map(book => (
                      <div 
                        key={book.id} 
                        className="bg-white rounded-lg shadow p-4 flex cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/book/${book.id}`)}
                      >
                        <div className={`bg-${getConsistentColor(book.id)}-200 w-20 h-28 rounded flex-shrink-0`}></div>
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-800">{book.title}</h3>
                          <p className="text-sm text-gray-600">{book.author}</p>
                          {book.publishedYear && (
                            <p className="text-sm text-gray-500">Published: {book.publishedYear}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <Book className="h-4 w-4 text-indigo-500" />
                            <span className="text-xs text-gray-500 ml-1">View details</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Author results */}
              {filteredResults.authors.length > 0 && (
                <div>
                  {activeTab === 'all' && <h2 className="text-lg font-semibold mb-4 text-gray-800">Authors</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResults.authors.map(author => (
                      <div 
                        key={author.id} 
                        className="bg-white rounded-lg shadow p-4 flex cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/author/${author.id}`)}
                      >
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-800">{author.name}</h3>
                          {author.birthYear && (
                            <p className="text-sm text-gray-500">
                              {author.birthYear} - {author.deathYear || 'Present'}
                            </p>
                          )}
                          <div className="flex items-center mt-2">
                            <User className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-500 ml-1">View author</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Genre results */}
              {filteredResults.genres.length > 0 && (
                <div>
                  {activeTab === 'all' && <h2 className="text-lg font-semibold mb-4 text-gray-800">Genres</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResults.genres.map(genre => (
                      <div 
                        key={genre.id} 
                        className="bg-white rounded-lg shadow p-4 flex cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/genre/${genre.id}`)}
                      >
                        <div className={`w-12 h-12 rounded-full bg-${getConsistentColor(genre.name)}-100 flex items-center justify-center flex-shrink-0`}>
                          <Tag className={`h-6 w-6 text-${getConsistentColor(genre.name)}-600`} />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-800">{genre.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{genre.description || 'Explore books in this genre'}</p>
                          <div className="flex items-center mt-2">
                            <Tag className={`h-4 w-4 text-${getConsistentColor(genre.name)}-500`} />
                            <span className="text-xs text-gray-500 ml-1">Browse genre</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;