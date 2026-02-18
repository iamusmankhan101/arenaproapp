import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Event,
  LocationOn,
  People,
  Analytics,
  Settings,
  Logout,
  AccountCircle,
  RateReview,
} from '@mui/icons-material';
import { logoutAdmin } from '../store/slices/authSlice';

const drawerWidth = 240;

const adminMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Bookings', icon: <Event />, path: '/bookings' },
  { text: 'Venues', icon: <LocationOn />, path: '/venues' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Reports', icon: <Analytics />, path: '/reports' },
  { text: 'Reviews', icon: <RateReview />, path: '/reviews' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const vendorMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/vendor/dashboard' },
  { text: 'My Venues', icon: <LocationOn />, path: '/vendor/venues' },
  { text: 'Bookings', icon: <Event />, path: '/vendor/bookings' },
  { text: 'Settings', icon: <Settings />, path: '/vendor/settings' },
];


export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { admin } = useSelector(state => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutAdmin());
    handleMenuClose();
  };

  const menuItems = admin?.role === 'vendor' ? vendorMenuItems : adminMenuItems;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#071a15', color: 'white' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1 }}>
          <img src="/logo.png" alt="Arena Pro" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 700, letterSpacing: 0.5 }}>
            Arena Pro
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, pl: 1, mb: 1, display: 'block' }}>
          NAVIGATION
        </Typography>
        <List>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) {
                      setMobileOpen(false);
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    mx: 0,
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, #004d43 0%, #00695c 100%)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#004d43',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  <ListItemIcon sx={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#004d43', fontSize: '0.8rem' }}>
            {admin?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ color: 'white' }}>
              {admin?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {admin?.role === 'vendor' ? 'Vendor' : 'Administrator'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', fontWeight: 700 }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
              sx={{
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' }
              }}
            >
              <AccountCircle color="primary" />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 180, borderRadius: 2 }
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', bgcolor: '#071a15' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', bgcolor: '#071a15' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f4f6f8',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}