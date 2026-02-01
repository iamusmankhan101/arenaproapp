import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Event,
  Today,
  Payments,
  LocationOn,
  People,
  Pending,
  TrendingUp,
  TrendingDown,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { fetchDashboardStats } from '../store/slices/adminSlice';

const StatCard = ({ title, value, icon, color, growth }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {growth !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {growth >= 0 ? (
                <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: growth >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 'medium',
                }}
              >
                {Math.abs(growth)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Overview
        </Typography>
        <IconButton onClick={handleRefresh} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Bookings"
            value={dashboardStats.totalBookings.toLocaleString()}
            icon={<Event />}
            color="#4CAF50"
            growth={dashboardStats.monthlyGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Today's Bookings"
            value={dashboardStats.todayBookings}
            icon={<Today />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Revenue"
            value={`PKR ${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`}
            icon={<Payments />}
            color="#FF9800"
            growth={dashboardStats.revenueGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Venues"
            value={dashboardStats.activeVenues}
            icon={<LocationOn />}
            color="#9C27B0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Customers"
            value={dashboardStats.totalCustomers}
            icon={<People />}
            color="#00BCD4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Bookings"
            value={dashboardStats.pendingBookings}
            icon={<Pending />}
            color="#F44336"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Bookings Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardStats.weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#4CAF50"
                  strokeWidth={3}
                  dot={{ fill: '#4CAF50', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardStats.weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#FF9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { icon: <Event />, text: 'New booking at Elite Football Arena', time: '2 min ago', color: '#4CAF50' },
                { icon: <People />, text: 'New customer registered', time: '15 min ago', color: '#2196F3' },
                { icon: <Payments />, text: 'Payment received for booking #PIT001234', time: '32 min ago', color: '#FF9800' },
                { icon: <LocationOn />, text: 'New venue added: Champions Arena', time: '1 hour ago', color: '#9C27B0' },
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: index < 3 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Avatar sx={{ bgcolor: activity.color, width: 32, height: 32, mr: 2 }}>
                    {React.cloneElement(activity.icon, { fontSize: 'small' })}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">{activity.text}</Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}