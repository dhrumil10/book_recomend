import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import AuthProvider from './auth/AuthContext.jsx'; // Import the default export
import './index.css';


// Import any additional CSS files after Tailwind
// import './App.css' 

// Initialize Neo4j Service if needed
import neo4jService from './services/neo4jService.js'
// Replace with your actual Neo4j connection details
// neo4jService.initialize('neo4j://localhost:7687', 'neo4j', 'password')

try {
  neo4jService.initialize(
    import.meta.env.VITE_NEO4J_URI,
    import.meta.env.VITE_NEO4J_USER,
    import.meta.env.VITE_NEO4J_PASSWORD
  );
} catch (error) {
  console.error('Failed to initialize Neo4j:', error);
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);