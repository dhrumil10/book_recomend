import React from 'react';
import { Book, Users, TrendingUp, Calendar, Film, Clock, Search, User, Bell, Heart } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation.jsx';

const HomePage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16 overflow-auto">
      <TopNavigation />
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Hero Section */}
        <div className="bg-indigo-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Alex!</h1>
          <div className="bg-white rounded-lg text-gray-700 p-2 flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by title, author, or genre..." 
              className="bg-transparent outline-none w-full"
            />
          </div>
        </div>
        
        {/* Current Reading */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Continue Reading</h2>
            <span className="text-indigo-600 text-sm cursor-pointer">See All</span>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <div className="flex-shrink-0 w-32">
              <div className="bg-indigo-200 h-44 rounded-lg shadow-md relative">
                <div className="absolute bottom-0 left-0 right-0 bg-indigo-700 text-white text-xs p-1 rounded-b-lg text-center">
                  73% complete
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold text-sm truncate">Atomic Habits</div>
                <div className="text-xs text-gray-500">James Clear</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-32">
              <div className="bg-red-200 h-44 rounded-lg shadow-md relative">
                <div className="absolute bottom-0 left-0 right-0 bg-red-700 text-white text-xs p-1 rounded-b-lg text-center">
                  28% complete
                </div>
              </div>
              <div className="mt-2">
                <div className="font-semibold text-sm truncate">The Psychology of Money</div>
                <div className="text-xs text-gray-500">Morgan Housel</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trending Now */}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-lg font-bold">Trending Now</h2>
            </div>
            <div className="bg-gray-200 rounded-full px-3 py-1 text-xs">
              Feb 25, 2025
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
            <div className="bg-white rounded-lg shadow p-3 flex">
              <div className="bg-green-200 w-16 h-24 rounded flex-shrink-0"></div>
              <div className="ml-3 flex-1">
                <div className="font-semibold text-sm">The Silent Patient</div>
                <div className="text-xs text-gray-500 mb-1">Alex Michaelides</div>
                <div className="flex space-x-1 mb-1">
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">Thriller</span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">Mystery</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Users className="h-3 w-3 mr-1" />
                  <span>3.2k reading now</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-3 flex">
              <div className="bg-blue-200 w-16 h-24 rounded flex-shrink-0"></div>
              <div className="ml-3 flex-1">
                <div className="font-semibold text-sm">Lessons in Chemistry</div>
                <div className="text-xs text-gray-500 mb-1">Bonnie Garmus</div>
                <div className="flex space-x-1 mb-1">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Fiction</span>
                  <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full">History</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Users className="h-3 w-3 mr-1" />
                  <span>2.7k reading now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-bold">Upcoming Events</h2>
            </div>
            <span className="text-indigo-600 text-sm cursor-pointer">View All</span>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-start">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded text-center mr-4 flex-shrink-0">
                <div className="text-sm font-bold">MAR</div>
                <div className="text-xl font-bold">15</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Science Fiction Book Festival</h3>
                <div className="text-sm text-gray-500 mb-2">Portland, OR • 3 of your friends attending</div>
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
        </div>
        
        {/* For You */}
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
            <div className="flex-shrink-0 w-32">
              <div className="bg-purple-200 h-44 rounded-lg shadow-md"></div>
              <div className="mt-2">
                <div className="font-semibold text-sm truncate">Thinking Fast and Slow</div>
                <div className="text-xs text-gray-500">Daniel Kahneman</div>
                <div className="flex items-center mt-1">
                  <Heart className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-gray-500">92% match</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-32">
              <div className="bg-yellow-200 h-44 rounded-lg shadow-md"></div>
              <div className="mt-2">
                <div className="font-semibold text-sm truncate">Project Hail Mary</div>
                <div className="text-xs text-gray-500">Andy Weir</div>
                <div className="flex items-center mt-1">
                  <Heart className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-gray-500">87% match</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-32">
              <div className="bg-blue-200 h-44 rounded-lg shadow-md"></div>
              <div className="mt-2">
                <div className="font-semibold text-sm truncate">Educated</div>
                <div className="text-xs text-gray-500">Tara Westover</div>
                <div className="flex items-center mt-1">
                  <Heart className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-gray-500">84% match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recently Added & Media Adaptations */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-3">
                <Clock className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-base font-bold">Recently Added</h2>
              </div>
              <div className="bg-white rounded-lg shadow p-3 mb-2">
                <div className="flex items-center">
                  <div className="bg-green-100 w-10 h-14 rounded flex-shrink-0"></div>
                  <div className="ml-3">
                    <div className="font-semibold text-sm">Tomorrow Will Be Better</div>
                    <div className="text-xs text-gray-500">Added 2 days ago</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-3">
                <div className="flex items-center">
                  <div className="bg-orange-100 w-10 h-14 rounded flex-shrink-0"></div>
                  <div className="ml-3">
                    <div className="font-semibold text-sm">The Mountain is You</div>
                    <div className="text-xs text-gray-500">Added 3 days ago</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-3">
                <Film className="h-5 w-5 text-red-500 mr-2" />
                <h2 className="text-base font-bold">Now on Screen</h2>
              </div>
              <div className="bg-white rounded-lg shadow p-3 relative">
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">New!</div>
                <div className="flex items-center">
                  <div className="bg-red-100 w-10 h-14 rounded flex-shrink-0"></div>
                  <div className="ml-3">
                    <div className="font-semibold text-sm">Dune: Part 2</div>
                    <div className="text-xs text-gray-500">You read this book</div>
                    <div className="text-xs text-indigo-600 mt-1 cursor-pointer">Watch trailer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;