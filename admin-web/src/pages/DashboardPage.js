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

const StatCard = ({ title, value, icon, color, growth, variant = 'light' }) => {
  const isDark = variant === 'dark';

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: isDark ? '#071a15' : 'white',
        color: isDark ? 'white' : 'text.primary',
        borderRadius: 4,
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isDark && (
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            bgcolor: '#004d43',
            opacity: 0.2,
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
      )}
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : `${color}15`,
              color: isDark ? '#4CAF50' : color
            }}
          >
            {React.cloneElement(icon, { fontSize: 'small' })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: -1 }}>
              {value}
            </Typography>

            {growth !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {growth >= 0 ? (
                  <TrendingUp sx={{ color: isDark ? '#4CAF50' : 'success.main', fontSize: 16 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: growth >= 0 ? (isDark ? '#4CAF50' : 'success.main') : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {Math.abs(growth)}% <Box component="span" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary', fontWeight: 400 }}>than last month</Box>
                </Typography>
              </Box>
            )}
          </Box>

          {/* Simple distinctive visualization for cards */}
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 40, opacity: 0.8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: `${Math.random() * 80 + 20}%`,
                  bgcolor: isDark ? '#004d43' : color,
                  borderRadius: 1
                }}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={handleRefresh}>
            <Refresh />
          </IconButton>
          <Box
            component="button"
            sx={{
              bgcolor: '#071a15',
              color: 'white',
              border: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'black', transform: 'translateY(-1px)' }
            }}
          >
            Add Custom Widget
          </Box>
        </Box>
      </Box>

      {/* Top Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Dark Hero Card */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Bookings"
            value={dashboardStats.totalBookings.toLocaleString()}
            icon={<Event />}
            color="#4CAF50"
            growth={dashboardStats.monthlyGrowth}
            variant="dark"
          />
        </Grid>

        {/* Light Cards */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Revenue"
            value={`PKR ${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`}
            icon={<Payments />}
            color="#FF9800"
            growth={dashboardStats.revenueGrowth}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Venues"
            value={dashboardStats.activeVenues}
            icon={<LocationOn />}
            color="#004d43"
            growth={5.1}
          />
        </Grid>
      </Grid>

      {/* Middle Row - Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Weekly Trends</Typography>
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, px: 1.5, py: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Last 7 Days</Typography>
                </Box>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardStats.weeklyStats} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="bookings" fill="#004d43" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', bgcolor: '#e8f5e9' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#004d43' }}>
                {dashboardStats.totalCustomers.toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#2e7d32', mb: 4, fontWeight: 600 }}>
                TOTAL REGISTERED PLAYERS
              </Typography>

              <Box sx={{ mt: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(0,77,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <People sx={{ color: '#004d43' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Active Players</Typography>
                    <Typography variant="caption" color="text.secondary">85% of total</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(0,77,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocationOn sx={{ color: '#004d43' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Top Region</Typography>
                    <Typography variant="caption" color="text.secondary">Lahore</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row - Recent Activity */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Activity</Typography>
            <Box sx={{ bgcolor: 'black', color: 'white', borderRadius: 4, px: 2, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
              All activities
            </Box>
          </Box>
          <Box>
            {[
              { icon: <Event />, text: 'New booking at Elite Football Arena', time: '2 min ago', color: '#4CAF50', status: 'Confirmed' },
              { icon: <People />, text: 'New customer registered: Ali Khan', time: '15 min ago', color: '#2196F3', status: 'New' },
              { icon: <Payments />, text: 'Payment received for booking #PIT001234', time: '32 min ago', color: '#FF9800', status: 'Completed' },
              { icon: <LocationOn />, text: 'New venue added: Champions Arena', time: '1 hour ago', color: '#9C27B0', status: 'Pending' },
            ].map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 3,
                  borderBottom: index < 3 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: '#f9fafb' }
                }}
              >
                <Avatar sx={{ bgcolor: `${activity.color}15`, color: activity.color, width: 48, height: 48, mr: 2, borderRadius: 3 }}>
                  {React.cloneElement(activity.icon, { fontSize: 'small' })}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{activity.text}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {activity.time}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 4,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'text.secondary'
                  }}
                >
                  {activity.status}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}