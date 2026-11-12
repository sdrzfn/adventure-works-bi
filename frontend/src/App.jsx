import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './Login';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { ToastProvider, useToast } from './Context/ToastContext';

const App = () => {
  return (
    <ToastProvider>
      <AuthProviderWithToast />
    </ToastProvider>
  );
};

const AuthProviderWithToast = () => {
  const { showToast } = useToast();
  return (
    <AuthProvider showToast={showToast}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LoginWrapper />}
          />
          <Route
            path="/"
            element={<ProtectedRoute />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const LoginWrapper = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Login />;
};

const ProtectedRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Dashboard />;
};

export default App;