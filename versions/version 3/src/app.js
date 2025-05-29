import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './Components/Navigation';
import Dashboard from './Pages/Dashboard';
import Analytics from './Pages/Analytics';
import Training from './Pages/Training';
import Learning from './Pages/Learning';
import { User } from './Entities/user';
import './app.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize mock user data
      const mockUser = await User.me();
      setUser(mockUser);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex">
          <Navigation user={user} />
          <main className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/training" element={<Training />} />
              <Route path="/learning" element={<Learning />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;