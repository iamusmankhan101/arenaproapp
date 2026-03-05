import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, admin, loading, initializing } = useSelector((state) => state.auth);
    const location = useLocation();

    if (loading || initializing) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Check role permission if allowedRoles is provided
    if (allowedRoles && !allowedRoles.includes(admin?.role)) {
        // Redirect based on role
        if (admin?.role === 'vendor') {
            return <Navigate to="/vendor/dashboard" replace />;
        } else if (admin?.role === 'admin' || admin?.role === 'super_admin') {
            return <Navigate to="/dashboard" replace />;
        } else {
            // Unknown role or guest
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
