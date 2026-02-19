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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  const handleExport = async () => {
    try {
      console.log('📄 Exporting PDF report with identity...');

      const loadImage = (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
        });
      };

      const logoImg = await loadImage('/logo.png');
      const doc = new jsPDF();
      const brandTeal = '#004d43';

      // --- Header Section ---
      doc.setFillColor(brandTeal);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ARENA PRO', 14, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dateStr = format(new Date(), 'dd MMM yyyy HH:mm');
      doc.text(`Generated on: ${dateStr}`, 14, 32);

      doc.setFontSize(14);
      doc.text('SALES STATEMENT', 150, 25, { align: 'right' });

      // Add Logo if exists
      if (logoImg) {
        doc.addImage(logoImg, 'PNG', 160, 6, 28, 14); // Positioned in header
      }

      // --- Summary Cards Section ---
      doc.setTextColor(brandTeal);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SUMMARY OVERVIEW', 14, 55);

      // Render 4 summary boxes
      const summaryItems = [
        { label: 'Total Bookings', value: summary.totalBookings?.toLocaleString() || '0' },
        { label: 'Total Revenue', value: `PKR ${summary.totalRevenue?.toLocaleString() || '0'}` },
        { label: 'Active Venues', value: String(summary.activeVenues || '0') },
        { label: 'Total Customers', value: summary.totalCustomers?.toLocaleString() || '0' }
      ];

      summaryItems.forEach((item, index) => {
        const x = 14 + (index * 48);

        // Branded border (using brand teal)
        doc.setDrawColor(0, 77, 67);
        doc.setLineWidth(0.5);
        doc.rect(x, 60, 42, 25);

        // Sub-box for label (gold background)
        doc.setFillColor(232, 238, 38); // brand gold #e8ee26
        doc.rect(x, 60, 42, 7, 'F');

        doc.setFontSize(7);
        doc.setTextColor(0, 77, 67); // dark teal text on gold
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.label).toUpperCase(), x + 21, 65, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(brandTeal);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.value), x + 21, 78, { align: 'center' });
      });

      // --- Detailed Table Section ---
      doc.setTextColor(brandTeal);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED SALES REPORT', 14, 100);

      autoTable(doc, {
        startY: 105,
        head: [['Date', 'Booking ID', 'Customer', 'Venue', 'Sport', 'Amount', 'Status']],
        body: recentTransactions.map(t => [
          format(new Date(t.date), 'MMM dd, yyyy HH:mm'),
          `#${String(t.id || '').split('-')[0].toUpperCase()}`, // Safer ID slice/format
          String(t.customerName || 'N/A'),
          String(t.venueName || 'N/A'),
          String(t.sport || 'General'),
          `PKR ${Number(t.amount || 0).toLocaleString()}`,
          String(t.status || 'N/A').toUpperCase()
        ]),
        headStyles: {
          fillColor: [0, 77, 67], // #004d43
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          5: { fontStyle: 'bold', textColor: [0, 77, 67] } // Amount column
        },
        margin: { top: 10, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Footer: Page Number
          const str = 'Page ' + String(doc.internal.getNumberOfPages());
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(str, 196, 285, { align: 'right' });
        }
      });

      // --- Save the PDF ---
      doc.save(`ArenaPro_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
      console.log('✅ PDF export successful');
    } catch (error) {
      console.error('❌ PDF Export Error:', error);
      alert('Failed to generate report. Please try again.');
    }
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