import React, { useState } from 'react';
import TopNavigation from '../Components/TopNavigation';
import { Book, Clock, Calendar, List, Grid, Filter, ChevronDown, Heart, Star, MoreHorizontal } from 'lucide-react';

const MyBooksPage = () => {
  const [activeTab, setActiveTab] = useState('reading');
  const [viewMode, setViewMode] = useState('grid');
  
  const readingBooks = [
    {
      id: 1,
      title: 'Atomic Habits',
      author: 'James Clear',
      cover: 'bg-indigo-200',
      progress: 73,
      lastRead: '2 hours ago'
    },
    {
      id: 2,
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      cover: 'bg-red-200',
      progress: 28,
      lastRead: 'Yesterday'
    }
  ];
  
  const toReadBooks = [
    {
      id: 3,
      title: 'Thinking Fast and Slow',
      author: 'Daniel Kahneman',
      cover: 'bg-purple-200',
      addedDate: 'Feb 15, 2025'
    },
    {
      id: 4,
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      cover: 'bg-yellow-200',
      addedDate: 'Feb 10, 2025'
    },
    {
      id: 5,
      title: 'Educated',
      author: 'Tara Westover',
      cover: 'bg-blue-200',
      addedDate: 'Feb 5, 2025'
    }
  ];
  
  const completedBooks = [
    {
      id: 6,
      title: 'The Silent Echo',
      author: 'Maya Richards',
      cover: 'bg-blue-200',
      completedDate: 'Jan 28, 2025',
      rating: 4.5
    },
    {
      id: 7,
      title: 'Empire of Sand',
      author: 'Tasha Suri',
      cover: 'bg-orange-200',
      completedDate: 'Jan 15, 2025',
      rating: 4.0
    },
    {
      id: 8,
      title: 'Dune',
      author: 'Frank Herbert',
      cover: 'bg-yellow-200',
      completedDate: 'Dec 30, 2024',
      rating: 5.0
    }
  ];
  
  const favoriteBooks = [
    {
      id: 8,
      title: 'Dune',
      author: 'Frank Herbert',
      cover: 'bg-yellow-200',
      addedDate: 'Dec 30, 2024'
    },
    {
      id: 9,
      title: 'The Cartographer\'s Daughter',
      author: 'Jessica White',
      cover: 'bg-green-200',
      addedDate: 'Nov 15, 2024'
    }
  ];
  
  // Determine which books to show based on active tab
  const getActiveBooks = () => {
    switch (activeTab) {
      case 'reading':
        return readingBooks;
      case 'toread':
        return toReadBooks;
      case 'completed':
        return completedBooks;
      case 'favorites':
        return favoriteBooks;
      default:
        return [];
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16 overflow-auto">
      <TopNavigation title="My Books" />
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Stats */}
        <div className="bg-indigo-600 text-white p-6">
          <h1 className="text-xl font-bold mb-4">Your Reading Stats</h1>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-indigo-500 rounded-lg p-3">
              <div className="text-2xl font-bold">2</div>
              <div className="text-xs">Currently Reading</div>
            </div>
            <div className="bg-indigo-500 rounded-lg p-3">
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs">Books in 2025</div>
            </div>
            <div className="bg-indigo-500 rounded-lg p-3">
              <div className="text-2xl font-bold">75%</div>
              <div className="text-xs">Reading Goal</div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white shadow-sm mb-4">
          <div 
            className={`flex-1 px-4 py-3 text-center font-medium text-sm cursor-pointer ${activeTab === 'reading' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reading')}
          >
            <div className="flex items-center justify-center">
              <Book className="h-4 w-4 mr-1" />
              <span>Reading</span>
            </div>
          </div>
          <div 
            className={`flex-1 px-4 py-3 text-center font-medium text-sm cursor-pointer ${activeTab === 'toread' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('toread')}
          >
            <div className="flex items-center justify-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>To Read</span>
            </div>
          </div>
          <div 
            className={`flex-1 px-4 py-3 text-center font-medium text-sm cursor-pointer ${activeTab === 'completed' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('completed')}
          >
            <div className="flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Completed</span>
            </div>
          </div>
          <div 
            className={`flex-1 px-4 py-3 text-center font-medium text-sm cursor-pointer ${activeTab === 'favorites' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('favorites')}
          >
            <div className="flex items-center justify-center">
              <Heart className="h-4 w-4 mr-1" />
              <span>Favorites</span>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-between items-center px-4 mb-4">
          <div className="flex space-x-2">
            <button 
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button 
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center">
            <button className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
              <Filter className="h-3 w-3 mr-1" />
              <span>Filter</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
        
        {/* Book List/Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 pb-4">
            {getActiveBooks().map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className={`${book.cover} h-40 w-full relative`}>
                  {activeTab === 'reading' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-700 text-white text-xs p-1 text-center">
                      {book.progress}% complete
                    </div>
                  )}
                  {activeTab === 'favorites' && (
                    <div className="absolute top-2 right-2">
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-sm truncate">{book.title}</div>
                  <div className="text-xs text-gray-500">{book.author}</div>
                  
                  {activeTab === 'reading' && (
                    <div className="text-xs text-gray-500 mt-1">Last read: {book.lastRead}</div>
                  )}
                  
                  {activeTab === 'toread' && (
                    <div className="text-xs text-gray-500 mt-1">Added: {book.addedDate}</div>
                  )}
                  
                  {activeTab === 'completed' && (
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(Math.floor(book.rating))].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                        ))}
                        {book.rating % 1 !== 0 && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-1">{book.completedDate}</div>
                    </div>
                  )}
                  
                  {activeTab === 'favorites' && (
                    <div className="text-xs text-gray-500 mt-1">Added: {book.addedDate}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 pb-4 space-y-3">
            {getActiveBooks().map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow p-3 flex">
                <div className={`${book.cover} w-16 h-24 rounded flex-shrink-0 relative`}>
                  {activeTab === 'reading' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-700 text-white text-xs p-0.5 text-center">
                      {book.progress}%
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-semibold">{book.title}</div>
                  <div className="text-sm text-gray-500">{book.author}</div>
                  
                  {activeTab === 'reading' && (
                    <div className="text-xs text-gray-500 mt-2">Last read: {book.lastRead}</div>
                  )}
                  
                  {activeTab === 'toread' && (
                    <div className="text-xs text-gray-500 mt-2">Added: {book.addedDate}</div>
                  )}
                  
                  {activeTab === 'completed' && (
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {[...Array(Math.floor(book.rating))].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                        {book.rating % 1 !== 0 && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">{book.completedDate}</div>
                    </div>
                  )}
                  
                  {activeTab === 'favorites' && (
                    <div className="text-xs text-gray-500 mt-2">
                      <Heart className="h-4 w-4 text-red-500 fill-current inline-block mr-1" />
                      Added: {book.addedDate}
                    </div>
                  )}
                </div>
                <button className="text-gray-400">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooksPage;