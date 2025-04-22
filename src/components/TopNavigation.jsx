import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Home, User } from 'lucide-react';

const TopNavigation = ({ title = "BookLovers" }) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <div className="mr-2">
          <Book className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      
      <nav className="flex space-x-4">
        <button onClick={() => navigate('/')} className="flex items-center">
          <Home className="h-5 w-5" />
        </button>
        <button onClick={() => navigate('/profile')} className="flex items-center">
          <User className="h-5 w-5" />
        </button>
      </nav>
    </header>
  );
};

export default TopNavigation;