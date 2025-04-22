import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import searchService from '../services/searchService';

const SearchBar = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  
  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchService.getSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce for better performance
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSearch(suggestion.text, suggestion.type, suggestion.id);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query);
    }
  };
  
  // Get icon for suggestion type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'book':
        return <span className="text-indigo-500 text-xs">📚 Book</span>;
      case 'author':
        return <span className="text-green-500 text-xs">✍️ Author</span>;
      case 'genre':
        return <span className="text-purple-500 text-xs">🏷️ Genre</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg text-gray-700 p-2 flex items-center">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input 
            type="text"
            placeholder="Search by title, author, or genre..."
            className="bg-transparent outline-none w-full"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {loading && (
            <div className="w-4 h-4 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
          )}
        </div>
      </form>
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-gray-800"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="truncate">{suggestion.text}</span>
              {getTypeIcon(suggestion.type)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;