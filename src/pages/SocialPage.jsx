import React, { useState } from 'react';
import { Users, ThumbsUp, MessageCircle, Share2, Book, MapPin, User, Plus, Edit, Calendar } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import Post from '../Components/Post';

const SocialPage = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'Emma Wilson',
        avatar: 'bg-purple-300',
        location: 'Seattle, WA'
      },
      timestamp: '2 hours ago',
      content: 'Just finished "The Silent Echo" and Im completely blown away. The character development was masterful and the twist at the end had me gasping! Has anyone else read this?',
      likes: 24,
      comments: 8,
      book: {
        title: 'The Silent Echo',
        cover: 'bg-blue-200',
        author: 'Maya Richards'
      }
    },
    {
      id: 2,
      user: {
        name: 'David Chen',
        avatar: 'bg-green-300',
        location: 'Portland, OR'
      },
      timestamp: '5 hours ago',
      content: 'Looking for recommendations on historical fiction set in Ancient Rome. I loved "The Eagle of the Ninth" and want something similar. Any suggestions?',
      likes: 15,
      comments: 12,
    },
    {
      id: 3,
      user: {
        name: 'Sarah Johnson',
        avatar: 'bg-red-300',
        location: 'Chicago, IL'
      },
      timestamp: '1 day ago',
      content: 'Just signed up for the upcoming Science Fiction Book Festival! Who else is going? Would love to meet some fellow book lovers there!',
      likes: 32,
      comments: 18,
      event: {
        name: 'Science Fiction Book Festival',
        date: 'March 15, 2025',
        location: 'Portland Convention Center'
      }
    }
  ]);

  const [friendSuggestions] = useState([
    {
      id: 1,
      name: 'Michael Lin',
      avatar: 'bg-yellow-300',
      mutualFriends: 4,
      matchPercent: 92,
      location: 'San Francisco, CA'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      avatar: 'bg-pink-300',
      mutualFriends: 2,
      matchPercent: 87,
      location: 'Boston, MA'
    },
    {
      id: 3,
      name: 'James Wilson',
      avatar: 'bg-blue-300',
      mutualFriends: 6,
      matchPercent: 85,
      location: 'Seattle, WA'
    }
  ]);
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  const handleCreatePost = () => {
    if (newPostText.trim() === '') return;
    
    const newPost = {
      id: posts.length + 1,
      user: {
        name: 'Alex Thompson',
        avatar: 'bg-indigo-300',
        location: 'Seattle, WA'
      },
      timestamp: 'Just now',
      content: newPostText,
      likes: 0,
      comments: 0
    };
    
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowPostModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16 overflow-auto">
      <TopNavigation title="Social" />
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Create Post Button */}
        <div className="p-4 flex justify-center">
          <button 
            className="bg-indigo-600 text-white flex items-center px-4 py-2 rounded-full shadow-md w-full max-w-md"
            onClick={() => setShowPostModal(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            <span>Create Post</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white shadow-sm mb-4 px-4">
          <div 
            className={`px-4 py-3 font-medium text-sm cursor-pointer ${activeTab === 'feed' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('feed')}
          >
            Your Feed
          </div>
          <div 
            className={`px-4 py-3 font-medium text-sm cursor-pointer ${activeTab === 'friends' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('friends')}
          >
            Find Friends
          </div>
          <div 
            className={`px-4 py-3 font-medium text-sm cursor-pointer ${activeTab === 'bookclubs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('bookclubs')}
          >
            Book Clubs
          </div>
        </div>
        
        {activeTab === 'feed' && (
          <div className="px-4 space-y-4 mb-4">
            {posts.map(post => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        )}
        
        {activeTab === 'friends' && (
          <div className="px-4 space-y-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">People You May Know</h3>
              <div className="space-y-4">
                {friendSuggestions.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${friend.avatar} rounded-full flex-shrink-0 flex items-center justify-center`}>
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="font-semibold">{friend.name}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {friend.location}
                        </div>
                        <div className="text-xs text-gray-500">
                          {friend.mutualFriends} mutual friends • {friend.matchPercent}% taste match
                        </div>
                      </div>
                    </div>
                    <button className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-indigo-600 text-sm font-medium">
                See More Suggestions
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Similar Reading Tastes</h3>
              <div className="text-sm text-gray-500 mb-4">
                Find friends based on your favorite genres, authors, and reading history.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-indigo-100 text-indigo-700 p-2 rounded text-sm font-medium text-center">
                  Science Fiction Fans
                </div>
                <div className="bg-purple-100 text-purple-700 p-2 rounded text-sm font-medium text-center">
                  Mystery Lovers
                </div>
                <div className="bg-green-100 text-green-700 p-2 rounded text-sm font-medium text-center">
                  History Buffs
                </div>
                <div className="bg-yellow-100 text-yellow-700 p-2 rounded text-sm font-medium text-center">
                  Fantasy Readers
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'bookclubs' && (
          <div className="px-4 space-y-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Popular Book Clubs</h3>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Seattle Bibliophiles</h4>
                      <div className="text-xs text-gray-500 mt-1">
                        45 members • 3 mutual friends
                      </div>
                      <div className="text-xs text-gray-500">
                        Currently reading: "The Silent Echo"
                      </div>
                    </div>
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                      Join
                    </button>
                  </div>
                </div>
                
                <div className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">SF Fantasy Readers</h4>
                      <div className="text-xs text-gray-500 mt-1">
                        65 members • 5 mutual friends
                      </div>
                      <div className="text-xs text-gray-500">
                        Currently reading: "The Hidden Kingdom"
                      </div>
                    </div>
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                      Join
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Between the Lines</h4>
                      <div className="text-xs text-gray-500 mt-1">
                        35 members • 2 mutual friends
                      </div>
                      <div className="text-xs text-gray-500">
                        Currently reading: "Empire of Sand"
                      </div>
                    </div>
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                      Join
                    </button>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-indigo-600 text-sm font-medium">
                See More Book Clubs
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">Your Book Club Events</h3>
              <div className="text-sm text-gray-500 mb-2">
                Upcoming meetings and discussions
              </div>
              
              <div className="bg-gray-50 p-3 rounded mb-3">
                <div className="flex">
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded text-center mr-3 flex-shrink-0">
                    <div className="text-sm font-bold">MAR</div>
                    <div className="text-xl font-bold">15</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Science Fiction Book Festival</h4>
                    <div className="text-xs text-gray-500 mt-1">Portland Convention Center • 10:00 AM</div>
                    <div className="text-xs text-indigo-600 mt-1">3 friends attending</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex">
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-center mr-3 flex-shrink-0">
                    <div className="text-sm font-bold">MAR</div>
                    <div className="text-xl font-bold">22</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Seattle Bibliophiles Monthly Meeting</h4>
                    <div className="text-xs text-gray-500 mt-1">Virtual • 7:00 PM</div>
                    <div className="text-xs text-indigo-600 mt-1">Discussion: The Silent Echo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">Create Post</h3>
              <button 
                className="text-gray-500"
                onClick={() => setShowPostModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Alex Thompson</div>
                  <div className="text-xs text-gray-500">Seattle, WA</div>
                </div>
              </div>
              
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="What's on your mind about books?"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
              ></textarea>
              
              <div className="mt-4 flex items-center">
                <button className="bg-gray-100 text-gray-600 p-2 rounded flex items-center mr-2">
                  <Book className="h-5 w-5 mr-1" />
                  <span className="text-sm">Tag Book</span>
                </button>
                <button className="bg-gray-100 text-gray-600 p-2 rounded flex items-center">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span className="text-sm">Tag Event</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                className="bg-gray-200 text-gray-600 px-4 py-2 rounded mr-2"
                onClick={() => setShowPostModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 rounded ${newPostText.trim() ? 'bg-indigo-600 text-white' : 'bg-indigo-300 text-white cursor-not-allowed'}`}
                onClick={handleCreatePost}
                disabled={!newPostText.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPage;