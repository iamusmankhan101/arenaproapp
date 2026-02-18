import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import VenuesPage from './pages/VenuesPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ReviewsPage from './pages/ReviewsPage';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorVenuePage from './pages/vendor/VendorVenuePage';
import VendorBookingsPage from './pages/vendor/VendorBookingsPage';
import { loadStoredAuth, setInitialized } from './store/slices/authSlice';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, admin, initializing } = useSelector(state => state.auth);

  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    dispatch(loadStoredAuth());

    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
      dispatch(setInitialized(true));
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  if (initializing) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="h6">Loading App...</Typography>
        <Button
          variant="text"
          color="error"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          sx={{ mt: 2 }}
        >
          Reset Data & Reload
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return showRegister
      ? <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
      : <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={admin?.role === 'vendor' ? "/vendor/dashboard" : "/dashboard"} replace />} />

        {/* Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><BookingsPage /></ProtectedRoute>} />
        <Route path="/venues" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><VenuesPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><CustomersPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><ReviewsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><SettingsPage /></ProtectedRoute>} />

        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/venues" element={<ProtectedRoute allowedRoles={['vendor']}><VendorVenuePage /></ProtectedRoute>} />
        <Route path="/vendor/bookings" element={<ProtectedRoute allowedRoles={['vendor']}><VendorBookingsPage /></ProtectedRoute>} />
        <Route path="/vendor/settings" element={<ProtectedRoute allowedRoles={['vendor']}><SettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;