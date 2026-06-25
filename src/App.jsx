import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { supabase, isSupabaseConfigured } from './supabase/config';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Maps from './pages/Maps';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Report from './pages/Report';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useStore();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const { currentUser, subscribeToReports, syncUserProfile } = useStore();

  useEffect(() => {
    // 1. Subscribe to reports realtime database channels
    const unsubscribe = subscribeToReports();

    // 2. Subscribe to Supabase Auth changes
    let authSubscription = null;
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          syncUserProfile(session.user);
        }
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          syncUserProfile(session.user);
        } else {
          // If session ends, clear user state
          useStore.setState({ currentUser: null });
        }
      });
      authSubscription = data.subscription;
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [subscribeToReports, syncUserProfile]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text">
        {/* Navigation bar */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className={`flex-grow ${currentUser ? 'pb-16 md:pb-0' : ''}`}>
          <Routes>
            {/* Open Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={currentUser ? <Explore /> : <Navigate to="/login" replace />} />
            <Route path="/maps" element={currentUser ? <Maps /> : <Navigate to="/login" replace />} />
            <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
            
            {/* Protected Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report" 
              element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}
