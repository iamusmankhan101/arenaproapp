import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Card, CardContent, Grid, Avatar, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, CircularProgress, Alert, Snackbar, Divider,
    LinearProgress, Tabs, Tab,
} from '@mui/material';
import {
    Inventory2, Add, Edit, Delete, Search, Refresh,
    SportsSoccer, SportsBasketball,
    SportsTennis, FitnessCenter, Category,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CATEGORIES = ['Balls', 'Nets', 'Equipment', 'Gear', 'Accessories', 'Maintenance', 'Other'];

const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
        case 'balls': return <SportsSoccer sx={{ fontSize: 18 }} />;
        case 'nets': return <SportsBasketball sx={{ fontSize: 18 }} />;
        case 'equipment': return <SportsTennis sx={{ fontSize: 18 }} />;
        case 'gear': return <FitnessCenter sx={{ fontSize: 18 }} />;
        default: return <Category sx={{ fontSize: 18 }} />;
    }
};

const getStockStatus = (qty) => {
    if (qty <= 0) return { label: 'Out of Stock', color: '#c62828', bg: '#ffebee' };
    if (qty <= 5) return { label: 'Low Stock', color: '#e65100', bg: '#fff3e0' };
    return { label: 'In Stock', color: '#2e7d32', bg: '#e8f5e9' };
};

export default function VendorInventoryPage() {
    const { admin } = useSelector(state => state.auth);
    const vendorId = admin?.vendorId || admin?.uid;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [dialog, setDialog] = useState({ open: false, mode: 'add', item: null });
    const [form, setForm] = useState({ name: '', category: 'Equipment', quantity: '', minStock: '5', price: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchInventory = useCallback(async () => {
        if (!vendorId) return;
        setLoading(true);
        try {
            const ref = collection(db, 'inventory');
            const q = query(ref, where('vendorId', '==', vendorId));
            const snapshot = await getDocs(q);
            const data = [];
            snapshot.forEach(docSnap => {
                data.push({ id: docSnap.id, ...docSnap.data() });
            });
            setItems(data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const handleOpenAdd = () => {
        setForm({ name: '', category: 'Equipment', quantity: '', minStock: '5', price: '', notes: '' });
        setDialog({ open: true, mode: 'add', item: null });
    };

    const handleOpenEdit = (item) => {
        setForm({
            name: item.name || '',
            category: item.category || 'Equipment',
            quantity: String(item.quantity || 0),
            minStock: String(item.minStock || 5),
            price: String(item.price || ''),
            notes: item.notes || '',
        });
        setDialog({ open: true, mode: 'edit', item });
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.quantity) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                category: form.category,
                quantity: parseInt(form.quantity) || 0,
                minStock: parseInt(form.minStock) || 5,
                price: parseFloat(form.price) || 0,
                notes: form.notes.trim(),
                vendorId,
                updatedAt: new Date().toISOString(),
            };

            if (dialog.mode === 'add') {
                payload.createdAt = new Date().toISOString();
                await addDoc(collection(db, 'inventory'), payload);
                setSnackbar({ open: true, message: 'Item added!', severity: 'success' });
            } else {
                await updateDoc(doc(db, 'inventory', dialog.item.id), payload);
                setSnackbar({ open: true, message: 'Item updated!', severity: 'success' });
            }
            setDialog({ open: false, mode: 'add', item: null });
            fetchInventory();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await deleteDoc(doc(db, 'inventory', item.id));
            setSnackbar({ open: true, message: 'Item deleted', severity: 'success' });
            fetchInventory();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    const filtered = items.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 0) return matchesSearch;
        if (activeTab === 1) return matchesSearch && item.quantity <= (item.minStock || 5);
        if (activeTab === 2) return matchesSearch && item.quantity <= 0;
        return matchesSearch;
    });

    const totalItems = items.length;
    const lowStockItems = items.filter(i => i.quantity > 0 && i.quantity <= (i.minStock || 5)).length;
    const outOfStockItems = items.filter(i => i.quantity <= 0).length;
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * (i.price || 0)), 0);

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)' }}>
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#e8ee26', width: 48, height: 48 }}>
                            <Inventory2 sx={{ color: '#004d43', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="white">Inventory Tracking</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                Track equipment, supplies & stock levels
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}
                            sx={{ bgcolor: '#e8ee26', color: '#004d43', fontWeight: 700, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#d4d915' } }}>
                            Add Item
                        </Button>
                        <IconButton onClick={fetchInventory} sx={{ color: 'white' }}><Refresh /></IconButton>
                    </Box>
                </CardContent>
            </Card>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)', color: 'white' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} fontWeight={600}>TOTAL ITEMS</Typography>
                            <Typography variant="h5" fontWeight={800} color="white">{totalItems}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)', color: 'white' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} fontWeight={600}>LOW STOCK</Typography>
                            <Typography variant="h5" fontWeight={800} color="white">{lowStockItems}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)', color: 'white' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} fontWeight={600}>OUT OF STOCK</Typography>
                            <Typography variant="h5" fontWeight={800} color="white">{outOfStockItems}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)', color: 'white' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} fontWeight={600}>TOTAL VALUE</Typography>
                            <Typography variant="h5" fontWeight={800} color="white">PKR {totalValue.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search & Filter */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 36, fontSize: '0.85rem' },
                            minHeight: 36,
                        }}>
                            <Tab label={`All (${totalItems})`} />
                            <Tab label={`Low Stock (${lowStockItems})`} sx={{ color: '#e65100' }} />
                            <Tab label={`Out (${outOfStockItems})`} sx={{ color: '#c62828' }} />
                        </Tabs>
                    </Box>
                    <Divider />

                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#004d43' }} /></Box>
                    ) : filtered.length === 0 ? (
                        <Alert severity="info" sx={{ m: 2 }}>
                            {items.length === 0 ? 'No inventory items yet. Click "Add Item" to start tracking.' : 'No items match your search.'}
                        </Alert>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Stock Level</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((item) => {
                                        const status = getStockStatus(item.quantity);
                                        const stockPct = item.minStock > 0 ? Math.min((item.quantity / (item.minStock * 3)) * 100, 100) : 100;
                                        return (
                                            <TableRow key={item.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ bgcolor: '#004d4315', width: 36, height: 36 }}>
                                                            {getCategoryIcon(item.category)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                                                            {item.notes && <Typography variant="caption" color="text.secondary">{item.notes}</Typography>}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={item.category || 'Other'} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={700}>{item.quantity}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 160 }}>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Chip label={status.label} size="small"
                                                                sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                                                            <Typography variant="caption" color="text.secondary">Min: {item.minStock || 5}</Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={stockPct}
                                                            sx={{
                                                                height: 6, borderRadius: 3,
                                                                bgcolor: '#f0f0f0',
                                                                '& .MuiLinearProgress-bar': {
                                                                    borderRadius: 3,
                                                                    bgcolor: item.quantity <= 0 ? '#c62828' : item.quantity <= (item.minStock || 5) ? '#e65100' : '#2e7d32',
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>PKR {(item.price || 0).toLocaleString()}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: '#004d43' }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(item)} sx={{ color: '#c62828' }}>
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

            {/* Add/Edit Dialog */}
            <Dialog open={dialog.open} onClose={() => !saving && setDialog({ ...dialog, open: false })}
                maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: '#004d43' }}>
                    {dialog.mode === 'add' ? 'Add Item' : 'Edit Item'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField label="Item Name" fullWidth required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Category" fullWidth select value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                SelectProps={{ native: true }}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Quantity" fullWidth type="number" required value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Min Stock Alert" fullWidth type="number" value={form.minStock}
                                onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Unit Price (PKR)" fullWidth type="number" value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Notes" fullWidth multiline rows={2} value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialog({ ...dialog, open: false })} disabled={saving} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim() || !form.quantity}
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{ bgcolor: '#004d43', '&:hover': { bgcolor: '#00695c' }, textTransform: 'none', fontWeight: 600 }}>
                        {dialog.mode === 'add' ? 'Add Item' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
