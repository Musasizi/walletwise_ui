/**
 * AppRouter.jsx – WalletWise Application Routing
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';
import ModernLayout from './layouts/ModernLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Balance from './pages/Balance';
import Reports from './pages/Reports';
import Users from './pages/Users';

// ── Helper: decode JWT payload ────────────────────────────────────────────────
function decodeToken(token) {
  try {
    if (!token) return null;
    const payload = token.split('.')[1];
    const json = atob(payload.replaceAll('-', '+').replaceAll('_', '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ── ProtectedRoute ─────────────────────────────────────────────────────────────
function ProtectedRoute({ token, children }) {
  return token ? children : <Navigate to="/login" replace />;
}
ProtectedRoute.propTypes = {
  token: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// ── AppRouter ──────────────────────────────────────────────────────────────────
export default function AppRouter() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const user = decodeToken(token);

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  const wrap = (Page, pageProps = {}) => (
    <ProtectedRoute token={token}>
      <ModernLayout onLogout={handleLogout} user={user}>
        <Page token={token} user={user} {...pageProps} />
      </ModernLayout>
    </ProtectedRoute>
  );

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />

        {/* Protected */}
        <Route path="/dashboard" element={wrap(Dashboard)} />
        <Route path="/income" element={wrap(Income)} />
        <Route path="/expense" element={wrap(Expense)} />
        <Route path="/balance" element={wrap(Balance)} />
        <Route path="/reports" element={wrap(Reports)} />
        <Route path="/users" element={wrap(Users)} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
