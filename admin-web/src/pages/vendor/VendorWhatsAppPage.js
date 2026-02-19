import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Card, CardContent, Grid, Avatar, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, CircularProgress, Alert, Snackbar, Divider, Switch,
    FormControlLabel, Paper,
} from '@mui/material';
import {
    WhatsApp, Send, Add, Edit, Delete, Refresh, Schedule,
    Campaign, CheckCircle, Message, Settings,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const TEMPLATE_TYPES = [
    { value: 'booking_confirmation', label: 'Booking Confirmation', icon: <CheckCircle sx={{ fontSize: 18 }} /> },
    { value: 'reminder', label: 'Reminder', icon: <Schedule sx={{ fontSize: 18 }} /> },
    { value: 'promotion', label: 'Promotion', icon: <Campaign sx={{ fontSize: 18 }} /> },
    { value: 'follow_up', label: 'Follow Up', icon: <Message sx={{ fontSize: 18 }} /> },
    { value: 'custom', label: 'Custom', icon: <Send sx={{ fontSize: 18 }} /> },
];

const DEFAULT_TEMPLATES = [
    {
        name: 'Booking Confirmed',
        type: 'booking_confirmation',
        message: 'Hi {{customer_name}}! Your booking at {{venue_name}} on {{date}} at {{time}} is confirmed. See you there! 🏟️',
        active: true,
    },
    {
        name: 'Booking Reminder (1hr)',
        type: 'reminder',
        message: 'Reminder: You have a booking at {{venue_name}} in 1 hour ({{time}}). Please arrive on time! ⏰',
        active: true,
    },
    {
        name: 'Weekend Special',
        type: 'promotion',
        message: 'Weekend Special! 🎉 Book any pitch this weekend at {{venue_name}} and get 20% off. Use code WEEKEND20. Book now on Arena Pro!',
        active: false,
    },
    {
        name: 'Thank You & Review',
        type: 'follow_up',
        message: 'Thanks for playing at {{venue_name}}! 🙌 We hope you had a great time. Rate your experience on Arena Pro to help us improve!',
        active: true,
    },
];

export default function VendorWhatsAppPage() {
    const { admin } = useSelector(state => state.auth);
    const vendorId = admin?.vendorId || admin?.uid;

    const [templates, setTemplates] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState({ open: false, mode: 'add', template: null });
    const [form, setForm] = useState({ name: '', type: 'booking_confirmation', message: '', active: true });
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [settings, setSettings] = useState({
        autoConfirmation: true,
        autoReminder: true,
        autoFollowUp: false,
        vendorNotification: true,
    });

    const fetchData = useCallback(async () => {
        if (!vendorId) return;
        setLoading(true);
        try {
            // Fetch templates
            const tRef = collection(db, 'whatsapp_templates');
            const tQuery = query(tRef, where('vendorId', '==', vendorId));
            const tSnap = await getDocs(tQuery);
            const tData = [];
            tSnap.forEach(d => tData.push({ id: d.id, ...d.data() }));

            if (tData.length === 0) {
                // Seed with defaults
                for (const t of DEFAULT_TEMPLATES) {
                    const newDoc = await addDoc(collection(db, 'whatsapp_templates'), {
                        ...t, vendorId, createdAt: new Date().toISOString(),
                    });
                    tData.push({ id: newDoc.id, ...t, vendorId });
                }
            }
            setTemplates(tData);

            // Fetch recent logs
            const lRef = collection(db, 'whatsapp_logs');
            const lQuery = query(lRef, where('vendorId', '==', vendorId));
            const lSnap = await getDocs(lQuery);
            const lData = [];
            lSnap.forEach(d => lData.push({ id: d.id, ...d.data() }));
            setLogs(lData);

            // Fetch settings
            const sRef = collection(db, 'whatsapp_settings');
            const sQuery = query(sRef, where('vendorId', '==', vendorId));
            const sSnap = await getDocs(sQuery);
            if (!sSnap.empty) {
                setSettings(sSnap.docs[0].data());
            }
        } catch (err) {
            console.error('Error fetching WhatsApp data:', err);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenAdd = () => {
        setForm({ name: '', type: 'booking_confirmation', message: '', active: true });
        setDialog({ open: true, mode: 'add', template: null });
    };

    const handleOpenEdit = (template) => {
        setForm({
            name: template.name || '',
            type: template.type || 'custom',
            message: template.message || '',
            active: template.active !== false,
        });
        setDialog({ open: true, mode: 'edit', template });
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.message.trim()) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                type: form.type,
                message: form.message.trim(),
                active: form.active,
                vendorId,
                updatedAt: new Date().toISOString(),
            };
            if (dialog.mode === 'add') {
                payload.createdAt = new Date().toISOString();
                await addDoc(collection(db, 'whatsapp_templates'), payload);
                setSnackbar({ open: true, message: 'Template created!', severity: 'success' });
            } else {
                await updateDoc(doc(db, 'whatsapp_templates', dialog.template.id), payload);
                setSnackbar({ open: true, message: 'Template updated!', severity: 'success' });
            }
            setDialog({ open: false, mode: 'add', template: null });
            fetchData();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (template) => {
        if (!window.confirm(`Delete "${template.name}"?`)) return;
        try {
            await deleteDoc(doc(db, 'whatsapp_templates', template.id));
            setSnackbar({ open: true, message: 'Template deleted', severity: 'success' });
            fetchData();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    const handleToggleTemplate = async (template) => {
        try {
            await updateDoc(doc(db, 'whatsapp_templates', template.id), { active: !template.active });
            fetchData();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    const handleSaveSettings = async () => {
        try {
            const sRef = collection(db, 'whatsapp_settings');
            const sQuery = query(sRef, where('vendorId', '==', vendorId));
            const sSnap = await getDocs(sQuery);
            if (sSnap.empty) {
                await addDoc(sRef, { ...settings, vendorId, updatedAt: new Date().toISOString() });
            } else {
                await updateDoc(sSnap.docs[0].ref, { ...settings, updatedAt: new Date().toISOString() });
            }
            setSnackbar({ open: true, message: 'Settings saved!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    const sentToday = logs.filter(l => {
        const d = l.sentAt ? new Date(l.sentAt) : null;
        return d && d.toDateString() === new Date().toDateString();
    }).length;

    const activeTemplates = templates.filter(t => t.active).length;

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #075e54 0%, #25D366 100%)' }}>
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'white', width: 48, height: 48 }}>
                            <WhatsApp sx={{ color: '#25D366', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="white">WhatsApp Integration</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Automated messaging, templates & notifications
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}
                            sx={{ bgcolor: 'white', color: '#075e54', fontWeight: 700, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#f0f0f0' } }}>
                            New Template
                        </Button>
                        <IconButton onClick={fetchData} sx={{ color: 'white' }}><Refresh /></IconButton>
                    </Box>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#25D366' }} /></Box>
            ) : (
                <>
                    {/* Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={3}>
                            <Card sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>TEMPLATES</Typography>
                                    <Typography variant="h5" fontWeight={800} color="#075e54">{templates.length}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Card sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>ACTIVE</Typography>
                                    <Typography variant="h5" fontWeight={800} color="#25D366">{activeTemplates}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Card sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>SENT TODAY</Typography>
                                    <Typography variant="h5" fontWeight={800} color="#1565c0">{sentToday}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Card sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>TOTAL SENT</Typography>
                                    <Typography variant="h5" fontWeight={800} color="#5e35b1">{logs.length}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Auto Settings */}
                    <Card sx={{ mb: 3, borderRadius: 3 }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Settings sx={{ fontSize: 20, color: '#075e54' }} />
                                <Typography variant="subtitle1" fontWeight={700} color="#075e54">Automation Settings</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <FormControlLabel
                                            control={<Switch checked={settings.autoConfirmation} onChange={(e) => setSettings({ ...settings, autoConfirmation: e.target.checked })} color="success" />}
                                            label={<Box><Typography variant="body2" fontWeight={600}>Auto Confirmation</Typography><Typography variant="caption" color="text.secondary">Send when booking is confirmed</Typography></Box>}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <FormControlLabel
                                            control={<Switch checked={settings.autoReminder} onChange={(e) => setSettings({ ...settings, autoReminder: e.target.checked })} color="success" />}
                                            label={<Box><Typography variant="body2" fontWeight={600}>Auto Reminder</Typography><Typography variant="caption" color="text.secondary">Send 1hr before booking</Typography></Box>}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <FormControlLabel
                                            control={<Switch checked={settings.autoFollowUp} onChange={(e) => setSettings({ ...settings, autoFollowUp: e.target.checked })} color="success" />}
                                            label={<Box><Typography variant="body2" fontWeight={600}>Auto Follow-Up</Typography><Typography variant="caption" color="text.secondary">Send thank you after booking</Typography></Box>}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <FormControlLabel
                                            control={<Switch checked={settings.vendorNotification} onChange={(e) => setSettings({ ...settings, vendorNotification: e.target.checked })} color="success" />}
                                            label={<Box><Typography variant="body2" fontWeight={600}>Vendor Notification</Typography><Typography variant="caption" color="text.secondary">Receive WhatsApp when booked</Typography></Box>}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" size="small" onClick={handleSaveSettings}
                                    sx={{ bgcolor: '#075e54', '&:hover': { bgcolor: '#064e46' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                                    Save Settings
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Templates */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#075e54' }}>
                                    Message Templates ({templates.length})
                                </Typography>
                            </Box>
                            <Divider />
                            {templates.length === 0 ? (
                                <Alert severity="info" sx={{ m: 2 }}>No templates yet. Click "New Template" to create one.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 700 }}>Template</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Message Preview</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {templates.map((t) => {
                                                const typeInfo = TEMPLATE_TYPES.find(tt => tt.value === t.type) || TEMPLATE_TYPES[4];
                                                return (
                                                    <TableRow key={t.id} hover>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ bgcolor: '#25D36615', width: 32, height: 32 }}>
                                                                    {typeInfo.icon}
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={typeInfo.label} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                                                        </TableCell>
                                                        <TableCell sx={{ maxWidth: 300 }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{
                                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                            }}>
                                                                {t.message}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Switch checked={t.active !== false} size="small" color="success"
                                                                onChange={() => handleToggleTemplate(t)} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton size="small" onClick={() => handleOpenEdit(t)} sx={{ color: '#075e54' }}>
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => handleDelete(t)} sx={{ color: '#c62828' }}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialog.open} onClose={() => !saving && setDialog({ ...dialog, open: false })}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: '#075e54' }}>
                    {dialog.mode === 'add' ? 'New Template' : 'Edit Template'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField label="Template Name" fullWidth required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Type" fullWidth select value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                SelectProps={{ native: true }}>
                                {TEMPLATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Message" fullWidth required multiline rows={4} value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                helperText="Variables: {{customer_name}}, {{venue_name}}, {{date}}, {{time}}, {{amount}}" />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} color="success" />}
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialog({ ...dialog, open: false })} disabled={saving} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim() || !form.message.trim()}
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{ bgcolor: '#075e54', '&:hover': { bgcolor: '#064e46' }, textTransform: 'none', fontWeight: 600 }}>
                        {dialog.mode === 'add' ? 'Create Template' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
