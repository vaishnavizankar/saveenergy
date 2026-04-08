import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Carbon from './pages/Carbon';
import Cost from './pages/Cost';
import Recommendations from './pages/Recommendations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* All routes wrapped in Layout individually for stability in 'Open Mode' */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/resources" element={<Layout><Resources /></Layout>} />
        <Route path="/carbon" element={<Layout><Carbon /></Layout>} />
        <Route path="/cost" element={<Layout><Cost /></Layout>} />
        <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        
        {/* If the user hits 'login', instantly zip them to the dashboard */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
