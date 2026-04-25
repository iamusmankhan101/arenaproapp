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
  Grid
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
            Arena Pro Admin
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 400, mx: 'auto' }}>
            Manage your venues, bookings, and customers all in one powerful dashboard.
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
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 450,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
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
            Welcome Back
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#666', mb: 4 }}
          >
            Please enter your details to sign in.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#004d43',
                mb: 1,
              }}
            >
              Email Address
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your email"
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
              }}
            />

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#004d43',
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
                      sx={{ color: '#004d43' }}
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
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
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
                'Sign In'
              )}
            </Button>

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
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: '#00332d',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create one now
                </Box>
              </Typography>
            </Box>

            <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.08)' } }}>
              <Typography variant="body2" sx={{ color: '#999', px: 1 }}>OR</Typography>
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
                borderWidth: 1,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#004d43',
                  bgcolor: 'rgba(0, 77, 67, 0.04)',
                }
              }}
            >
              Download Android App (APK)
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}