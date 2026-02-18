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
    CircularProgress
} from '@mui/material';
import {
    Event,
    Today,
    LocationOn,
    Pending,
    Refresh,
} from '@mui/icons-material'; // VideoLabel, Payments, People removed
import { fetchDashboardStats } from '../../store/slices/adminSlice';

const StatCard = ({ title, value, icon, color }) => (
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
                </Box>
                <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

export default function VendorDashboard() {
    const dispatch = useDispatch();
    const { dashboardStats, loading } = useSelector(state => state.admin);
    const { admin } = useSelector(state => state.auth);

    useEffect(() => {
        if (admin?.uid) {
            // Pass vendorId (which is admin.uid) or admin.vendorId if set
            const vendorId = admin.vendorId || admin.uid;
            dispatch(fetchDashboardStats({ vendorId }));
        }
    }, [dispatch, admin]);

    const handleRefresh = () => {
        const vendorId = admin.vendorId || admin.uid;
        dispatch(fetchDashboardStats({ vendorId }));
    };

    if (loading && !dashboardStats) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Vendor Dashboard
                </Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                    <Refresh />
                </IconButton>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Bookings"
                        value={dashboardStats?.totalBookings || 0}
                        icon={<Event />}
                        color="#4CAF50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Today's Bookings"
                        value={dashboardStats?.todayBookings || 0}
                        icon={<Today />}
                        color="#2196F3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Venues"
                        value={dashboardStats?.activeVenues || 0}
                        icon={<LocationOn />}
                        color="#9C27B0"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Bookings"
                        value={dashboardStats?.pendingBookings || 0}
                        icon={<Pending />}
                        color="#F44336"
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Welcome to your Vendor Portal</Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Manage your venues and bookings from the sidebar menu.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
}
