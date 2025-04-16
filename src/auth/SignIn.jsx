// Updated SignIn.jsx component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Book } from 'lucide-react';

const SignIn = () => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      await signIn(userId);
      navigate('/'); // Redirect to home page after sign in
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4">
              <Book className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">BookLovers</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="userId" className="block text-gray-700 text-sm font-bold mb-2">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your User ID (e.g., USER-1)"
                required
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >
                Create New Account
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              For demo purposes, you can use any user ID from the sample data like "USER-1", "USER-2", etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;