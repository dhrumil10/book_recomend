import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, TrendingUp, Calendar, Film, Clock, Heart } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import SearchBar from '../Components/SearchBar';
import { useAuth } from '../auth/AuthContext';
import bookDataService from '../services/bookDataService';
import searchService from '../services/searchService';
import { getConsistentColor } from '../utils/colorUtils';


// Component for currently reading books section
const CurrentlyReadingSection = ({ books }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Continue Reading</h2>
        <span className="text-indigo-600 text-sm cursor-pointer">See All</span>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="flex-shrink-0 w-32">
              <div className={`bg-${getConsistentColor(book.id)}-200 h-44 rounded-lg shadow-md relative`}>
                <div className={`absolute bottom-0 left-0 right-0 bg-${getConsistentColor(book.id)}-700 text-white text-xs p-1 rounded-b-lg text-center`}>
                  {book.progress}% complete
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold text-sm truncate">{book.title}</div>
                <div className="text-xs text-gray-500">{book.author}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex justify-center items-center py-8">
            <p className="text-gray-500">No books in progress.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for trending books section
const TrendingBooksSection = ({ books }) => {
  return (
    <div className="p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-lg font-bold">Trending Now</h2>
        </div>
        <div className="bg-gray-200 rounded-full px-3 py-1 text-xs">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        <div className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-medium text-sm whitespace-nowrap">In Your Genres</div>
        <div className="px-4 py-2 text-gray-500 text-sm whitespace-nowrap">Social Media</div>
        <div className="px-4 py-2 text-gray-500 text-sm whitespace-nowrap">Book Clubs</div>
        <div className="px-4 py-2 text-gray-500 text-sm whitespace-nowrap">Your Location</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow p-3 flex">
              <div className={`bg-${getConsistentColor(book.id)}-200 w-16 h-24 rounded flex-shrink-0`}></div>
              <div className="ml-3 flex-1">
                <div className="font-semibold text-sm">{book.title}</div>
                <div className="text-xs text-gray-500 mb-1">{book.author}</div>
                <div className="flex space-x-1 mb-1">
                  {book.genres && book.genres.map((genre, index) => (
                    <span 
                      key={index} 
                      className={`bg-${getConsistentColor(genre)}-100 text-${getConsistentColor(genre)}-700 text-xs px-2 py-0.5 rounded-full`}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{book.readers?.toLocaleString() || 0} reading now</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 flex justify-center items-center py-8">
            <p className="text-gray-500">No trending books available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for upcoming events section
const UpcomingEventsSection = ({ events }) => {
  if (!events || events.length === 0) return null;
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
          <h2 className="text-lg font-bold">Upcoming Events</h2>
        </div>
        <span className="text-indigo-600 text-sm cursor-pointer">View All</span>
      </div>
      
      {events.map((event) => {
        const eventDate = new Date(event.date);
        return (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-start">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded text-center mr-4 flex-shrink-0">
                <div className="text-sm font-bold">{eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                <div className="text-xl font-bold">{eventDate.getDate()}</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{event.name}</h3>
                <div className="text-sm text-gray-500 mb-2">
                  {event.location} • {event.friendsAttending} of your friends attending
                </div>
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    <div className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-400 border border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-500 border border-white"></div>
                  </div>
                  <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full">RSVP</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Component for book recommendations section
const RecommendedBooksSection = ({ books }) => {
  return (
    <div className="p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">For You</h2>
        <div className="flex">
          <span className="text-xs text-gray-500 mr-2">Based on:</span>
          <select className="text-xs bg-gray-200 rounded px-2 py-1">
            <option>Similar Users</option>
            <option>Friends' Activity</option>
            <option>Your Profession</option>
          </select>
        </div>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="flex-shrink-0 w-32">
              <div className={`bg-${getConsistentColor(book.id)}-200 h-44 rounded-lg shadow-md`}></div>
              <div className="mt-2">
                <div className="font-semibold text-sm truncate">{book.title}</div>
                <div className="text-xs text-gray-500">{book.author}</div>
                <div className="flex items-center mt-1">
                  <Heart className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-gray-500">{book.matchPercent}% match</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex justify-center items-center py-8">
            <p className="text-gray-500">No recommendations available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for recently added books and adaptations
const RecentlyAddedSection = ({ recentBooks, adaptations }) => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center mb-3">
            <Clock className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-base font-bold">Recently Added</h2>
          </div>
          {recentBooks.length > 0 ? (
            recentBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow p-3 mb-2">
                <div className="flex items-center">
                  <div className={`bg-${getConsistentColor(book.id)}-100 w-10 h-14 rounded flex-shrink-0`}></div>
                  <div className="ml-3">
                    <div className="font-semibold text-sm">{book.title}</div>
                    <div className="text-xs text-gray-500">Added {book.daysAgo} days ago</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-3 mb-2 text-center">
              <p className="text-gray-500">No recently added books.</p>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-3">
            <Film className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-base font-bold">Now on Screen</h2>
          </div>
          {adaptations.length > 0 ? (
            adaptations.map((adaptation) => (
              <div key={adaptation.id} className="bg-white rounded-lg shadow p-3 relative">
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">New!</div>
                <div className="flex items-center">
                  <div className="bg-red-100 w-10 h-14 rounded flex-shrink-0"></div>
                  <div className="ml-3">
                    <div className="font-semibold text-sm">{adaptation.title}</div>
                    <div className="text-xs text-gray-500">
                      {adaptation.hasRead ? 'You read this book' : 'Based on ' + adaptation.bookTitle}
                    </div>
                    <div className="text-xs text-indigo-600 mt-1 cursor-pointer">Watch trailer</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-3 relative text-center">
              <p className="text-gray-500">No adaptations available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main HomePage component
const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [currentBooks, setCurrentBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState([]);
  const [adaptations, setAdaptations] = useState([]);

  // Fetch all data needed for the homepage
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    const fetchHomePageData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel for performance
        const [
          currentBooksData,
          trendingBooksData,
          recommendedBooksData,
          upcomingEventsData,
          recentlyAddedBooksData,
          adaptationsData
        ] = await Promise.allSettled([
          bookDataService.getCurrentlyReadingBooks(currentUser.id),
          bookDataService.getTrendingBooks(),
          bookDataService.getBookRecommendations(currentUser.id),
          bookDataService.getUpcomingEvents(currentUser.id),
          bookDataService.getRecentlyAddedBooks(),
          bookDataService.getBookAdaptations(currentUser.id)
        ]);
        
        // Set data from successful requests, empty arrays for rejected requests
        setCurrentBooks(currentBooksData.status === 'fulfilled' ? currentBooksData.value : []);
        setTrendingBooks(trendingBooksData.status === 'fulfilled' ? trendingBooksData.value : []);
        setRecommendedBooks(recommendedBooksData.status === 'fulfilled' ? recommendedBooksData.value : []);
        setUpcomingEvents(upcomingEventsData.status === 'fulfilled' ? upcomingEventsData.value : []);
        setRecentlyAddedBooks(recentlyAddedBooksData.status === 'fulfilled' ? recentlyAddedBooksData.value : []);
        setAdaptations(adaptationsData.status === 'fulfilled' ? adaptationsData.value : []);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomePageData();
  }, [currentUser, navigate]);


  
  const handleSearch = async (query, type, id) => {
    if (!query) return;
    
    try {
      setLoading(true);
      
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
      
      // Perform search
      const results = await searchService.search(query);
      setSearchResults(results);
      
      // Navigate to search results page or display inline
      if (results.books.length > 0 || results.authors.length > 0 || results.genres.length > 0) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16 overflow-auto">
      <TopNavigation />
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {/* Hero Section with SearchBar component */}
          <div className="bg-indigo-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.name?.split(' ')[0] || 'Reader'}!</h1>
            <SearchBar onSearch={handleSearch} />
          </div>
          
          {/* Render all content sections */}
          <CurrentlyReadingSection books={currentBooks} />
          <TrendingBooksSection books={trendingBooks} />
          <UpcomingEventsSection events={upcomingEvents} />
          <RecommendedBooksSection books={recommendedBooks} />
          <RecentlyAddedSection 
            recentBooks={recentlyAddedBooks} 
            adaptations={adaptations} 
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;