import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { Box, CssBaseline, IconButton, AppBar, Toolbar, Typography, useMediaQuery, useTheme, Container } from '@mui/material';
import { Menu as MenuIcon } from 'lucide-react';
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

const drawerWidth = 280;

function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ width: '100%', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', boxShadow: 'none' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              FinTutor
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Component */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth} 
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: isMobile ? 7 : 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Container>
      </Box>
    </Box>
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
