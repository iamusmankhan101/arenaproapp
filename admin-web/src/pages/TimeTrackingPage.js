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
    useTheme,
    useMediaQuery,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Timer,
    Search,
    Refresh,
    FlashOn,
    AccessTime,
    EventNote,
    LocationOn,
    CalendarToday,
    TrendingUp,
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { fetchBookings } from '../store/slices/adminSlice';
import { format, parse, isToday, isFuture, differenceInMinutes, addHours } from 'date-fns';

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatTimeSlot = (ts) => {
    if (!ts || ts === 'N/A') return ts || 'N/A';
    if (ts.toUpperCase().includes('AM') || ts.toUpperCase().includes('PM')) return ts;
    try {
        if (ts.includes(' - ')) {
            const [s, e] = ts.split(' - ');
            const fmt = (t) => format(parse(t.trim(), 'HH:mm', new Date()), 'hh:mm a');
            return `${fmt(s)} - ${fmt(e)}`;
        }
        return format(parse(ts.trim(), 'HH:mm', new Date()), 'hh:mm a');
    } catch {
        return ts;
    }
};

const statusColor = {
    confirmed: '#2e7d32',
    pending: '#ed6c02',
    cancelled: '#d32f2f',
    completed: '#004d43',
};

// Safely detect if a booking session is "live" (happening right now)
const isLiveSession = (booking) => {
    try {
        const bookingDate = new Date(booking.dateTime || booking.date);
        if (!isToday(bookingDate)) return false;
        const now = new Date();
        const duration = Number(booking.duration) || 1;
        const endTime = addHours(bookingDate, duration);
        return bookingDate <= now && now <= endTime;
    } catch {
        return false;
    }
};

const isUpcomingToday = (booking) => {
    try {
        const bookingDate = new Date(booking.dateTime || booking.date);
        return isToday(bookingDate) && isFuture(bookingDate);
    } catch {
        return false;
    }
};

// ─── sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, sub, color = '#004d43', gradient = false }) => (
    <Card sx={{
        height: '100%',
        borderRadius: 3,
        background: gradient
            ? 'linear-gradient(135deg, #004d43 0%, #00796b 100%)'
            : 'white',
        boxShadow: gradient
            ? '0 8px 24px rgba(0,77,67,0.25)'
            : '0 2px 12px rgba(0,0,0,0.06)',
    }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: gradient ? 'rgba(255,255,255,0.75)' : 'text.secondary',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: gradient ? 'rgba(255,255,255,0.15)' : `${color}15`,
                    color: gradient ? '#e8ee26' : color,
                }}>
                    {React.cloneElement(icon, { fontSize: 'small' })}
                </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: gradient ? '#fff' : '#004d43', mb: 0.5 }}>
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

export default function TimeTrackingPage() {
    const dispatch = useDispatch();
    const { admin } = useSelector(state => state.auth);
    const { bookings, bookingsLoading, bookingsError } = useSelector(state => state.admin);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [now, setNow] = useState(new Date());

    // live clock tick
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const loadBookings = useCallback(() => {
        const vendorId = admin?.role === 'vendor' ? (admin.vendorId || admin.uid) : null;
        dispatch(fetchBookings({ page: 0, pageSize: 200, filter: 'all', search: '', vendorId }));
    }, [dispatch, admin]);

    useEffect(() => { loadBookings(); }, [loadBookings]);

    const allBookings = bookings?.data || [];

    // ── derived data ─────────────────────────────────────────────────────────

    const todaySessions = allBookings.filter(b => {
        try { return isToday(new Date(b.dateTime || b.date)); } catch { return false; }
    });
    const liveSessions = allBookings.filter(isLiveSession);
    const upcomingSessions = allBookings.filter(isUpcomingToday);

    const totalDuration = allBookings.reduce((sum, b) => sum + (Number(b.duration) || 1), 0);
    const avgDuration = allBookings.length ? (totalDuration / allBookings.length).toFixed(1) : 0;

    // Busiest slots aggregation
    const slotMap = {};
    allBookings.forEach(b => {
        const slot = formatTimeSlot(b.timeSlot);
        if (slot && slot !== 'N/A') slotMap[slot] = (slotMap[slot] || 0) + 1;
    });
    const busiestSlots = Object.entries(slotMap)
        .map(([slot, count]) => ({ slot, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // Weekly hours used
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyHours = weekDays.map(day => ({ day, hours: 0 }));
    allBookings.forEach(b => {
        try {
            const d = new Date(b.dateTime || b.date);
            const idx = d.getDay();
            weeklyHours[idx].hours += Number(b.duration) || 1;
        } catch { /* skip */ }
    });

    // Filtered table rows
    const tableRows = allBookings.filter(b => {
        const query = searchQuery.toLowerCase();
        const matchSearch =
            !query ||
            (b.customerName || '').toLowerCase().includes(query) ||
            (b.turfName || '').toLowerCase().includes(query) ||
            (b.bookingId || '').toLowerCase().includes(query);

        const matchDate = !dateFilter || (() => {
            try {
                return format(new Date(b.dateTime || b.date), 'yyyy-MM-dd') === dateFilter;
            } catch { return true; }
        })();

        return matchSearch && matchDate;
    });

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Box>
            {/* ── Header ── */}
            <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
                <CardContent sx={{
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <Timer sx={{ color: '#fff', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
                                Booking Time Tracking
                            </Typography>
                            {!isSmall && (
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Precise court usage tracking · real-time session monitoring
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Live clock */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            bgcolor: 'rgba(232,238,38,0.15)',
                            border: '1px solid rgba(232,238,38,0.5)',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#e8ee26', animation: 'pulse 1.5s infinite' }} />
                            <Typography sx={{ color: '#e8ee26', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                {format(now, 'hh:mm:ss a')}
                            </Typography>
                        </Box>
                        <Button
                            onClick={loadBookings}
                            disabled={bookingsLoading}
                            size="small"
                            startIcon={!isSmall && <Refresh />}
                            sx={{
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.5)',
                                border: '1px solid',
                                borderRadius: 2,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'white' },
                            }}
                        >
                            {isSmall ? <Refresh /> : 'Refresh'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* ── Stat Cards ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="Total Sessions Today"
                        value={todaySessions.length}
                        icon={<CalendarToday />}
                        sub={`${allBookings.length} total all-time`}
                        gradient
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="Live Sessions"
                        value={liveSessions.length}
                        icon={<FlashOn />}
                        sub={`${upcomingSessions.length} upcoming today`}
                        gradient
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="Avg Duration"
                        value={`${avgDuration}h`}
                        icon={<AccessTime />}
                        sub="per booking (all-time)"
                        gradient
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatCard
                        title="Total Court Hours"
                        value={`${totalDuration}h`}
                        icon={<TrendingUp />}
                        sub="all sessions combined"
                        gradient
                    />
                </Grid>
            </Grid>

            {bookingsError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Error loading sessions: {bookingsError}
                </Alert>
            )}

            {/* ── Live / Upcoming Sessions ── */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 4 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{
                        p: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FlashOn sx={{ color: '#004d43' }} />
                            <Typography variant="h6" fontWeight={700}>Live &amp; Upcoming Sessions</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Today, {format(now, 'MMM d')}
                        </Typography>
                    </Box>

                    {bookingsLoading ? (
                        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress sx={{ color: '#004d43' }} />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', overflowX: 'auto', p: 2, gap: 2 }}>
                            {liveSessions.length === 0 && upcomingSessions.length === 0 ? (
                                <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                                    <Typography color="text.secondary">No live or upcoming sessions for today.</Typography>
                                </Box>
                            ) : (
                                [...liveSessions, ...upcomingSessions].slice(0, 12).map((b, i) => {
                                    const live = isLiveSession(b);
                                    let remainingLabel = '';
                                    if (live) {
                                        try {
                                            const start = new Date(b.dateTime || b.date);
                                            const duration = Number(b.duration) || 1;
                                            const end = addHours(start, duration);
                                            const mins = differenceInMinutes(end, now);
                                            remainingLabel = `${Math.max(0, mins)} min left`;
                                        } catch { /* ok */ }
                                    }
                                    return (
                                        <Card
                                            key={b.id || i}
                                            sx={{
                                                minWidth: 240,
                                                flexShrink: 0,
                                                borderRadius: 3,
                                                bgcolor: live ? '#004d43' : 'white',
                                                color: live ? 'white' : 'text.primary',
                                                border: '1px solid',
                                                borderColor: live ? '#004d43' : 'divider',
                                            }}
                                        >
                                            <CardContent sx={{ p: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                    <Chip
                                                        label={live ? 'LIVE NOW' : 'UPCOMING'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: live ? '#e8ee26' : 'rgba(0,0,0,0.05)',
                                                            color: live ? '#004d43' : 'text.secondary',
                                                            fontWeight: 700,
                                                            fontSize: '0.62rem',
                                                        }}
                                                    />
                                                    {live && remainingLabel && (
                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                                                            {remainingLabel}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Typography variant="subtitle1" fontWeight={700} noWrap>
                                                    {b.turfName || 'Venue'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }} noWrap>
                                                    {b.customerName} · {b.sport || 'General'}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTime sx={{ fontSize: 13, opacity: 0.75 }} />
                                                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                                                        {formatTimeSlot(b.timeSlot)} · {b.duration || 1}h session
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* ── Charts Row ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Busiest Slots */}
                <Grid item xs={12} lg={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Busiest Time Slots
                            </Typography>
                            {busiestSlots.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={busiestSlots} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="slot" type="category" width={110} style={{ fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(v) => [`${v} bookings`]}
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="count" fill="#004d43" radius={[0, 4, 4, 0]} barSize={18} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">No slot data yet</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Weekly Hours */}
                <Grid item xs={12} lg={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Court Hours by Day of Week
                            </Typography>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={weeklyHours}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(v) => [`${v}h`]}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="hours" fill="#e8ee26" radius={[4, 4, 0, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Historical Session Log ── */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{
                        p: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EventNote sx={{ color: '#004d43' }} />
                            <Typography variant="h6" fontWeight={700}>Session Log</Typography>
                            <Chip label={`${tableRows.length} records`} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <TextField
                                size="small"
                                placeholder="Search customer / venue…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
                                    ),
                                }}
                                sx={{ minWidth: { xs: '100%', sm: 220 } }}
                            />
                            <TextField
                                size="small"
                                type="date"
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start"><CalendarToday fontSize="small" /></InputAdornment>
                                    ),
                                }}
                                sx={{ minWidth: 160 }}
                            />
                            {dateFilter && (
                                <Button size="small" onClick={() => setDateFilter('')} variant="outlined" sx={{ whiteSpace: 'nowrap' }}>
                                    Clear Date
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {bookingsLoading ? (
                        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress sx={{ color: '#004d43' }} />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size={isMobile ? 'small' : 'medium'}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#004d43' }}>
                                        {['Booking ID', 'Customer', 'Venue', 'Date', 'Time Slot', 'Duration', 'Status'].map(h => (
                                            <TableCell key={h} sx={{ color: '#fff', fontWeight: 600, borderBottom: 'none', whiteSpace: 'nowrap' }}>
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableRows.length > 0 ? (
                                        tableRows.slice(0, 100).map((b, i) => (
                                            <TableRow
                                                key={b.id || i}
                                                hover
                                                sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,77,67,0.02)' } }}
                                            >
                                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#555' }}>
                                                    #{(b.bookingId || b.id || '').slice(0, 8)}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600} noWrap>{b.customerName || 'N/A'}</Typography>
                                                    {!isSmall && (
                                                        <Typography variant="caption" color="text.secondary" noWrap>{b.customerPhone}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <LocationOn sx={{ fontSize: 14, color: '#004d43' }} />
                                                        <Typography variant="body2" noWrap>{b.turfName || 'N/A'}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                    {(() => {
                                                        try { return format(new Date(b.dateTime || b.date), 'MMM dd, yyyy'); }
                                                        catch { return 'N/A'; }
                                                    })()}
                                                </TableCell>
                                                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500, color: '#004d43' }}>
                                                    {formatTimeSlot(b.timeSlot)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${b.duration || 1}h`}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(0,77,67,0.1)', color: '#004d43', fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={(b.status || 'unknown').toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${statusColor[b.status] || '#757575'}20`,
                                                            color: statusColor[b.status] || '#757575',
                                                            fontWeight: 700,
                                                            fontSize: '0.68rem',
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#999' }}>
                                                No sessions found matching your filters.
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
                                Showing first 100 of {tableRows.length} records. Use search/date filter to narrow results.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* pulse animation */}
            <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.5; transform:scale(1.3); }
        }
      `}</style>
        </Box>
    );
}
