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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #e6f2f0 40%, #b3d9d2 70%, #004d43 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,77,67,0.15) 100%)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ mb: 1, textAlign: 'center', zIndex: 1 }}>
        <img
          src="/logo.png"
          alt="Arena Pro"
          style={{
            width: 80,
            height: 80,
            objectFit: 'contain',
            marginBottom: 8,
          }}
        />
      </Box>

      {/* Welcome Text */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: '#004d43',
          mb: 5,
          zIndex: 1,
          textAlign: 'center',
          fontSize: { xs: '1.8rem', sm: '2.5rem' },
        }}
      >
        Welcome back!
      </Typography>

      {/* Form Container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          px: { xs: 3, sm: 0 },
          zIndex: 1,
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 3,
              '& .MuiAlert-icon': { color: '#d32f2f' },
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#1a1a1a',
              mb: 1,
            }}
          >
            Your email address
          </Typography>
          <TextField
            fullWidth
            placeholder="Your email address"
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
                borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                '& fieldset': {
                  borderColor: 'rgba(0,77,67,0.15)',
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
                px: 3,
                py: 1.8,
                fontSize: '0.95rem',
              },
            }}
          />

          {/* Password Field */}
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#1a1a1a',
              mb: 1,
            }}
          >
            Password
          </Typography>
          <TextField
            fullWidth
            placeholder="Your password"
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
                    sx={{ mr: 0.5, color: '#004d43' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                '& fieldset': {
                  borderColor: 'rgba(0,77,67,0.15)',
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
                px: 3,
                py: 1.8,
                fontSize: '0.95rem',
              },
            }}
          />

          {/* Sign In Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: '50px',
              py: 1.8,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #004d43 0%, #006b5a 50%, #004d43 100%)',
              backgroundSize: '200% 100%',
              boxShadow: '0 6px 25px rgba(0,77,67,0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundPosition: '100% 0',
                boxShadow: '0 8px 30px rgba(0,77,67,0.5)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&.Mui-disabled': {
                background: 'rgba(0,77,67,0.5)',
                color: 'rgba(255,255,255,0.7)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Create Account Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: '#555' }}
            >
              Don't have an account?{' '}
              <Box
                component="span"
                onClick={onSwitchToRegister}
                sx={{
                  color: '#004d43',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    opacity: 0.7,
                  },
                }}
              >
                Create Account
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}