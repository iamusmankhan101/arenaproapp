import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Avatar,
    Container,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { PersonAdd, AdminPanelSettings, Store } from '@mui/icons-material';
import { registerAdmin, clearError } from '../store/slices/authSlice';

export default function RegisterPage({ onSwitchToLogin }) {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
    });
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setLocalError('');
    };

    const handleRoleChange = (_, newRole) => {
        if (newRole !== null) {
            setFormData({ ...formData, role: newRole });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');

        if (!formData.fullName.trim()) {
            setLocalError('Please enter your full name.');
            return;
        }
        if (formData.password.length < 6) {
            setLocalError('Password must be at least 6 characters.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }

        dispatch(registerAdmin({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName.trim(),
            role: formData.role,
        }));
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #004d43 0%, #006b5a 100%)',
                padding: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            py: 4,
                            textAlign: 'center',
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                width: 64,
                                height: 64,
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            <PersonAdd fontSize="large" />
                        </Avatar>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Create Account
                        </Typography>
                        <Typography variant="subtitle1">
                            Register as Admin or Vendor
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        {(error || localError) && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {localError || error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            {/* Role Selector */}
                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    Account Type
                                </Typography>
                                <ToggleButtonGroup
                                    value={formData.role}
                                    exclusive
                                    onChange={handleRoleChange}
                                    fullWidth
                                    size="large"
                                    sx={{
                                        '& .MuiToggleButton-root': {
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                        },
                                        '& .Mui-selected': {
                                            backgroundColor: 'primary.main !important',
                                            color: 'white !important',
                                        },
                                    }}
                                >
                                    <ToggleButton value="admin">
                                        <AdminPanelSettings sx={{ mr: 1 }} /> Admin
                                    </ToggleButton>
                                    <ToggleButton value="vendor">
                                        <Store sx={{ mr: 1 }} /> Vendor
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <TextField
                                fullWidth
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                margin="normal"
                                required
                                autoFocus
                            />

                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                margin="normal"
                                required
                                autoComplete="email"
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                margin="normal"
                                required
                                helperText="At least 6 characters"
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={onSwitchToLogin}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    Sign In
                                </Button>
                            </Typography>
                        </Box>
                    </CardContent>
                </Paper>
            </Container>
        </Box>
    );
}
