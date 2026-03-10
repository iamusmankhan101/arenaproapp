import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    TextField,
    InputAdornment,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Payments,
    GetApp,
    TrendingUp,
    CalendarToday,
    Search,
    Refresh,
    AttachMoney,
    ShowChart,
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { fetchBookings, fetchRevenueReport } from '../store/slices/adminSlice';
import { format, parse, startOfMonth, endOfMonth, isWithinInterval, getDate } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmtPKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

const formatTimeSlot = (ts) => {
    if (!ts || ts === 'N/A') return ts || 'N/A';
    if (ts.toUpperCase().includes('AM') || ts.toUpperCase().includes('PM')) return ts;
    try {
        if (ts.includes(' - ')) {
            const [s, e] = ts.split(' - ');
            const fmt = t => format(parse(t.trim(), 'HH:mm', new Date()), 'hh:mm a');
            return `${fmt(s)} - ${fmt(e)}`;
        }
        return format(parse(ts.trim(), 'HH:mm', new Date()), 'hh:mm a');
    } catch { return ts; }
};

// Detect peak hours (evening 5 PM–11 PM and weekends)
const isPeakHour = (booking) => {
    try {
        const d = new Date(booking.dateTime || booking.date);
        const hour = d.getHours();
        const dow = d.getDay();
        return (hour >= 17 && hour < 23) || dow === 0 || dow === 6;
    } catch { return false; }
};

const PEAK_COLOR = '#004d43';
const OFFPEAK_COLOR = '#e8ee26';

const paymentStatusColor = {
    paid: { bg: '#e8f5e9', text: '#2e7d32' },
    pending: { bg: '#fff3e0', text: '#e65100' },
    unpaid: { bg: '#ffebee', text: '#c62828' },
};

// ─── sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, sub, icon, gradient = false }) => (
    <Card sx={{
        borderRadius: 3,
        height: '100%',
        background: gradient
            ? 'linear-gradient(135deg, #004d43 0%, #00796b 100%)'
            : 'white',
        boxShadow: gradient
            ? '0 8px 24px rgba(0,77,67,0.25)'
            : '0 2px 12px rgba(0,0,0,0.06)',
    }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="caption" sx={{
                    color: gradient ? 'rgba(255,255,255,0.75)' : 'text.secondary',
                    fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1,
                }}>
                    {title}
                </Typography>
                <Box sx={{
                    p: 1, borderRadius: 2,
                    bgcolor: gradient ? 'rgba(255,255,255,0.15)' : 'rgba(0,77,67,0.1)',
                    color: gradient ? '#e8ee26' : '#004d43',
                }}>
                    {React.cloneElement(icon, { fontSize: 'small' })}
                </Box>
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: gradient ? '#fff' : '#004d43', mb: 0.5 }}>
                {value}
            </Typography>
            {sub && (
                <Typography variant="caption" sx={{ color: gradient ? 'rgba(255,255,255,0.65)' : 'text.secondary' }}>
                    {sub}
                </Typography>
            )}
        </CardContent>
    </Card>
);

// ─── main page ────────────────────────────────────────────────────────────────

export default function RevenueManagementPage() {
    const dispatch = useDispatch();
    const { admin } = useSelector(state => state.auth);
    const { bookings, bookingsLoading, revenueReport, reportsLoading } = useSelector(
        state => state.admin,
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const loadData = useCallback(() => {
        const vendorId = admin?.role === 'vendor' ? (admin.vendorId || admin.uid) : null;
        dispatch(fetchBookings({ page: 0, pageSize: 500, filter: 'all', search: '', vendorId }));
        dispatch(fetchRevenueReport({ vendorId }));
    }, [dispatch, admin]);

    useEffect(() => { loadData(); }, [loadData]);

    const allBookings = bookings?.data || [];
    const { monthlyData = [], venuePerformance = [], summary = {}, recentTransactions = [], dailyData = [] } = revenueReport || {};

    // ── derived revenue metrics ───────────────────────────────────────────────

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const todayRevenue = allBookings
        .filter(b => {
            try { return format(new Date(b.dateTime || b.date), 'yyyy-MM-dd') === todayStr; } catch { return false; }
        })
        .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const thisMonthRevenue = allBookings
        .filter(b => {
            try {
                return isWithinInterval(new Date(b.dateTime || b.date), { start: thisMonthStart, end: thisMonthEnd });
            } catch { return false; }
        })
        .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const peakBookings = allBookings.filter(isPeakHour);
    const offPeakBookings = allBookings.filter(b => !isPeakHour(b));
    const peakRevenue = peakBookings.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    const offPeakRevenue = offPeakBookings.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    const totalRevenue = peakRevenue + offPeakRevenue;
    const peakPct = totalRevenue > 0 ? ((peakRevenue / totalRevenue) * 100).toFixed(1) : 0;

    const avgPerBooking = allBookings.length
        ? Math.round(allBookings.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0) / allBookings.length)
        : 0;

    // Peak vs off-peak pie data
    const peakPieData = [
        { name: 'Peak Hours', value: peakRevenue, color: PEAK_COLOR },
        { name: 'Off-Peak Hours', value: offPeakRevenue, color: OFFPEAK_COLOR },
    ];

    // Daily earnings for current month
    const daysInMonth = new Array(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
        .fill(0).map((_, i) => ({ day: i + 1, revenue: 0 }));
    allBookings.forEach(b => {
        try {
            const d = new Date(b.dateTime || b.date);
            if (isWithinInterval(d, { start: thisMonthStart, end: thisMonthEnd })) {
                const dayIdx = getDate(d) - 1;
                daysInMonth[dayIdx].revenue += Number(b.totalAmount) || 0;
            }
        } catch { /* skip */ }
    });

    // Revenue by venue
    const venueRevenueMap = {};
    allBookings.forEach(b => {
        const name = b.turfName || 'Unknown';
        if (!venueRevenueMap[name]) venueRevenueMap[name] = { name, revenue: 0, bookings: 0 };
        venueRevenueMap[name].revenue += Number(b.totalAmount) || 0;
        venueRevenueMap[name].bookings += 1;
    });
    const venueRevenueList = Object.values(venueRevenueMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);

    // ── filtered transaction table ────────────────────────────────────────────

    const tableRows = allBookings.filter(b => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
            !q ||
            (b.customerName || '').toLowerCase().includes(q) ||
            (b.turfName || '').toLowerCase().includes(q);

        const matchPayment =
            paymentFilter === 'all' || (b.paymentStatus || 'pending') === paymentFilter;

        const matchFrom = !dateFrom || (() => {
            try { return new Date(b.dateTime || b.date) >= new Date(dateFrom); } catch { return true; }
        })();
        const matchTo = !dateTo || (() => {
            try { return new Date(b.dateTime || b.date) <= new Date(dateTo + 'T23:59:59'); } catch { return true; }
        })();

        return matchSearch && matchPayment && matchFrom && matchTo;
    });

    // ── PDF export ────────────────────────────────────────────────────────────

    const handleExport = async () => {
        try {
            const doc = new jsPDF();
            const brandTeal = '#004d43';

            // Header
            doc.setFillColor(brandTeal);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('ARENA PRO', 14, 22);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy hh:mm a')}`, 14, 35);
            doc.setFontSize(14);
            doc.text('REVENUE MANAGEMENT REPORT', 196, 22, { align: 'right' });

            // Summary boxes
            doc.setTextColor(brandTeal);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('SUMMARY', 14, 55);

            const summaryItems = [
                { label: "Today's Revenue", value: fmtPKR(todayRevenue) },
                { label: 'This Month Revenue', value: fmtPKR(thisMonthRevenue) },
                { label: 'Peak Hour Revenue', value: `${peakPct}%` },
                { label: 'Avg per Booking', value: fmtPKR(avgPerBooking) },
            ];
            summaryItems.forEach((item, i) => {
                const x = 14 + i * 48;
                doc.setDrawColor(0, 77, 67); doc.setLineWidth(0.5);
                doc.rect(x, 60, 42, 25);
                doc.setFillColor(232, 238, 38);
                doc.rect(x, 60, 42, 7, 'F');
                doc.setFontSize(6); doc.setTextColor(0, 77, 67); doc.setFont('helvetica', 'bold');
                doc.text(item.label.toUpperCase(), x + 21, 65, { align: 'center' });
                doc.setFontSize(9); doc.setTextColor(brandTeal); doc.setFont('helvetica', 'bold');
                doc.text(item.value, x + 21, 78, { align: 'center' });
            });

            doc.setTextColor(brandTeal); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            doc.text('TRANSACTIONS', 14, 100);

            autoTable(doc, {
                startY: 105,
                head: [['Date', 'Customer', 'Venue', 'Amount', 'Payment', 'Status']],
                body: tableRows.map(b => [
                    (() => { try { return format(new Date(b.dateTime || b.date), 'MMM dd, yyyy'); } catch { return 'N/A'; } })(),
                    b.customerName || 'N/A',
                    b.turfName || 'N/A',
                    fmtPKR(b.totalAmount),
                    b.paymentStatus || 'pending',
                    (b.status || 'N/A').toUpperCase(),
                ]),
                headStyles: { fillColor: [0, 77, 67], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
                bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: { 3: { fontStyle: 'bold', textColor: [0, 77, 67] } },
                margin: { top: 10, left: 14, right: 14 },
                didDrawPage: (data) => {
                    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
                    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 196, 285, { align: 'right' });
                },
            });

            doc.save(`ArenaPro_Revenue_${format(new Date(), 'yyyyMMdd')}.pdf`);
        } catch (err) {
            console.error('PDF export error:', err);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const loading = bookingsLoading || reportsLoading;

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Box>
            {/* ── Header ── */}
            <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
                <CardContent sx={{
                    p: { xs: 2, sm: 3 },
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <AttachMoney sx={{ color: '#fff', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
                                Revenue Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', display: { xs: 'none', sm: 'block' } }}>
                                Track daily earnings · manage peak and off-peak pricing · export reports
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={loadData}
                            disabled={loading}
                            size="small"
                            startIcon={<Refresh />}
                            sx={{
                                color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 2,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'white' },
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            onClick={handleExport}
                            size="small"
                            startIcon={<GetApp />}
                            sx={{
                                bgcolor: '#e8ee26', color: '#004d43', fontWeight: 700, borderRadius: 2,
                                '&:hover': { bgcolor: '#dce775' },
                            }}
                        >
                            Export PDF
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* ── Stat Cards ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="Today's Revenue"
                        value={fmtPKR(todayRevenue)}
                        sub="live as of now"
                        icon={<CalendarToday />}
                        gradient
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="This Month"
                        value={fmtPKR(thisMonthRevenue)}
                        sub={format(today, 'MMMM yyyy')}
                        icon={<ShowChart />}
                        gradient
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="Peak Hour Revenue"
                        value={`${peakPct}%`}
                        sub={`of ${fmtPKR(totalRevenue)} total`}
                        icon={<TrendingUp />}
                        gradient
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="Avg per Booking"
                        value={fmtPKR(avgPerBooking)}
                        sub={`across ${allBookings.length} bookings`}
                        icon={<Payments />}
                        gradient
                    />
                </Grid>
            </Grid>

            {/* ── Charts Row 1 ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Daily earnings this month */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Daily Earnings — {format(today, 'MMMM yyyy')}
                            </Typography>
                            {loading ? (
                                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress sx={{ color: '#004d43' }} />
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={daysInMonth}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} style={{ fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} style={{ fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(v) => [fmtPKR(v), 'Revenue']}
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="revenue" fill="#004d43" radius={[4, 4, 0, 0]} barSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Peak vs Off-Peak pie */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={1}>
                                Peak vs Off-Peak Revenue
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                Peak = Evenings (5–11 PM) &amp; Weekends
                            </Typography>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={peakPieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={85}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {peakPieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [fmtPKR(v)]} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend */}
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
                                {peakPieData.map(d => (
                                    <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                                        <Typography variant="caption" color="text.secondary">{d.name}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Charts Row 2 ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Revenue trend (6-month) from revenueReport */}
                <Grid item xs={12} lg={7}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Revenue Trend (Last 6 Months)
                            </Typography>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={monthlyData.length ? monthlyData : daysInMonth.slice(0, 6).map((d, i) => ({ month: `Day ${d.day}`, revenue: d.revenue }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" style={{ fontSize: 11 }} />
                                    <YAxis style={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => [fmtPKR(v), 'Revenue']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#004d43" fill="#004d43" fillOpacity={0.25} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Revenue by venue */}
                <Grid item xs={12} lg={5}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Top Venues by Revenue
                            </Typography>
                            {venueRevenueList.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={venueRevenueList} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={120} style={{ fontSize: 11 }} />
                                        <Tooltip formatter={(v) => [fmtPKR(v), 'Revenue']} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Bar dataKey="revenue" fill="#e8ee26" radius={[0, 4, 4, 0]} barSize={18} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">No venue data yet</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Pricing Tiers Info Cards ── */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>Pricing Tier Performance</Typography>
                    <Grid container spacing={2}>
                        {[
                            { label: 'Peak Bookings', value: peakBookings.length, sub: `${fmtPKR(peakRevenue)} earned`, color: '#004d43', bgColor: '#e8f5e9' },
                            { label: 'Off-Peak Bookings', value: offPeakBookings.length, sub: `${fmtPKR(offPeakRevenue)} earned`, color: '#827717', bgColor: '#f9fbe7' },
                            { label: 'Paid Bookings', value: allBookings.filter(b => b.paymentStatus === 'paid').length, sub: 'payment confirmed', color: '#1565c0', bgColor: '#e3f2fd' },
                            { label: 'Pending Payment', value: allBookings.filter(b => b.paymentStatus !== 'paid').length, sub: 'awaiting payment', color: '#e65100', bgColor: '#fff3e0' },
                        ].map(item => (
                            <Grid item xs={6} sm={3} key={item.label}>
                                <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: item.bgColor, border: `1px solid ${item.color}20` }}>
                                    <Typography variant="h5" fontWeight={700} sx={{ color: item.color }}>{item.value}</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ color: item.color }}>{item.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">{item.sub}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* ── Transaction Table ── */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Table header / filters */}
                    <Box sx={{
                        p: 3, borderBottom: '1px solid', borderColor: 'divider',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 2,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Payments sx={{ color: '#004d43' }} />
                            <Typography variant="h6" fontWeight={700}>Transactions</Typography>
                            <Chip
                                label={`${tableRows.length} records`}
                                size="small"
                                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <TextField
                                size="small"
                                placeholder="Search…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                                sx={{ minWidth: 180 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>Payment</InputLabel>
                                <Select
                                    value={paymentFilter}
                                    label="Payment"
                                    onChange={e => setPaymentFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="unpaid">Unpaid</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                size="small" type="date" label="From"
                                value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }} sx={{ width: 145 }}
                            />
                            <TextField
                                size="small" type="date" label="To"
                                value={dateTo} onChange={e => setDateTo(e.target.value)}
                                InputLabelProps={{ shrink: true }} sx={{ width: 145 }}
                            />
                            {(dateFrom || dateTo) && (
                                <Button size="small" variant="outlined" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                                    Clear
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {loading ? (
                        <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress sx={{ color: '#004d43' }} />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#004d43' }}>
                                        {['Date & Time', 'Customer', 'Venue', 'Slot', 'Duration', 'Amount', 'Payment', 'Status'].map(h => (
                                            <TableCell key={h} sx={{ color: '#fff', fontWeight: 600, borderBottom: 'none', whiteSpace: 'nowrap' }}>
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableRows.length > 0 ? (
                                        tableRows.slice(0, 100).map((b, i) => {
                                            const ps = b.paymentStatus || 'pending';
                                            const pc = paymentStatusColor[ps] || paymentStatusColor.pending;
                                            return (
                                                <TableRow key={b.id || i} hover sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,77,67,0.02)' } }}>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                        {(() => {
                                                            try { return format(new Date(b.dateTime || b.date), 'MMM dd, yyyy'); }
                                                            catch { return 'N/A'; }
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600} noWrap>{b.customerName || 'N/A'}</Typography>
                                                    </TableCell>
                                                    <TableCell>{b.turfName || 'N/A'}</TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap', color: '#004d43', fontWeight: 500 }}>
                                                        {formatTimeSlot(b.timeSlot)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${b.duration || 1}h`}
                                                            size="small"
                                                            sx={{ bgcolor: 'rgba(0,77,67,0.1)', color: '#004d43', fontWeight: 700 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#004d43', whiteSpace: 'nowrap' }}>
                                                        {fmtPKR(b.totalAmount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={(ps.charAt(0).toUpperCase() + ps.slice(1))}
                                                            size="small"
                                                            sx={{ bgcolor: pc.bg, color: pc.text, fontWeight: 700, fontSize: '0.68rem' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={(b.status || 'N/A').toUpperCase()}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: (b.status === 'confirmed' || b.status === 'completed') ? '#e8f5e9' : '#ffebee',
                                                                color: (b.status === 'confirmed' || b.status === 'completed') ? '#2e7d32' : '#c62828',
                                                                fontWeight: 700, fontSize: '0.68rem',
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 5, color: '#999' }}>
                                                No transactions found matching your filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {tableRows.length > 100 && (
                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Showing first 100 of {tableRows.length} records. Use filters to narrow results or export PDF for full data.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
