import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import TopNavigation from '../Components/TopNavigation';
import { useAuth } from '../auth/AuthContext';

const ProfilePage = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  
  // If user is not logged in, redirect to sign in page
  if (!currentUser) {
    navigate('/signin');
    return null;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-16 overflow-auto">
      <TopNavigation title="User Profile" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{currentUser.name.charAt(0)}</span>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">{currentUser.name}</h1>
              <p className="text-gray-500">User ID: {currentUser.id}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Account Information</h2>
            <div className="bg-gray-50 p-4 rounded">
              <div className="mb-2">
                <span className="font-medium">Email:</span> {currentUser.email || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Joined Date:</span> {currentUser.joinedDate || 'N/A'}
              </div>
              {/* Add more user properties as needed */}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={() => {
                signOut();
                navigate('/signin');
              }}
              className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;