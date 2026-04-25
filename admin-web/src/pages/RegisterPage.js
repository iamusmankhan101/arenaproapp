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
    Grid
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
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#f8faf8',
            '& fieldset': {
                borderColor: 'rgba(0,77,67,0.1)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(0,77,67,0.3)',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#004d43',
                borderWidth: 2,
            },
        },
        '& .MuiInputBase-input': {
            px: 2,
            py: 1.5,
            color: '#004d43',
        },
    };

    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side - Image & Branding */}
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
                    backgroundImage: 'url(/login-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 77, 67, 0.85)', // Green overlay
                        zIndex: 1,
                    },
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', px: 4 }}>
                    <img
                        src="/logo.png"
                        alt="Arena Pro"
                        style={{
                            width: 200,
                            height: 200,
                            objectFit: 'contain',
                            marginBottom: '2rem',
                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))'
                        }}
                    />
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
                        Join Arena Pro
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 400, mx: 'auto' }}>
                        Start managing your sports venue with Pakistan's premier platform.
                    </Typography>
                </Box>
            </Grid>

            {/* Right Side - Form */}
            <Grid
                item
                xs={12}
                md={6}
                component={Paper}
                elevation={0}
                square
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 3, sm: 6, md: 8, lg: 12 },
                    backgroundColor: '#ffffff',
                    py: { xs: 4, md: 0 },
                }}
            >
                <Fade in={true} timeout={1000}>
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 450,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Mobile Logo */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
                            <img
                                src="/logo.png"
                                alt="Arena Pro"
                                style={{
                                    width: 140,
                                    height: 140,
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: '#004d43',
                                mb: 1,
                            }}
                        >
                            Create Account
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: '#666', mb: 4 }}
                        >
                            Fill in the details below to get started.
                        </Typography>

                        {(error || localError) && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                }}
                            >
                                {localError || error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#004d43', mb: 1 }}>
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

                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#004d43', mb: 1 }}>
                                Email Address
                            </Typography>
                            <TextField
                                fullWidth
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                                sx={textFieldStyle}
                            />

                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#004d43', mb: 1 }}>
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
                                                sx={{ color: '#004d43' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />

                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#004d43', mb: 1 }}>
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
                                                sx={{ color: '#004d43' }}
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
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    background: '#e8ee26',
                                    color: '#004d43',
                                    boxShadow: 'none',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        background: '#d4db1c',
                                        boxShadow: '0 4px 12px rgba(232, 238, 38, 0.3)',
                                        transform: 'translateY(-1px)',
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
                                        transition: 'color 0.2s',
                                        '&:hover': {
                                            color: '#00332d',
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Sign in here
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </Fade>
            </Grid>
        </Grid>
    );
}
