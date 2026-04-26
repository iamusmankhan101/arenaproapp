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
    Paper,
    Grid,
    Slide
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    SportsSoccer,
    CheckCircle,
    Security
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
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#f8f8f8',
            transition: 'all 0.2s',
            '& fieldset': {
                borderColor: '#e0e0e0',
            },
            '&:hover': {
                backgroundColor: '#ffffff',
                '& fieldset': {
                    borderColor: '#004d43',
                },
            },
            '&.Mui-focused': {
                backgroundColor: '#ffffff',
                '& fieldset': {
                    borderColor: '#004d43',
                    borderWidth: 2,
                },
            },
        },
        '& .MuiInputBase-input': {
            px: 2,
            py: 1.75,
            color: '#1a1a1a',
            fontSize: '0.95rem',
        },
    };

    return (
        <Grid container sx={{ minHeight: '100vh', backgroundColor: '#f8faf8' }}>
            {/* Left Side - Branding with Gradient */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #004d43 0%, #006b5c 50%, #008975 100%)',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle, rgba(212, 225, 87, 0.1) 0%, transparent 70%)',
                        animation: 'pulse 8s ease-in-out infinite',
                    },
                    '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                    },
                }}
            >
                <Fade in={true} timeout={1000}>
                    <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', px: 4, maxWidth: 500 }}>
                        {/* Logo/Icon */}
                        <Box
                            sx={{
                                width: 140,
                                height: 140,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 2rem',
                                border: '3px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <SportsSoccer sx={{ fontSize: 80, color: '#e8ee26' }} />
                        </Box>

                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 800, 
                                mb: 2, 
                                letterSpacing: '-0.5px',
                                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                            }}
                        >
                            Join Arena Pro
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 400, 
                                opacity: 0.95, 
                                lineHeight: 1.6,
                                mb: 4
                            }}
                        >
                            Start managing your sports venue with Pakistan's premier platform.
                        </Typography>

                        {/* Feature Pills */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2.5,
                                    py: 1.5,
                                    borderRadius: '50px',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                <CheckCircle sx={{ fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Easy Setup
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2.5,
                                    py: 1.5,
                                    borderRadius: '50px',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                <Security sx={{ fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Secure Platform
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            </Grid>

            {/* Right Side - Form */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 3, sm: 6, md: 8, lg: 12 },
                    py: { xs: 6, md: 4 },
                    backgroundColor: '#f8faf8',
                }}
            >
                <Slide direction="left" in={true} timeout={800}>
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 480,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Mobile Logo */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #004d43 0%, #008975 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <SportsSoccer sx={{ fontSize: 60, color: '#e8ee26' }} />
                            </Box>
                        </Box>

                        {/* Form Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: '24px',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 4px 24px rgba(0, 77, 67, 0.08)',
                                border: '1px solid rgba(0, 77, 67, 0.08)',
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    color: '#004d43',
                                    mb: 1,
                                }}
                            >
                                Sign Up
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ color: '#666', mb: 4 }}
                            >
                                Create your account to get started
                            </Typography>

                            {(error || localError) && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        backgroundColor: '#fff5f5',
                                        border: '1px solid #ffebee',
                                    }}
                                >
                                    {localError || error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit}>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a1a', mb: 1 }}>
                                    Full Name
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                    sx={textFieldStyle}
                                />

                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a1a', mb: 1 }}>
                                    Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your.email@example.com"
                                    sx={textFieldStyle}
                                />

                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a1a', mb: 1 }}>
                                    Password
                                </Typography>
                                <TextField
                                    fullWidth
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
                                                    sx={{ 
                                                        color: '#004d43',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 77, 67, 0.08)',
                                                        },
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={textFieldStyle}
                                />

                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a1a', mb: 1 }}>
                                    Confirm Password
                                </Typography>
                                <TextField
                                    fullWidth
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
                                                    sx={{ 
                                                        color: '#004d43',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 77, 67, 0.08)',
                                                        },
                                                    }}
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
                                        mt: 1,
                                        borderRadius: '12px',
                                        py: 1.75,
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        background: '#e8ee26',
                                        color: '#004d43',
                                        boxShadow: '0 4px 14px rgba(232, 238, 38, 0.4)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            background: '#d4db1c',
                                            boxShadow: '0 6px 20px rgba(232, 238, 38, 0.5)',
                                            transform: 'translateY(-2px)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                        '&.Mui-disabled': {
                                            background: '#f4f6b3',
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
                        </Paper>

                        {/* Sign In Link */}
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Already have an account?{' '}
                                <Box
                                    component="span"
                                    onClick={onSwitchToLogin}
                                    sx={{
                                        color: '#004d43',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            color: '#00332d',
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Sign In
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </Slide>
            </Grid>
        </Grid>
    );
}
