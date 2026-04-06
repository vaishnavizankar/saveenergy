import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Carbon from './pages/Carbon';
import Cost from './pages/Cost';
import Login from './pages/Login';
import Recommendations from './pages/Recommendations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        <Route path="/resources" element={
          <ProtectedRoute><Resources /></ProtectedRoute>
        } />
        
        <Route path="/carbon" element={
          <ProtectedRoute><Carbon /></ProtectedRoute>
        } />
        
        <Route path="/cost" element={
          <ProtectedRoute><Cost /></ProtectedRoute>
        } />

        <Route path="/recommendations" element={
          <ProtectedRoute><Recommendations /></ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute><Reports /></ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
