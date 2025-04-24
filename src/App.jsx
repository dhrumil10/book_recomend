import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';

// Import pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SignIn from './auth/SignIn';
import Register from './auth/Register';
import SearchResultsPage from './pages/SearchResultsPage';
import BookDetailPage from './pages/BookDetailPage';
import AuthorDetailPage from './pages/AuthorDetailPage';
import GenreDetailPage from './pages/GenreDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import BottomNavigation from './components/BottomNavigation';
import MyBooksPage from './pages/MyBooksPage';
import SocialPage from './pages/SocialPage';
import ChatbotPage from './pages/ChatbotPage';
import ExplorePage from './pages/ExplorePage';

function App() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Determine whether to show navigation based on current route
  const showNavigation = currentUser && !['/signin', '/register'].includes(location.pathname);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!currentUser) {
      // Save the location the user was trying to access
      return <Navigate to="/signin" state={{ from: location }} replace />;
    }
    
    return children;
  };

  // Routes that should redirect to home if user is already authenticated
  const AuthRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (currentUser) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Routes>
        <Route path="/signin" element={
          <AuthRoute>
            <SignIn />
          </AuthRoute>
        } />
        
        <Route path="/register" element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/search" element={
          <ProtectedRoute>
            <SearchResultsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/book/:id" element={
          <ProtectedRoute>
            <BookDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/author/:id" element={
          <ProtectedRoute>
            <AuthorDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/genre/:id" element={
          <ProtectedRoute>
            <GenreDetailPage />
          </ProtectedRoute>
        } />

     
      <Route path="/my-books" element={
        <ProtectedRoute>
          <MyBooksPage />
        </ProtectedRoute>
      } />

    <Route path="/explore" element={
      <ProtectedRoute>
        <ExplorePage />
      </ProtectedRoute>
    } />

      <Route path="/social" element={
        <ProtectedRoute>
          <SocialPage />
        </ProtectedRoute>
      } />

      <Route path="/chatbot" element={
        <ProtectedRoute>
          <ChatbotPage />
        </ProtectedRoute>
      } />

      
        <Route path="/not-found" element={
          <NotFoundPage />
        } />
        
        <Route path="*" element={
          loading ? (
            <div>Loading...</div>
          ) : currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        } />
      </Routes>

      {showNavigation && <BottomNavigation />}
    </div>
  );
}

export default App;