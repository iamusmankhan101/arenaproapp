import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
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

const monthlyData = [
  { month: 'Jan', bookings: 145, revenue: 217500, customers: 89 },
  { month: 'Feb', bookings: 167, revenue: 250500, customers: 102 },
  { month: 'Mar', bookings: 189, revenue: 283500, customers: 115 },
  { month: 'Apr', bookings: 201, revenue: 301500, customers: 128 },
  { month: 'May', bookings: 223, revenue: 334500, customers: 141 },
  { month: 'Jun', bookings: 245, revenue: 367500, customers: 154 },
];

const sportsData = [
  { name: 'Football', value: 45, color: '#4CAF50' },
  { name: 'Cricket', value: 35, color: '#FF9800' },
  { name: 'Padel', value: 20, color: '#2196F3' },
];

const venuePerformance = [
  { name: 'Elite Football Arena', bookings: 89, revenue: 133500 },
  { name: 'Sports Complex', bookings: 76, revenue: 114000 },
  { name: 'Green Field', bookings: 65, revenue: 97500 },
  { name: 'Victory Ground', bookings: 54, revenue: 81000 },
  { name: 'Champions Arena', bookings: 43, revenue: 64500 },
];

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
            value="1,247"
            icon={<Event />}
            color="#4CAF50"
            change={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="PKR 2.45M"
            icon={<Payments />}
            color="#FF9800"
            change={8.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Venues"
            value="15"
            icon={<LocationOn />}
            color="#2196F3"
            change={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value="892"
            icon={<People />}
            color="#9C27B0"
            change={15.7}
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Revenue']} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4CAF50"
                  fill="#4CAF50"
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2196F3"
                  strokeWidth={3}
                  dot={{ fill: '#2196F3', strokeWidth: 2, r: 6 }}
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#9C27B0" radius={[4, 4, 0, 0]} />
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
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `PKR ${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bookings'
                ]} />
                <Legend />
                <Bar dataKey="bookings" fill="#4CAF50" name="Bookings" />
                <Bar dataKey="revenue" fill="#FF9800" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}