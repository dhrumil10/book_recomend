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

function App() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

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
      
      <Route path="/not-found" element={
        <NotFoundPage />
      } />
      
      {/* Remove duplicate wildcard route that was causing conflicts */}
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
  );
}

export default App;