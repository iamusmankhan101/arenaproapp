import React, { useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
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
import { format } from 'date-fns';
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
  <Card sx={{
    background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)',
    color: '#fff',
    borderRadius: 2
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }} gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#fff' }}>
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp sx={{ color: '#e8ee26', fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#e8ee26', fontWeight: 600, fontSize: '0.8rem' }}>
                +{change}% from last month
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Override icon color to Gold */}
          {React.cloneElement(icon, { sx: { color: '#e8ee26', fontSize: 28 } })}
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

  const { monthlyData = [], sportsData = [], venuePerformance = [], summary = {}, recentTransactions = [] } = revenueReport || {};

  const handleExport = () => {
    // 1. Create CSV Content
    const headers = ['Date', 'Booking ID', 'Customer', 'Venue', 'Sport', 'Amount (PKR)', 'Status'];
    const rows = recentTransactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
      t.id,
      t.customerName,
      t.venueName,
      t.sport || 'N/A',
      t.amount,
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 2. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            onClick={handleExport}
            sx={{
              bgcolor: '#e8ee26',
              color: '#004d43',
              fontWeight: 700,
              '&:hover': { bgcolor: '#dce775' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
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
            value={`PKR ${summary.totalRevenue?.toLocaleString() || '0'} `}
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}% `}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sportsData.map((entry, index) => (
                    <Cell key={`cell - ${index} `} fill={entry.color} />
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
              <BarChart data={venuePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#004d43" style={{ fontSize: '11px', fontWeight: 500 }} />
                <YAxis stroke="#004d43" style={{ fontSize: '12px' }} />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `PKR ${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bookings'
                ]} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="bookings" fill="#004d43" name="Bookings" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="revenue" fill="#e8ee26" name="Revenue" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Sales Report Table */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, background: '#fff' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#004d43', mb: 2 }}>
            Detailed Sales Report
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#004d43' }}>
                  {['Date', 'Booking ID', 'Customer', 'Venue', 'Sport', 'Amount', 'Status'].map((head) => (
                    <TableCell key={head} sx={{ color: '#fff', fontWeight: 600, borderBottom: 'none' }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((row, index) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0, 77, 67, 0.02)' } }}
                    >
                      <TableCell sx={{ color: '#004d43', fontWeight: 500 }}>
                        {format(new Date(row.date), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell sx={{ color: '#555' }}>#{row.id.slice(0, 8)}...</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333' }}>{row.customerName}</TableCell>
                      <TableCell>{row.venueName}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.sport || 'General'}
                          size="small"
                          sx={{
                            bgcolor: row.sport === 'Football' ? 'rgba(0, 77, 67, 0.1)' : 'rgba(232, 238, 38, 0.2)',
                            color: row.sport === 'Football' ? '#004d43' : '#827717',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#004d43' }}>
                        PKR {row.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            bgcolor: row.status === 'completed' || row.status === 'confirmed' ? '#e8f5e9' : '#ffebee',
                            color: row.status === 'completed' || row.status === 'confirmed' ? '#2e7d32' : '#c62828',
                            textTransform: 'capitalize',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#666' }}>
                      No recent transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>
    </Box>
  );
}