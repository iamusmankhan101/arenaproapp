import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Card, CardContent, Grid, Button, Avatar, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, Snackbar, Divider, LinearProgress, Tabs, Tab
} from '@mui/material';
import {
    Campaign, TrendingUp, Star, Add, LocalOffer, Visibility,
    AdsClick, CheckCircle, Message
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import workingAdminAPI from '../../services/workingFirebaseAPI';

export default function VendorMarketingPage() {
    const { admin } = useSelector(state => state.auth);
    const vendorId = admin?.vendorId || admin?.uid;
    const isPro = admin?.proActive === true;

    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 0: Overview, 1: Push Campaigns
    const [stats, setStats] = useState(null);
    const [promos, setPromos] = useState([]);
    const [venues, setVenues] = useState([]);

    // Push Campaign State
    const [pushCampaigns, setPushCampaigns] = useState([]);
    const [pushQuota, setPushQuota] = useState({ limit: 5, used: 0, remaining: 5 });
    const [openPushDialog, setOpenPushDialog] = useState(false);
    const [pushForm, setPushForm] = useState({
        title: '',
        body: '',
        venueId: '',
        date: '', // Target Date
        time: ''  // Target Time
    });

    // Dialog State
    const [openPromoDialog, setOpenPromoDialog] = useState(false);
    const [promoForm, setPromoForm] = useState({
        title: '',
        discount: '',
        venueId: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (!vendorId) return;
        fetchData();
    }, [vendorId, fetchData]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Fetch Marketing Stats (Mock)
            const marketingStats = await workingAdminAPI.getMarketingStats(vendorId);
            setStats(marketingStats);

            // 2. Fetch Venues (for Promo creation)
            const vRes = await workingAdminAPI.getVenues({ vendorId });
            setVenues(vRes.data || []);

            // 3. Fetch Active Promos (Real)
            // Note: Since promos are subcollections, we need to query them. 
            // For now, let's just query one venue's promos or use a collectionGroup query in a real app.
            // Simplified: Fetching promos from first venue for demo
            if (vRes.data?.length > 0) {
                const promosRef = collection(db, 'venues', vRes.data[0].id, 'promos');
                const pSnap = await getDocs(promosRef);
                const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data(), venueName: vRes.data[0].name }));
                setPromos(pData);
            }

            // 4. Fetch Push Data
            const quota = await workingAdminAPI.getPushQuota(vendorId);
            setPushQuota(quota);

            const pushRef = collection(db, 'push_campaigns');
            const q = query(pushRef, where('vendorId', '==', vendorId));
            const pushSnap = await getDocs(q);
            const pushData = pushSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPushCampaigns(pushData);

        } catch (err) {
            console.error('Error fetching marketing data:', err);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    const handleCreatePush = async () => {
        if (pushQuota.remaining <= 0) {
            setSnackbar({ open: true, message: 'Quota exceeded! Buy more credits.', severity: 'error' });
            return;
        }
        if (!pushForm.title || !pushForm.body || !pushForm.venueId) return;

        setSaving(true);
        try {
            await workingAdminAPI.createPushCampaign({
                ...pushForm,
                vendorId,
                audience: '10km Radius'
            });

            setSnackbar({ open: true, message: 'Push Campaign Scheduled! 📲', severity: 'success' });
            setOpenPushDialog(false);
            setPushForm({ title: '', body: '', venueId: '', date: '', time: '' });
            fetchData(); // Refresh
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to create campaign', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCreatePromo = async () => {
        if (!promoForm.title || !promoForm.discount || !promoForm.venueId) return;

        setSaving(true);
        try {
            await workingAdminAPI.createPromo(promoForm.venueId, {
                ...promoForm,
                vendorId,
                active: true
            });

            setSnackbar({ open: true, message: 'Promo Created Successfully! 🚀', severity: 'success' });
            setOpenPromoDialog(false);
            setPromoForm({ title: '', discount: '', venueId: '', startDate: '', endDate: '', description: '' });
            fetchData(); // Refresh
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to create promo', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress sx={{ color: '#004d43' }} /></Box>;

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)' }}>
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'white', width: 48, height: 48 }}>
                            <Campaign sx={{ color: '#e65100', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="white">Marketing & Promos</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Boost visibility and run in-app campaigns
                            </Typography>
                        </Box>
                    </Box>
                    {isPro ? (
                        <Chip icon={<Star sx={{ color: '#FFD700 !important' }} />} label="PRO ENABLED" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                    ) : (
                        <Button variant="contained" sx={{ bgcolor: 'white', color: '#e65100', fontWeight: 700 }}>Upgrade to Pro</Button>
                    )}
                </CardContent>
            </Card>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} textColor="inherit" indicatorColor="primary"
                    sx={{ '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '1rem' } }}>
                    <Tab label="Overview" />
                    <Tab label="Push Campaigns" />
                </Tabs>
            </Box>

            {/* TAB 0: Overview (Existing Dashboard) */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    {/* 1. Priority Placement Status */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, bgcolor: '#00c853' }} />
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <TrendingUp sx={{ color: '#00c853', fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight={700}>Priority Placement</Typography>
                                </Box>

                                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #c8e6c9', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle sx={{ color: '#00c853', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={700} color="#2e7d32">Active Search Boost</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Your venues appear in top 3 results for "Futsal" in Lahore.
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Boosted Views</Typography>
                                    <Typography variant="body2" fontWeight={700} color="#00c853">+{stats?.boostedViews || 0} views</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={75} color="success" sx={{ height: 6, borderRadius: 3 }} />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 2. Marketing Insights */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ height: '100%', borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" fontWeight={700}>Performance Insights</Typography>
                                    <Chip label="Last 30 Days" size="small" />
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                                            <Visibility sx={{ color: '#1565c0', fontSize: 24, mb: 1 }} />
                                            <Typography variant="h5" fontWeight={800}>{stats?.organicViews + stats?.boostedViews}</Typography>
                                            <Typography variant="caption" color="text.secondary">Total Profile Views</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
                                            <AdsClick sx={{ color: '#ef6c00', fontSize: 24, mb: 1 }} />
                                            <Typography variant="h5" fontWeight={800} color="#ef6c00">{stats?.dealClicks}</Typography>
                                            <Typography variant="caption" color="text.secondary">Promo Clicks</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ p: 2, bgcolor: '#e0f2f1', borderRadius: 2, textAlign: 'center' }}>
                                            <LocalOffer sx={{ color: '#00695c', fontSize: 24, mb: 1 }} />
                                            <Typography variant="h5" fontWeight={800} color="#00695c">{stats?.ctr}</Typography>
                                            <Typography variant="caption" color="text.secondary">Click-Through Rate</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 3. Active Promos */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight={700}>Active Campaigns</Typography>
                                    <Button startIcon={<Add />} variant="contained" onClick={() => setOpenPromoDialog(true)}
                                        sx={{ bgcolor: '#e65100', '&:hover': { bgcolor: '#bf360c' } }}>
                                        New Promo
                                    </Button>
                                </Box>

                                <Grid container spacing={2}>
                                    {promos.map(promo => (
                                        <Grid item xs={12} md={6} lg={4} key={promo.id}>
                                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Box>
                                                            <Chip label={`${promo.discount}% OFF`} size="small" sx={{ bgcolor: '#ffe0b2', color: '#e65100', fontWeight: 700, mb: 1 }} />
                                                            <Typography variant="subtitle1" fontWeight={700}>{promo.title}</Typography>
                                                            <Typography variant="body2" color="text.secondary">{promo.venueName}</Typography>
                                                        </Box>
                                                        <Avatar sx={{ bgcolor: '#e65100' }}><LocalOffer /></Avatar>
                                                    </Box>
                                                    <Divider sx={{ my: 1.5 }} />
                                                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                        Runs until: {promo.endDate}
                                                    </Typography>
                                                    <LinearProgress variant="determinate" value={60} sx={{ height: 4, borderRadius: 2, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: '#e65100' } }} />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                    {promos.length === 0 && (
                                        <Grid item xs={12}>
                                            <Alert severity="info">No active promos. Create a "Weekend Special" to boost bookings!</Alert>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* TAB 1: Push Campaigns (NEW) */}
            {tabValue === 1 && (
                <Grid container spacing={3}>
                    {/* Quota Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', borderRadius: 3, bgcolor: '#263238', color: 'white' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 56, height: 56 }}>
                                        <Message sx={{ color: '#4fc3f7', fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>Campaign Quota</Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Monthly Limit</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                                    {pushQuota.remaining} <Typography component="span" variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>/ {pushQuota.limit}</Typography>
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                                    Campaigns remaining this month
                                </Typography>
                                <Button variant="contained" fullWidth onClick={() => setOpenPushDialog(true)} disabled={pushQuota.remaining <= 0}
                                    sx={{ bgcolor: '#4fc3f7', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#29b6f6' } }}>
                                    Create New Campaign
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Campaign List */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Campaign History</Typography>
                                <Grid container spacing={2}>
                                    {pushCampaigns.map(push => (
                                        <Grid item xs={12} key={push.id}>
                                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={700}>{push.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{push.body}</Typography>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Chip size="small" label={push.status} color={push.status === 'sent' ? 'success' : 'warning'} />
                                                            <Chip size="small" icon={<Visibility sx={{ fontSize: '14px !important' }} />} label={`${push.reach || 0} reached`} variant="outlined" />
                                                        </Box>
                                                    </Box>
                                                    <Avatar sx={{ bgcolor: 'rgba(3, 169, 244, 0.1)', color: '#03a9f4' }}><Message /></Avatar>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                    {pushCampaigns.length === 0 && (
                                        <Grid item xs={12}>
                                            <Alert severity="info">No push campaigns yet. Start engaging your audience!</Alert>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Create Push Dialog */}
            <Dialog open={openPushDialog} onClose={() => setOpenPushDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>New Push Campaign 📲</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb', mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} color="#1565c0">🎯 Audience: 10km Radius</Typography>
                                <Typography variant="body2" color="text.secondary">Automatically targeting users near your venue.</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Campaign Title" fullWidth placeholder="e.g. Friday Night Futsal Deal! ⚽" inputProps={{ maxLength: 50 }}
                                value={pushForm.title} onChange={e => setPushForm({ ...pushForm, title: e.target.value })}
                                helperText={`${pushForm.title.length}/50 characters`} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Message Body" fullWidth multiline rows={3} placeholder="e.g. Pitch A is 20% off tonight at 8 PM. Tap to claim!" inputProps={{ maxLength: 150 }}
                                value={pushForm.body} onChange={e => setPushForm({ ...pushForm, body: e.target.value })}
                                helperText={`${pushForm.body.length}/150 characters`} />
                        </Grid>
                        <Divider sx={{ width: '100%', my: 1 }}>Deep Link (Optional)</Divider>
                        <Grid item xs={12}>
                            <TextField select label="Select Venue" fullWidth SelectProps={{ native: true }}
                                value={pushForm.venueId} onChange={e => setPushForm({ ...pushForm, venueId: e.target.value })}>
                                <option value="">Select Venue</option>
                                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPushDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreatePush} disabled={saving}
                        sx={{ bgcolor: '#03a9f4', color: 'white', fontWeight: 700, '&:hover': { bgcolor: '#0288d1' } }}>
                        Send Campaign ({pushQuota.remaining} left)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Promo Dialog */}
            <Dialog open={openPromoDialog} onClose={() => setOpenPromoDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Promo</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField label="Campaign Title" fullWidth placeholder="e.g. Weekend Special"
                                value={promoForm.title} onChange={e => setPromoForm({ ...promoForm, title: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Discount (%)" fullWidth type="number"
                                value={promoForm.discount} onChange={e => setPromoForm({ ...promoForm, discount: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Select Venue" fullWidth SelectProps={{ native: true }}
                                value={promoForm.venueId} onChange={e => setPromoForm({ ...promoForm, venueId: e.target.value })}>
                                <option value="">Select Venue</option>
                                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Start Date" fullWidth type="date" InputLabelProps={{ shrink: true }}
                                value={promoForm.startDate} onChange={e => setPromoForm({ ...promoForm, startDate: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="End Date" fullWidth type="date" InputLabelProps={{ shrink: true }}
                                value={promoForm.endDate} onChange={e => setPromoForm({ ...promoForm, endDate: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Description" fullWidth multiline rows={2} placeholder="Terms & conditions..."
                                value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPromoDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreatePromo} disabled={saving}
                        sx={{ bgcolor: '#e65100', '&:hover': { bgcolor: '#bf360c' } }}>
                        Launch Promo
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
