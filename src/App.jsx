// Updated App.jsx with corrected imports
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MyBooksPage from './pages/MyBooksPage';
import SocialPage from './pages/SocialPage';
import ChatbotPage from './pages/ChatbotPage';
import ProfilePage from './pages/ProfilePage';
import SignIn from './auth/SignIn';
import Register from './auth/Register';
import BottomNavigation from './components/BottomNavigation';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to the sign-in page, but save the current location
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return children;
};

function App() {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Don't show BottomNavigation on auth pages
  const showNavigation = !['/signin', '/register'].includes(location.pathname) && currentUser;
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <ExplorePage />
          </ProtectedRoute>
        } />
        <Route path="/my-books" element={
          <ProtectedRoute>
            <MyBooksPage />
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
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showNavigation && <BottomNavigation />}
    </div>
  );
}

export default App;