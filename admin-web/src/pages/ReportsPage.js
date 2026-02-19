import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueReport } from '../store/slices/adminSlice';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  GetApp,
  TrendingUp,
  Event,
  LocationOn,
  People,
  Payments,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label, measure = 'Value', prefix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#004d43' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: '#00796b' }}>
          {measure}: {prefix}{Number(payload[0].value).toLocaleString()}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const StatCard = ({ title, value, icon, color, change }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                +{change}% from last month
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: color,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { revenueReport, reportsLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchRevenueReport());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchRevenueReport());
  }, [dispatch]);

  const { monthlyData = [], sportsData = [], venuePerformance = [], summary = {} } = revenueReport || {};

  if (reportsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#004d43' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Assessment sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
                Reports & Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Detailed insights into performance and revenue
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<GetApp />}
            sx={{ bgcolor: '#e8ee26', color: '#004d43', fontWeight: 700, '&:hover': { bgcolor: '#dce775' } }}
          >
            Export Report
          </Button>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={summary.totalBookings?.toLocaleString() || '0'}
            icon={<Event />}
            color="#004d43"
            change={summary.bookingsChange || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`PKR ${summary.totalRevenue?.toLocaleString() || '0'}`}
            icon={<Payments />}
            color="#e8ee26"
            change={summary.revenueChange || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Venues"
            value={summary.activeVenues || '0'}
            icon={<LocationOn />}
            color="#00897b"
          // change={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={summary.totalCustomers?.toLocaleString() || '0'}
            icon={<People />}
            color="#7b1fa2"
          // change={15.7}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend (Last 6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#004d43" style={{ fontSize: '12px' }} />
                <YAxis stroke="#004d43" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip measure="Revenue" prefix="PKR " />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#004d43"
                  fill="#004d43"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sports Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sports Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sportsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sportsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bookings Trend */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Bookings
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#004d43" style={{ fontSize: '12px' }} />
                <YAxis stroke="#004d43" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip measure="Bookings" />} />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#00796b"
                  strokeWidth={3}
                  dot={{ fill: '#00796b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Customer Growth */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#004d43" style={{ fontSize: '12px' }} />
                <YAxis stroke="#004d43" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip measure="Active Customers" />} />
                <Bar dataKey="customers" fill="#e8ee26" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Performing Venues */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Venues
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={venuePerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" stroke="#004d43" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" width={150} stroke="#004d43" style={{ fontSize: '11px', fontWeight: 500 }} />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `PKR ${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bookings'
                ]} />
                <Legend />
                <Bar dataKey="bookings" fill="#004d43" name="Bookings" radius={[0, 4, 4, 0]} />
                <Bar dataKey="revenue" fill="#e8ee26" name="Revenue" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}