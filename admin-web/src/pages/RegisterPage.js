import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Fade,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { registerAdmin, clearError } from '../store/slices/authSlice';

export default function RegisterPage({ onSwitchToLogin }) {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'vendor', // Only vendor registration allowed
    });
    const [localError, setLocalError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const textFieldStyle = {
        mb: 2.5,
        '& .MuiInputLabel-root': {
            color: '#004d43',
            fontWeight: 600,
            fontSize: '0.95rem',
            '&.Mui-focused': {
                color: '#004d43',
            },
            '&.MuiInputLabel-shrink': {
                color: '#004d43',
            }
        },
        '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            backgroundColor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            '& fieldset': {
                borderColor: 'rgba(0,77,67,0.2)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(0,77,67,0.4)',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#004d43',
                borderWidth: 2,
            },
        },
        '& .MuiInputBase-input': {
            px: 3,
            py: 1.8,
            fontSize: '0.95rem',
            color: '#004d43',
            '&::placeholder': {
                color: 'rgba(0,77,67,0.5)',
                opacity: 1,
            }
        },
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #004d43 0%, #00332d 100%)',
                position: 'relative',
                py: 4,
                px: 2,
                overflow: 'hidden',
            }}
        >
            <Fade in={true} timeout={1000}>
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 500,
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    {/* Logo */}
                    <Box sx={{ mb: 2 }}>
                        <img
                            src="/logo.png"
                            alt="Arena Pro"
                            style={{
                                width: 200,
                                height: 200,
                                objectFit: 'contain',
                            }}
                        />
                    </Box>

                    {/* Header Text */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: '#ffffff',
                            mb: 1,
                            textAlign: 'center',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            fontSize: { xs: '1.75rem', sm: '2.25rem' },
                        }}
                    >
                        Create Account
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            mb: 4,
                            textAlign: 'center',
                            fontWeight: 500
                        }}
                    >
                        Join the Arena Pro network today
                    </Typography>

                    {/* Form Container */}
                    <Box
                        sx={{
                            width: '100%',
                            p: { xs: 3, sm: 4 },
                            borderRadius: 6,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        {(error || localError) && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                                    color: '#ffcdd2',
                                    '& .MuiAlert-icon': { color: '#ef5350' }
                                }}
                            >
                                {localError || error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                                sx={textFieldStyle}
                            />

                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                                sx={textFieldStyle}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="At least 6 characters"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ mr: 1, color: '#004d43' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Repeat your password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                sx={{ mr: 1, color: '#004d43' }}
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    borderRadius: '25px',
                                    py: 1.8,
                                    fontSize: '1rem',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    background: 'linear-gradient(135deg, #e8ee26 0%, #d4db1c 100%)',
                                    color: '#004d43',
                                    boxShadow: '0 6px 25px rgba(232, 238, 38, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #d4db1c 0%, #c0c614 100%)',
                                        boxShadow: '0 8px 30px rgba(232, 238, 38, 0.4)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&.Mui-disabled': {
                                        background: 'rgba(232, 238, 38, 0.5)',
                                        color: 'rgba(0, 77, 67, 0.5)',
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: '#004d43' }} />
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                Already have an account?{' '}
                                <Box
                                    component="span"
                                    onClick={onSwitchToLogin}
                                    sx={{
                                        color: '#e8ee26',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: '3px',
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                >
                                    Sign In
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Box>
    );
}
