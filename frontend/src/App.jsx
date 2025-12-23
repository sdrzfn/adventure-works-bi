import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './Login';
import { useAuth } from './Context/AuthContext';

const App = () => {
  const { user } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default App;