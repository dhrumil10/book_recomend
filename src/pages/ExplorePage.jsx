import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, TrendingUp, Award, BookOpen, MapPin } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import agentService from '../services/agentService';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch books based on active category
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let fetchedBooks = [];
        
        // Fetch books based on the active category
        switch (activeCategory) {
          case 'trending':
            console.log('Fetching trending books...');
            fetchedBooks = await agentService.getTrendingBooks();
            break;
            
          case 'bestsellers':
            console.log('Fetching bestseller books...');
            fetchedBooks = await agentService.getBestsellerBooks();
            break;
            
          case 'new':
            console.log('Fetching new releases...');
            fetchedBooks = await agentService.getNewReleases();
            break;
            
          case 'local':
            console.log('Fetching nearby books...');
            fetchedBooks = await agentService.getNearbyBooks();
            break;
            
          case 'genres':
            if (selectedGenre) {
              console.log(`Fetching books for genre: ${selectedGenre}...`);
              fetchedBooks = await agentService.getBooksByGenre(selectedGenre);
            } else {
              // If we're on genres but no genre is selected, just show an empty list
              fetchedBooks = [];
            }
            break;
            
          default:
            fetchedBooks = [];
        }
        
        console.log(`Received ${fetchedBooks.length} books for category: ${activeCategory}`);
        
        if (fetchedBooks && fetchedBooks.length > 0) {
          // Add readers count if not present
          const processedBooks = fetchedBooks.map(book => ({
            ...book,
            genres: book.genres || [book.genre || 'Fiction'].filter(Boolean),
            readers: book.readers || Math.floor(Math.random() * 5000) + 500
          }));
          
          setBooks(processedBooks);
        } else {
          console.log('No books returned, using defaults');
          setBooks(defaultBooks);
        }
      } catch (error) {
        console.error(`Error fetching ${activeCategory} books:`, error);
        setError(`Failed to load ${activeCategory} books. Using default recommendations instead.`);
        // Fallback to default books if there's an error
        setBooks(defaultBooks);
      } finally {
        setLoading(false);
      }
    };
    
    // Load genres when on the genres category
    const fetchGenres = async () => {
      if (activeCategory === 'genres' && genres.length === 0) {
        try {
          const fetchedGenres = await agentService.getGenres();
          setGenres(fetchedGenres);
        } catch (error) {
          console.error('Error fetching genres:', error);
          setGenres(defaultGenreItems);
        }
      }
    };
    
    fetchBooks();
    fetchGenres();
  }, [activeCategory, selectedGenre]);
  
  const categories = [
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'bestsellers', name: 'Bestsellers', icon: Award },
    { id: 'new', name: 'New Releases', icon: Clock },
    { id: 'local', name: 'Near You', icon: MapPin },
    { id: 'genres', name: 'Genres', icon: BookOpen }
  ];
  
  // Default genres if API fails
  const defaultGenreItems = [
    { name: 'Science Fiction', color: 'bg-indigo-100', textColor: 'text-indigo-700' },
    { name: 'Fantasy', color: 'bg-purple-100', textColor: 'text-purple-700' },
    { name: 'Mystery', color: 'bg-green-100', textColor: 'text-green-700' },
    { name: 'Romance', color: 'bg-pink-100', textColor: 'text-pink-700' },
    { name: 'Thriller', color: 'bg-red-100', textColor: 'text-red-700' },
    { name: 'Historical Fiction', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
    { name: 'Literary Fiction', color: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'Biography', color: 'bg-gray-100', textColor: 'text-gray-700' },
    { name: 'Self-help', color: 'bg-teal-100', textColor: 'text-teal-700' },
    { name: 'Horror', color: 'bg-orange-100', textColor: 'text-orange-700' },
    { name: 'Adventure', color: 'bg-cyan-100', textColor: 'text-cyan-700' },
    { name: 'Classic', color: 'bg-amber-100', textColor: 'text-amber-700' }
  ];
  
  // Default books as fallback
  const defaultBooks = [
    {
      id: 1,
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      cover: 'bg-green-200',
      genres: ['Thriller', 'Mystery'],
      readers: 3200
    },
    {
      id: 2,
      title: 'Lessons in Chemistry',
      author: 'Bonnie Garmus',
      cover: 'bg-blue-200',
      genres: ['Fiction', 'History'],
      readers: 2700
    },
    {
      id: 3,
      title: 'Tomorrow Will Be Better',
      author: 'Sarah Dessen',
      cover: 'bg-green-100',
      genres: ['Contemporary', 'Young Adult'],
      readers: 1900
    },
    {
      id: 4,
      title: 'The Mountain is You',
      author: 'Brianna Wiest',
      cover: 'bg-orange-100',
      genres: ['Self-help', 'Psychology'],
      readers: 2200
    }
  ];
  
  // Handle genre selection
  const handleGenreClick = (genreName) => {
    setSelectedGenre(genreName);
  };
  
  const getColorForGenre = (genre) => {
    const allGenres = activeCategory === 'genres' ? genres : defaultGenreItems;
    const found = allGenres.find(item => item.name === genre);
    if (found) {
      return { bg: found.color, text: found.textColor };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700' };
  };
  
  // Handle category change - reset selected genre when changing categories
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId !== 'genres') {
      setSelectedGenre(null);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16 overflow-auto">
      <TopNavigation title="Explore" />
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Search Bar */}
        <div className="bg-indigo-600 text-white p-6">
          <div className="bg-white rounded-lg text-gray-700 p-2 flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by title, author, or genre..." 
              className="bg-transparent outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-gray-100 p-1 rounded">
              <Filter className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex overflow-x-auto p-4 space-x-3">
          {categories.map(category => (
            <div 
              key={category.id}
              className={`flex-shrink-0 flex flex-col items-center cursor-pointer ${
                activeCategory === category.id ? 'text-indigo-600' : 'text-gray-500'
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                activeCategory === category.id ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                <category.icon className="h-6 w-6" />
              </div>
              <span className="text-xs">{category.name}</span>
            </div>
          ))}
        </div>
        
        {/* Genres Grid (only shown when genres category is active) */}
        {activeCategory === 'genres' && (
          <div className="grid grid-cols-3 gap-2 px-4 mb-4">
            {(genres.length > 0 ? genres : defaultGenreItems).map((genre, index) => (
              <div
                key={index}
                className={`${genre.color} ${genre.textColor} p-3 rounded-lg text-center text-sm font-medium cursor-pointer ${
                  selectedGenre === genre.name ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => handleGenreClick(genre.name)}
              >
                {genre.name}
              </div>
            ))}
          </div>
        )}
        
        {/* Book List */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-3">
            {activeCategory === 'trending' && 'Trending Books'}
            {activeCategory === 'bestsellers' && 'Bestseller Books'}
            {activeCategory === 'new' && 'New Release Books'}
            {activeCategory === 'local' && 'Popular in Your Area'}
            {activeCategory === 'genres' && selectedGenre ? `${selectedGenre} Books` : 'Popular in All Genres'}
          </h2>
          
          {/* Show error message if there is one */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {books.length > 0 ? (
                books.map(book => (
                  <div key={book.id} className="bg-white rounded-lg shadow p-3 flex">
                    <div className={`${book.cover} w-16 h-24 rounded flex-shrink-0`}></div>
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-sm">{book.title}</div>
                      <div className="text-xs text-gray-500 mb-1">{book.author}</div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {book.genres && book.genres.map((genre, idx) => {
                          const colors = getColorForGenre(genre);
                          return (
                            <span key={idx} className={`${colors.bg} ${colors.text} text-xs px-2 py-0.5 rounded-full`}>
                              {genre}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>{book.readers.toLocaleString()} people reading</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500">
                    {activeCategory === 'genres' && !selectedGenre 
                      ? 'Select a genre to see books' 
                      : 'No books available.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Reading Challenges */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-3">Reading Challenges</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-bold">2025 Reading Challenge</h3>
              <div className="text-sm text-gray-500 mb-2">12 of 16 books completed</div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">Themed Challenges</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm">Around the World (6/10)</div>
                  <button className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">Join</button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Sci-Fi Summer (0/5)</div>
                  <button className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">Join</button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Classics Challenge (2/12)</div>
                  <button className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">Join</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;