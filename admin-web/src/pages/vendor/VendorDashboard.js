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
    CircularProgress,
    Dialog,
    DialogContent,
    Button,
} from '@mui/material';
import {
    Event,
    Payments,
    LocationOn,
    People,
    TrendingUp,
    TrendingDown,
    Refresh,
    Warning,
    CheckCircle,
    Schedule,
    WorkspacePremium,
    Close,
    Assessment,
    WhatsApp,
    Inventory2,
    ArrowForward,
    Campaign,
} from '@mui/icons-material';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats } from '../../store/slices/adminSlice';

const StatCard = ({ title, value, icon, color, growth, variant = 'light' }) => {
    const isDark = variant === 'dark';
    const isGradient = variant === 'gradient';
    const textColor = isDark || isGradient ? 'white' : 'text.primary';
    const subTextColor = isDark || isGradient ? 'rgba(255,255,255,0.7)' : 'text.secondary';

    return (
        <Card
            sx={{
                height: '100%',
                background: isGradient ? 'linear-gradient(135deg, #004d43 0%, #00796b 100%)' : (isDark ? '#071a15' : 'white'),
                color: textColor,
                borderRadius: 4,
                boxShadow: isDark || isGradient ? '0 10px 30px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {(isDark) && (
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
                            color: subTextColor,
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
                            bgcolor: isDark || isGradient ? 'rgba(255,255,255,0.15)' : `${color}15`,
                            color: isDark || isGradient ? '#e8ee26' : color
                        }}
                    >
                        {React.cloneElement(icon, { fontSize: 'small' })}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: -1, color: textColor }}>
                            {value}
                        </Typography>

                        {growth !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {growth >= 0 ? (
                                    <TrendingUp sx={{ color: isDark || isGradient ? '#e8ee26' : 'success.main', fontSize: 16 }} />
                                ) : (
                                    <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
                                )}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: growth >= 0 ? (isDark || isGradient ? '#e8ee26' : 'success.main') : 'error.main',
                                        fontWeight: 600,
                                    }}
                                >
                                    {Math.abs(growth)}% <Box component="span" sx={{ color: subTextColor, fontWeight: 400 }}>than last month</Box>
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Visualization bars */}
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 40, opacity: 0.8 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 6,
                                    height: `${Math.random() * 80 + 20}%`,
                                    bgcolor: isDark || isGradient ? 'rgba(255,255,255,0.3)' : color,
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

export default function VendorDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dashboardStats, loading } = useSelector(state => state.admin);
    const { admin } = useSelector(state => state.auth);
    const [promoOpen, setPromoOpen] = React.useState(false);

    const promoTriggered = React.useRef(false);
    useEffect(() => {
        console.log('🎯 Promo Trigger Effect:', {
            uid: admin?.uid,
            proActive: admin?.proActive,
            sessionShown: sessionStorage.getItem('pro_promo_shown'),
            triggeredRef: promoTriggered.current
        });

        if (admin?.uid) {
            const vendorId = admin.vendorId || admin.uid;
            dispatch(fetchDashboardStats({ vendorId }));

            if (promoTriggered.current) return;

            // Show promo popup if not pro and not shown in this session
            const isPro = admin?.proActive === true;
            const promoShown = sessionStorage.getItem('pro_promo_shown');

            if (!isPro && !promoShown && !promoTriggered.current) {
                const timer = setTimeout(() => {
                    setPromoOpen(true);
                    sessionStorage.setItem('pro_promo_shown', 'true');
                    promoTriggered.current = true;
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [dispatch, admin?.uid, admin?.vendorId, admin?.proActive]);

    const handleRefresh = () => {
        const vendorId = admin.vendorId || admin.uid;
        dispatch(fetchDashboardStats({ vendorId }));
    };

    // Helper to get icon and color for activity
    const getActivityConfig = (type, status) => {
        switch (type) {
            case 'booking':
                if (status === 'completed' || status === 'confirmed') return { icon: <CheckCircle />, color: '#004d43' };
                if (status === 'cancelled') return { icon: <Warning />, color: '#F44336' };
                return { icon: <Schedule />, color: '#FF9800' };
            case 'user':
                return { icon: <People />, color: '#2196F3' };
            case 'venue':
                return { icon: <LocationOn />, color: '#9C27B0' };
            default:
                return { icon: <Event />, color: '#757575' };
        }
    };

    if (loading && !dashboardStats) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                    Dashboard
                </Typography>
                <IconButton onClick={handleRefresh} disabled={loading} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                    <Refresh />
                </IconButton>
            </Box>

            {/* Top Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Gradient Cards */}
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Total Bookings"
                        value={dashboardStats?.totalBookings?.toLocaleString() || 0}
                        icon={<Event />}
                        color="#e8ee26"
                        growth={dashboardStats?.monthlyGrowth || 0}
                        variant="gradient"
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Total Revenue"
                        value={`PKR ${(dashboardStats?.totalRevenue || 0).toLocaleString()}`}
                        icon={<Payments />}
                        color="#e8ee26"
                        growth={dashboardStats?.revenueGrowth || 0}
                        variant="gradient"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="Active Venues"
                        value={dashboardStats?.activeVenues || 0}
                        icon={<LocationOn />}
                        color="#e8ee26"
                        growth={5.1}
                        variant="gradient"
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
                                <Box sx={{ bgcolor: '#e8ee26', borderRadius: 2, px: 1.5, py: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#004d43' }}>Last 7 Days</Typography>
                                </Box>
                            </Box>

                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dashboardStats?.weeklyStats || []} barSize={20}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e' }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="bookings" fill="#004d43" radius={[4, 4, 0, 0]} name="Bookings" />
                                    <Bar dataKey="revenue" fill="#004d43" radius={[4, 4, 0, 0]} name="Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#004d43' }}>
                                {dashboardStats?.totalCustomers?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: '#2e7d32', mb: 4, fontWeight: 600 }}>
                                MY CUSTOMERS
                            </Typography>

                            <Box sx={{ mt: 'auto' }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(0,77,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <People sx={{ color: '#004d43' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Active Players</Typography>
                                        <Typography variant="caption" color="text.secondary">Booked recently</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(0,77,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LocationOn sx={{ color: '#004d43' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Top Venue</Typography>
                                        <Typography variant="caption" color="text.secondary">Most booked</Typography>
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
                        <Box sx={{ bgcolor: '#004d43', color: '#e8ee26', borderRadius: 4, px: 2, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                            All activities
                        </Box>
                    </Box>
                    <Box>
                        {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                            dashboardStats.recentActivity.map((activity, index) => {
                                const config = getActivityConfig(activity.type, activity.status);
                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 3,
                                            borderBottom: index < dashboardStats.recentActivity.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            '&:hover': { bgcolor: '#f9fafb' }
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: `${config.color}15`, color: config.color, width: 48, height: 48, mr: 2, borderRadius: 3 }}>
                                            {React.cloneElement(config.icon, { fontSize: 'small' })}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{activity.text}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {activity.subText} • {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 4,
                                                bgcolor: 'rgba(0,0,0,0.05)',
                                                color: 'text.secondary',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {activity.status}
                                        </Box>
                                    </Box>
                                );
                            })
                        ) : (
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                No recent activity found.
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
            {/* Pro Features Promo Popup */}
            <Dialog
                open={promoOpen}
                onClose={() => setPromoOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                <IconButton
                    onClick={() => setPromoOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        zIndex: 1,
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <Close />
                </IconButton>

                <Box sx={{
                    background: 'linear-gradient(135deg, #00332d 0%, #004d43 100%)',
                    px: 4,
                    pt: 3,
                    pb: '20px',
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 150,
                        height: 150,
                        bgcolor: 'rgba(232, 238, 38, 0.15)',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                    }} />

                    <Box
                        component="img"
                        src="/logo.png"
                        sx={{
                            height: 70,
                            mb: 2,
                            filter: 'brightness(0) invert(1)' // Make logo white if it's dark
                        }}
                    />


                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: -1, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)', fontSize: '1.75rem' }}>
                        Scale Your Venue with <br />
                        <Box component="span" sx={{ color: '#e8ee26' }}>Arena Pro</Box>
                    </Typography>

                </Box>

                <DialogContent sx={{ p: 4, bgcolor: '#fff' }}>
                    <Grid container spacing={2.5}>
                        {[
                            {
                                title: 'Daily Reporting',
                                desc: 'One-click financial ledgers and shift reports.',
                                icon: <Assessment sx={{ color: '#004d43' }} />
                            },
                            {
                                title: 'WhatsApp API',
                                desc: 'Automated confirmations and instant delay alerts.',
                                icon: <WhatsApp sx={{ color: '#004d43' }} />
                            },
                            {
                                title: 'Live Inventory',
                                desc: 'Track premium rackets and equipment in real-time.',
                                icon: <Inventory2 sx={{ color: '#004d43' }} />
                            },
                            {
                                title: 'Marketing Pro',
                                desc: 'Get 3x more visibility with priority search placement.',
                                icon: <Campaign sx={{ color: '#004d43' }} />
                            }
                        ].map((item, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: '#f8faf9',
                                    border: '1px solid #edf2f0',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#f0f5f3', borderColor: '#d1e0da' }
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(0,77,67,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#004d43', mb: 0.5 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                                            {item.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: 5, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            endIcon={<ArrowForward />}
                            onClick={() => {
                                setPromoOpen(false);
                                navigate('/vendor/pro-features');
                            }}
                            sx={{
                                bgcolor: '#004d43',
                                color: 'white',
                                py: 2,
                                borderRadius: 3,
                                fontWeight: 800,
                                fontSize: '1.05rem',
                                textTransform: 'none',
                                boxShadow: '0 8px 20px rgba(0,77,67,0.25)',
                                '&:hover': { bgcolor: '#00695c' },
                            }}
                        >
                            Explore Pro Features
                        </Button>
                        <Button
                            onClick={() => setPromoOpen(false)}
                            sx={{ mt: 1.5, color: '#666', textTransform: 'none', fontWeight: 600, '&:hover': { color: '#004d43', bgcolor: 'transparent' } }}
                        >
                            I'll decide later
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
