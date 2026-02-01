import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  Container,
  Paper,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { loginAdmin, clearError, loadStoredAuth } from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error, initializing } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: 'admin@pitchit.com',
    password: 'admin123',
  });

  useEffect(() => {
    dispatch(loadStoredAuth());
  }, [dispatch]);

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

  if (initializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
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
              <AdminPanelSettings fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              PitchIt Admin
            </Typography>
            <Typography variant="subtitle1">
              Manage your turf booking platform
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
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
                autoFocus
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
                autoComplete="current-password"
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
            
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Demo Credentials:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: admin@pitchit.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Password: admin123
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
}