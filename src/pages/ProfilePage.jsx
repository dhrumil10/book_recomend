import React, { useState, useEffect } from 'react';
import { Settings, Edit, MapPin, Book, Users, MessageCircle, Calendar, ChevronRight, Clock, BarChart, Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../Components/TopNavigation';
import { useAuth } from '../auth/AuthContext'; // Using the named export
import neo4jService from '../services/neo4jService';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    location: '',
    bio: '',
    joined: '',
    favoriteGenre: '',
    readingGoal: '',
    avgRating: ''
  });
  
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is not logged in, redirect to sign in page
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    // Load profile data from Neo4j based on currentUser
    const loadUserProfile = async () => {
      try {
        // Get user's location
        const locationQuery = `
          MATCH (u:USER {id: $userId})-[:LIVES_IN]->(city:CITY)-[:PART_OF]->(state:STATE)
          RETURN city.name as cityName, state.name as stateName
        `;
        
        const locationResult = await neo4jService.executeQuery(locationQuery, { userId: currentUser.id });
        
        let location = '';
        if (locationResult.length > 0) {
          const city = locationResult[0].get('cityName');
          const state = locationResult[0].get('stateName');
          location = `${city}, ${state}`;
        }
        
        // Get user's favorite genre
        const genreQuery = `
          MATCH (u:USER {id: $userId})-[r:PREFERS_GENRE]->(g:GENRE)
          RETURN g.name as genreName
          ORDER BY r.strength DESC
          LIMIT 1
        `;
        
        const genreResult = await neo4jService.executeQuery(genreQuery, { userId: currentUser.id });
        
        let favoriteGenre = '';
        if (genreResult.length > 0) {
          favoriteGenre = genreResult[0].get('genreName');
        }
        
        // Get user's reading goal from reading history
        const readingQuery = `
          MATCH (u:USER {id: $userId})-[:HAS_HISTORY]->(:READING_HISTORY)-[:CONTAINS_ENTRY]->(entry:HISTORY_ENTRY)
          WHERE entry.action = 'finished' AND entry.timestamp CONTAINS '2025'
          RETURN count(entry) as booksRead
        `;
        
        const readingResult = await neo4jService.executeQuery(readingQuery, { userId: currentUser.id });
        
        let readingGoal = '0 books in 2025';
        if (readingResult.length > 0) {
          const booksRead = readingResult[0].get('booksRead').toNumber();
          readingGoal = `${booksRead} of 16 books in 2025`;
        }
        
        // Get user's average rating
        const ratingQuery = `
          MATCH (u:USER {id: $userId})-[r:RATES]->(b:BOOK)
          RETURN avg(r.rating) as avgRating
        `;
        
        const ratingResult = await neo4jService.executeQuery(ratingQuery, { userId: currentUser.id });
        
        let avgRating = '0 stars';
        if (ratingResult.length > 0 && ratingResult[0].get('avgRating')) {
          const rating = ratingResult[0].get('avgRating');
          avgRating = `${rating.toFixed(1)} stars`;
        }
        
        // Update profile state
        setProfileData({
          name: currentUser.name || 'Anonymous Reader',
          location: location || 'Location not set',
          bio: currentUser.hobbies 
            ? `${currentUser.profession || 'Book lover'} with interests in ${currentUser.hobbies}` 
            : 'No bio available',
          joined: currentUser.joinedDate || 'November, 2024',
          favoriteGenre: favoriteGenre || 'Not specified',
          readingGoal: readingGoal,
          avgRating: avgRating
        });
        
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    
    loadUserProfile();
  }, [currentUser, navigate]);
  
  const handleEditProfile = () => {
    setEditMode(true);
  };
  
  const handleSaveProfile = () => {
    setEditMode(false);
    // In a real app, this would save to database
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };
  
  if (!currentUser) {
    return null; // Will redirect to sign in page due to useEffect
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16 overflow-auto">
      <TopNavigation />
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Profile Header */}
        <div className="bg-indigo-600 text-white p-6 relative">
          <div className="absolute top-4 right-4">
            <Settings className="h-5 w-5 cursor-pointer" />
          </div>
          
          {!editMode ? (
            <>
              <div className="flex items-center">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">{profileData.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{profileData.location}</span>
                  </div>
                  <div className="flex space-x-4 mt-2">
                    <div className="text-center">
                      <div className="font-bold">127</div>
                      <div className="text-xs">Books</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">43</div>
                      <div className="text-xs">Friends</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">12</div>
                      <div className="text-xs">Lists</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-full text-sm font-medium flex items-center mx-auto"
                onClick={handleEditProfile}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center relative">
                  <span className="text-3xl font-bold">{profileData.name.charAt(0)}</span>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                    <Edit className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-indigo-200">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full bg-indigo-500 text-white p-2 rounded border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-indigo-200">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="w-full bg-indigo-500 text-white p-2 rounded border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  className="bg-white text-indigo-600 px-4 py-2 rounded-full text-sm font-medium flex-1"
                  onClick={handleSaveProfile}
                >
                  Save Profile
                </button>
                <button 
                  className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium border border-white"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Bio / About */}
        {!editMode ? (
          <div className="bg-white p-4 shadow-sm">
            <h2 className="font-bold mb-2">About</h2>
            <p className="text-sm text-gray-700">
              {profileData.bio}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="text-sm">
                <span className="text-gray-500">Joined:</span> {profileData.joined}
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Favorite Genre:</span> {profileData.favoriteGenre}
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Reading Goal:</span> {profileData.readingGoal}
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Avg. Rating:</span> {profileData.avgRating}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 shadow-sm">
            <h2 className="font-bold mb-2">About</h2>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              className="w-full h-24 p-2 border border-gray-300 rounded resize-none text-sm"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="text-sm">
                <span className="text-gray-500">Joined:</span> {profileData.joined}
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Favorite Genre:</span>
                <select
                  name="favoriteGenre"
                  value={profileData.favoriteGenre}
                  onChange={handleInputChange}
                  className="ml-1 border border-gray-300 rounded text-sm"
                >
                  <option>Science Fiction</option>
                  <option>Mystery</option>
                  <option>Fantasy</option>
                  <option>Romance</option>
                  <option>Non-Fiction</option>
                </select>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Reading Goal:</span>
                <input
                  type="text"
                  name="readingGoal"
                  value={profileData.readingGoal}
                  onChange={handleInputChange}
                  className="w-24 ml-1 border border-gray-300 rounded text-sm px-1"
                />
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Avg. Rating:</span> {profileData.avgRating}
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex bg-white shadow-sm mt-4 mb-4">
          <div 
            className={`flex-1 px-4 py-3 text-center font-medium text-sm cursor-pointer ${activeTab === 'activity' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </div>
          <div 
            className={`flex-1 px-4 py-3 text-center font-medium text-sm cursor-pointer ${activeTab === 'insights' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </div>
          <div 
            className={`flex-1 px-4 py-3 text-center font-medium text-sm cursor-pointer ${activeTab === 'network' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('network')}
          >
            Network
          </div>
        </div>
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="px-4 space-y-4 mb-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold">Recent Activity</h3>
              </div>
              
              <div className="divide-y">
                <div className="p-4 flex">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Book className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm">Started reading <span className="font-semibold">Atomic Habits</span></div>
                    <div className="text-xs text-gray-500">2 days ago</div>
                  </div>
                </div>
                
                <div className="p-4 flex">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm">Joined <span className="font-semibold">Seattle Bibliophiles</span> book club</div>
                    <div className="text-xs text-gray-500">5 days ago</div>
                  </div>
                </div>
                
                <div className="p-4 flex">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm">Commented on <span className="font-semibold">Emma's</span> post about Silent Echo</div>
                    <div className="text-xs text-gray-500">1 week ago</div>
                  </div>
                </div>
                
                <div className="p-4 flex">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm">RSVP'd to <span className="font-semibold">Science Fiction Book Festival</span></div>
                    <div className="text-xs text-gray-500">1 week ago</div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 text-center text-sm text-indigo-600 font-medium cursor-pointer">
                View All Activity
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold">Your Posts</h3>
              </div>
              
              <div className="p-4">
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-sm font-medium">Looking for science fiction recommendations with strong female leads!</div>
                  <div className="text-xs text-gray-500 mt-1">Posted 2 weeks ago • 8 replies</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium">Just finished "The Silent Echo" - absolutely mind-blowing ending!</div>
                  <div className="text-xs text-gray-500 mt-1">Posted 1 month ago • 15 replies</div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 text-center text-sm text-indigo-600 font-medium cursor-pointer">
                View All Posts
              </div>
            </div>
          </div>
        )}
        
        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="px-4 space-y-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Reading Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Book className="h-4 w-4 text-indigo-600 mr-1" />
                    <span className="text-sm font-medium">Books This Year</span>
                  </div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-gray-500">75% of your goal</div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Clock className="h-4 w-4 text-green-600 mr-1" />
                    // Updated ProfilePage.jsx (continued)
                    <span className="text-sm font-medium">Reading Time</span>
                  </div>
                  <div className="text-2xl font-bold">127h</div>
                  <div className="text-xs text-gray-500">This year</div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <BarChart className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm font-medium">Avg. Book Length</span>
                  </div>
                  <div className="text-2xl font-bold">342</div>
                  <div className="text-xs text-gray-500">Pages</div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Heart className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium">Favorite Genre</span>
                  </div>
                  <div className="text-xl font-bold">{profileData.favoriteGenre || 'N/A'}</div>
                  <div className="text-xs text-gray-500">42% of your books</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Genre Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Science Fiction</span>
                    <span>42%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Mystery/Thriller</span>
                    <span>28%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Literary Fiction</span>
                    <span>15%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Other</span>
                    <span>15%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Reading Patterns</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Preferred Reading Time</div>
                    <div className="text-xs text-gray-500">Evening (7-10pm)</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Average Session Length</div>
                    <div className="text-xs text-gray-500">45 minutes</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Reading Speed</div>
                    <div className="text-xs text-gray-500">42 pages per hour</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Monthly Reading Trend</h3>
              <div className="flex items-end h-40 space-x-2">
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-200 w-full rounded-t" style={{ height: '30%' }}></div>
                  <div className="text-xs mt-1">Jan</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-300 w-full rounded-t" style={{ height: '45%' }}></div>
                  <div className="text-xs mt-1">Feb</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-400 w-full rounded-t" style={{ height: '60%' }}></div>
                  <div className="text-xs mt-1">Mar</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-500 w-full rounded-t" style={{ height: '75%' }}></div>
                  <div className="text-xs mt-1">Apr</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-600 w-full rounded-t" style={{ height: '90%' }}></div>
                  <div className="text-xs mt-1">May</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-500 w-full rounded-t" style={{ height: '65%' }}></div>
                  <div className="text-xs mt-1">Jun</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-400 w-full rounded-t" style={{ height: '50%' }}></div>
                  <div className="text-xs mt-1">Jul</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="bg-indigo-400 w-full rounded-t" style={{ height: '55%' }}></div>
                  <div className="text-xs mt-1">Aug</div>
                </div>
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-500">
                <div>Total: 12 books</div>
                <div>Monthly average: 1.5 books</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="px-4 space-y-4 mb-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold">Friends (43)</h3>
                <button className="text-sm text-indigo-600">View All</button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-300 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">E</span>
                  </div>
                  <div className="text-xs mt-1 font-medium">Emma</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-300 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">D</span>
                  </div>
                  <div className="text-xs mt-1 font-medium">David</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-300 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <div className="text-xs mt-1 font-medium">Sarah</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-300 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div className="text-xs mt-1 font-medium">Michael</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-300 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                  <div className="text-xs mt-1 font-medium">Priya</div>
                </div>
                
                <div className="text-center">
                  <button className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-gray-500 font-bold">+</span>
                  </button>
                  <div className="text-xs mt-1 text-gray-500 font-medium">More</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold">Book Clubs (4)</h3>
              </div>
              
              <div className="divide-y">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Seattle Bibliophiles</div>
                      <div className="text-xs text-gray-500">45 members</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">SF Fantasy Readers</div>
                      <div className="text-xs text-gray-500">65 members</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Mystery Mavens</div>
                      <div className="text-xs text-gray-500">38 members</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">The Literary Circle</div>
                      <div className="text-xs text-gray-500">52 members</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold">Similar Readers</h3>
              </div>
              
              <div className="divide-y">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Michael Lin</div>
                      <div className="text-xs text-gray-500">92% match • 4 mutual friends</div>
                    </div>
                  </div>
                  <button className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                    <Users className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">P</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Priya Sharma</div>
                      <div className="text-xs text-gray-500">87% match • 2 mutual friends</div>
                    </div>
                  </div>
                  <button className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                    <Users className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">J</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">James Wilson</div>
                      <div className="text-xs text-gray-500">85% match • 6 mutual friends</div>
                    </div>
                  </div>
                  <button className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                    <Users className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 text-center text-sm text-indigo-600 font-medium cursor-pointer">
                Find More Similar Readers
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold">Reading Buddies</h3>
              </div>
              
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-3">
                  Connect with friends to read the same book together and discuss as you go!
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center">
                  <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">E</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium">Reading with Emma</div>
                    <div className="text-xs text-gray-500">Currently: The Silent Echo (Chapter 12)</div>
                  </div>
                  <button className="bg-indigo-100 text-indigo-600 p-2 rounded text-xs">
                    Chat
                  </button>
                </div>
                
                <button className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-medium">
                  Find New Reading Buddies
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Account Settings */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold">Account Settings</h3>
            </div>
            
            <div className="divide-y">
              <div className="p-4 flex justify-between items-center cursor-pointer">
                <div className="text-sm">Notifications</div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="p-4 flex justify-between items-center cursor-pointer">
                <div className="text-sm">Privacy</div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="p-4 flex justify-between items-center cursor-pointer">
                <div className="text-sm">Reading Preferences</div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={handleSignOut}
              >
                <div className="text-sm text-red-500">Sign Out</div>
                <LogOut className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;