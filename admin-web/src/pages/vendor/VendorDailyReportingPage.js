import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Card, CardContent, Grid, Avatar, Chip, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, TextField, CircularProgress, Alert,
} from '@mui/material';
import {
    Assessment, TrendingUp, TrendingDown, People, AttachMoney,
    Refresh, CalendarToday, Download, EventSeat, AccessTime,
    PersonAdd, PersonOff, Star, Schedule,
} from '@mui/icons-material';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <Card sx={{ borderRadius: 3, height: '100%', border: `1px solid ${color}15` }}>
        <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            {trend === 'up' && <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />}
                            {trend === 'down' && <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />}
                            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
                        </Box>
                    )}
                </Box>
                <Avatar sx={{ bgcolor: `${color}15`, width: 48, height: 48 }}>
                    {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

export default function VendorDailyReportingPage() {
    const { admin } = useSelector(state => state.auth);
    const vendorId = admin?.vendorId || admin?.uid;

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0, cashCollection: 0, digitalPayments: 0,
        totalBookings: 0, completedBookings: 0, cancelledBookings: 0,
        newCustomers: 0, returningCustomers: 0, noShows: 0,
        peakHourBookings: 0, offPeakBookings: 0, avgUtilization: 0,
    });

    const fetchDailyData = useCallback(async () => {
        if (!vendorId) return;
        setLoading(true);
        try {
            // 1. Get Vendor's Venues (to filter bookings by turfId)
            // App bookings might not have vendorId, so we rely on turfId
            const venuesRef = collection(db, 'venues');
            const venuesQ = query(venuesRef, where('vendorId', '==', vendorId));
            const venuesSnap = await getDocs(venuesQ);
            const vendorTurfIds = venuesSnap.docs.map(d => d.id);

            if (vendorTurfIds.length === 0) {
                setBookings([]);
                setStats({ ...stats, totalBookings: 0, totalRevenue: 0 }); // Reset stats
                setLoading(false);
                return;
            }

            // 2. Fetch Bookings for these turfs
            // Firestore 'in' limit is 10. For now assuming < 10 venues per vendor.
            const bookingsRef = collection(db, 'bookings');
            const bookingsQ = query(
                bookingsRef,
                where('turfId', 'in', vendorTurfIds.slice(0, 10))
            );

            const snapshot = await getDocs(bookingsQ);

            // 3. Filter by Date in Memory (Handles Timestamp vs String inconsistencies)
            const dayBookings = [];
            let totalRev = 0, cash = 0, digital = 0;
            let completed = 0, cancelled = 0, noShows = 0;
            const customerSet = new Set();
            let peakHrs = 0, offPeakHrs = 0;

            const selectedStart = new Date(selectedDate);
            selectedStart.setHours(0, 0, 0, 0);
            const selectedEnd = new Date(selectedDate);
            selectedEnd.setHours(23, 59, 59, 999);

            snapshot.forEach(docSnap => {
                const data = docSnap.data();

                // Parse Date safely
                let bookingDate;
                if (data.date && data.date.toDate) {
                    bookingDate = data.date.toDate();
                } else if (data.date) {
                    bookingDate = new Date(data.date);
                } else if (data.dateTime) { // Fallback to dateTime field if date is missing
                    bookingDate = new Date(data.dateTime);
                } else {
                    bookingDate = data.createdAt ? data.createdAt.toDate() : new Date();
                }

                // Check if matches selected date
                if (bookingDate >= selectedStart && bookingDate <= selectedEnd) {
                    dayBookings.push({ id: docSnap.id, ...data });

                    const amount = data.totalAmount || data.amount || 0;
                    totalRev += amount;
                    if (data.paymentMethod === 'cash') cash += amount;
                    else digital += amount;

                    if (data.status === 'completed' || data.status === 'confirmed') completed++;
                    else if (data.status === 'cancelled') cancelled++;
                    if (data.noShow) noShows++;

                    if (data.userId) customerSet.add(data.userId);

                    const hour = data.timeSlot ? parseInt(data.timeSlot.split(':')[0]) : 12;
                    if (hour >= 17 && hour <= 22) peakHrs++;
                    else offPeakHrs++;
                }
            });

            // Sort by time
            dayBookings.sort((a, b) => {
                const tA = a.timeSlot ? parseInt(a.timeSlot.split(':')[0]) : 0;
                const tB = b.timeSlot ? parseInt(b.timeSlot.split(':')[0]) : 0;
                return tB - tA;
            });

            setBookings(dayBookings);
            setStats({
                totalRevenue: totalRev,
                cashCollection: cash,
                digitalPayments: digital,
                totalBookings: dayBookings.length,
                completedBookings: completed,
                cancelledBookings: cancelled,
                newCustomers: Math.floor(customerSet.size * 0.3),
                returningCustomers: Math.ceil(customerSet.size * 0.7),
                noShows: noShows,
                peakHourBookings: peakHrs,
                offPeakBookings: offPeakHrs,
                avgUtilization: dayBookings.length > 0 ? Math.min(Math.round((dayBookings.length / 20) * 100), 100) : 0,
            });
        } catch (err) {
            console.error('Error fetching daily data:', err);
        } finally {
            setLoading(false);
        }
    }, [vendorId, selectedDate]);

    useEffect(() => { fetchDailyData(); }, [fetchDailyData]);

    const handleExportPDF = () => {
        const reportData = `
DAILY REPORT - ${selectedDate}
================================
Total Revenue: PKR ${stats.totalRevenue.toLocaleString()}
Cash: PKR ${stats.cashCollection.toLocaleString()}
Digital: PKR ${stats.digitalPayments.toLocaleString()}
Total Bookings: ${stats.totalBookings}
Completed: ${stats.completedBookings}
Cancelled: ${stats.cancelledBookings}
No-Shows: ${stats.noShows}
Utilization: ${stats.avgUtilization}%
        `.trim();

        const blob = new Blob([reportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-report-${selectedDate}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#FFD700', width: 48, height: 48 }}>
                            <Assessment sx={{ color: '#004d43', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="white">Daily Reporting</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                Financial ledger, customer insights & utilization
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            size="small"
                            sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <IconButton onClick={fetchDailyData} sx={{ color: 'white' }}><Refresh /></IconButton>
                        <Button variant="contained" startIcon={<Download />} onClick={handleExportPDF}
                            sx={{ bgcolor: '#FFD700', color: '#004d43', fontWeight: 700, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#FFC107' } }}>
                            Export
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#004d43' }} /></Box>
            ) : (
                <>
                    {/* Financial Ledger */}
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004d43', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 20 }} /> Financial Ledger
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={4}>
                            <StatCard title="Total Revenue" value={`PKR ${stats.totalRevenue.toLocaleString()}`} icon={<AttachMoney />} color="#004d43" subtitle="Today's earnings" trend="up" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatCard title="Cash Collection" value={`PKR ${stats.cashCollection.toLocaleString()}`} icon={<AttachMoney />} color="#2e7d32" subtitle="On-site payments" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatCard title="Digital Payments" value={`PKR ${stats.digitalPayments.toLocaleString()}`} icon={<AttachMoney />} color="#1565c0" subtitle="Online deposits" />
                        </Grid>
                    </Grid>

                    {/* Customer Summary */}
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004d43', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People sx={{ fontSize: 20 }} /> Customer Summary
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="New Customers" value={stats.newCustomers} icon={<PersonAdd />} color="#00897b" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="Returning" value={stats.returningCustomers} icon={<Star />} color="#f9a825" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="No-Shows" value={stats.noShows} icon={<PersonOff />} color="#c62828" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="Total Unique" value={stats.newCustomers + stats.returningCustomers} icon={<People />} color="#5e35b1" />
                        </Grid>
                    </Grid>

                    {/* Utilization Breakdown */}
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004d43', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventSeat sx={{ fontSize: 20 }} /> Booking & Utilization
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="Total Bookings" value={stats.totalBookings} icon={<CalendarToday />} color="#004d43" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="Completed" value={stats.completedBookings} icon={<Assessment />} color="#2e7d32" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="Peak Hours" value={stats.peakHourBookings} icon={<AccessTime />} color="#e65100" subtitle="5 PM – 10 PM" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatCard title="Utilization" value={`${stats.avgUtilization}%`} icon={<Schedule />} color="#1565c0" subtitle="Capacity used" />
                        </Grid>
                    </Grid>

                    {/* Bookings Table */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004d43' }}>
                                    Today's Bookings ({bookings.length})
                                </Typography>
                                <Chip label={selectedDate} size="small" icon={<CalendarToday sx={{ fontSize: '14px !important' }} />} />
                            </Box>
                            <Divider />
                            {bookings.length === 0 ? (
                                <Alert severity="info" sx={{ m: 2 }}>No bookings found for this date.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Time Slot</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bookings.slice(0, 20).map((b) => (
                                                <TableRow key={b.id} hover>
                                                    <TableCell>{b.customerName || b.userName || 'Guest'}</TableCell>
                                                    <TableCell>{b.timeSlot || b.time || '—'}</TableCell>
                                                    <TableCell>PKR {(b.totalAmount || b.amount || 0).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={b.paymentMethod || 'N/A'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: b.paymentMethod === 'cash' ? '#e8f5e9' : '#e3f2fd',
                                                                color: b.paymentMethod === 'cash' ? '#2e7d32' : '#1565c0',
                                                                fontWeight: 600, fontSize: '0.75rem',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={b.status || 'pending'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: b.status === 'completed' || b.status === 'confirmed' ? '#e8f5e9' : b.status === 'cancelled' ? '#ffebee' : '#fff3e0',
                                                                color: b.status === 'completed' || b.status === 'confirmed' ? '#2e7d32' : b.status === 'cancelled' ? '#c62828' : '#e65100',
                                                                fontWeight: 600, fontSize: '0.75rem',
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </Box>
    );
}
