import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Upload from './pages/Upload';
import Team from './pages/Team';
import Board from './pages/Board';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <RequireAuth>
               <Layout><Upload /></Layout>
            </RequireAuth>
          } />
          <Route path="/upload" element={
            <RequireAuth>
               <Layout><Upload /></Layout>
            </RequireAuth>
          } />
          <Route path="/team" element={
            <RequireAuth>
              <Layout><Team /></Layout>
            </RequireAuth>
          } />
          <Route path="/board" element={
            <RequireAuth>
              <Layout><Board /></Layout>
            </RequireAuth>
          } />
          {/* Publicly Shareable Board Link */}
          <Route path="/board/:projectId" element={
            <Layout><Board /></Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
