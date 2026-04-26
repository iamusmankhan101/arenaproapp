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
  Divider,
  Paper,
  Grid,
  Fade,
  Slide
} from '@mui/material';
import { Visibility, VisibilityOff, Dashboard, TrendingUp } from '@mui/icons-material';
import { loginAdmin, clearError } from '../store/slices/authSlice';

export default function LoginPage({ onSwitchToRegister }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAdmin(formData));
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
            right: '-50%',
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
            {/* Logo */}
            <Box
              sx={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                padding: '20px',
              }}
            >
              <img
                src="/logo.png"
                alt="Arena Pro Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
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
              Arena Pro Admin
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
              Manage your venues, bookings, and customers all in one powerful dashboard.
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
                <Dashboard sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Real-time Analytics
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
                <TrendingUp sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Revenue Tracking
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
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 77, 67, 0.15)',
                  padding: '15px',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Arena Pro Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
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
                Sign In
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#666', mb: 4 }}
              >
                Welcome back! Please enter your details
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: '#fff5f5',
                    border: '1px solid #ffebee',
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                    mb: 1,
                  }}
                >
                  Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="your.email@example.com"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  autoFocus
                  sx={{
                    mb: 3,
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
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                    mb: 1,
                  }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
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
                  sx={{
                    mb: 4,
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
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
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
                    'Sign In'
                  )}
                </Button>
              </Box>
            </Paper>

            {/* Sign Up Link */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Don't have an account?{' '}
                <Box
                  component="span"
                  onClick={onSwitchToRegister}
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
                  Create Account
                </Box>
              </Typography>
            </Box>

            {/* Download App Link */}
            <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.08)' } }}>
              <Typography variant="body2" sx={{ color: '#999', px: 1, fontSize: '0.8rem' }}>
                OR
              </Typography>
            </Divider>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => window.open('https://arenapro.pk/ArenaPro.apk', '_blank')}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                color: '#004d43',
                borderColor: '#e0e0e0',
                borderWidth: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#004d43',
                  borderWidth: 1.5,
                  bgcolor: 'rgba(0, 77, 67, 0.04)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Download Android App (APK)
            </Button>
          </Box>
        </Slide>
      </Grid>
    </Grid>
  );
}