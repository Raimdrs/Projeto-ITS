import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ConceptList from './pages/ConceptList';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import QuizResult from './pages/QuizResult';
import Exercises from './pages/Exercises';
import Simulations from './pages/Simulations';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import './index.css';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile navbar */}
      <div className="navbar-mobile">
        <button className="navbar-mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>💰 FinTutor</span>
        <div style={{ width: '40px' }} />
      </div>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/concepts" element={
            <ProtectedRoute>
              <AppLayout><ConceptList /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/concept/:slug" element={
            <ProtectedRoute>
              <AppLayout><Lesson /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/quiz/:slug" element={
            <ProtectedRoute>
              <AppLayout><Quiz /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/quiz-result/:id" element={
            <ProtectedRoute>
              <AppLayout><QuizResult /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/exercises/:slug" element={
            <ProtectedRoute>
              <AppLayout><Exercises /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/simulations" element={
            <ProtectedRoute>
              <AppLayout><Simulations /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <AppLayout><Reports /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
