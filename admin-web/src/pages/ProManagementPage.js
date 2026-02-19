import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    Chip,
    Button,
    Avatar,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
} from '@mui/material';
import {
    WorkspacePremium,
    CheckCircle,
    Cancel,
    Refresh,
    Assessment,
    Inventory2,
    WhatsApp,
    Star,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toggleVendorPro, fetchVendors } from '../store/slices/adminSlice';

const PRO_FEATURES_LIST = [
    { title: 'Daily Reporting', icon: <Assessment sx={{ fontSize: 20 }} />, color: '#004d43' },
    { title: 'Live Inventory Tracking', icon: <Inventory2 sx={{ fontSize: 20 }} />, color: '#00796b' },
    { title: 'WhatsApp API Integration', icon: <WhatsApp sx={{ fontSize: 20 }} />, color: '#25D366' },
];

export default function ProManagementPage() {
    const dispatch = useDispatch();
    const [vendors, setVendors] = useState([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, vendor: null, activate: false });
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const loadVendors = async () => {
        setVendorsLoading(true);
        try {
            const result = await dispatch(fetchVendors()).unwrap();
            setVendors(result || []);
        } catch (err) {
            console.error('Failed to fetch vendors:', err);
        } finally {
            setVendorsLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    const handleTogglePro = async () => {
        const { vendor, activate } = confirmDialog;
        setActionLoading(true);
        try {
            await dispatch(toggleVendorPro({ vendorId: vendor.id, activate })).unwrap();
            setSnackbar({
                open: true,
                message: `Pro ${activate ? 'activated' : 'deactivated'} for ${vendor.name || vendor.email}`,
                severity: 'success',
            });
            loadVendors();
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Failed to update', severity: 'error' });
        } finally {
            setActionLoading(false);
            setConfirmDialog({ open: false, vendor: null, activate: false });
        }
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Vendor Name',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#004d43', width: 32, height: 32, fontSize: '0.85rem' }}>
                        {(params.value || 'V')[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value || 'Unnamed'}
                    </Typography>
                </Box>
            ),
        },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        {
            field: 'proActive',
            headerName: 'Pro Status',
            width: 140,
            renderCell: (params) =>
                params.value ? (
                    <Chip
                        icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                        label="Active"
                        size="small"
                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}
                    />
                ) : (
                    <Chip
                        icon={<Cancel sx={{ fontSize: '16px !important' }} />}
                        label="Inactive"
                        size="small"
                        sx={{ bgcolor: '#f5f5f5', color: '#757575', fontWeight: 'bold' }}
                    />
                ),
        },
        {
            field: 'proActivatedAt',
            headerName: 'Activated Since',
            width: 160,
            renderCell: (params) => {
                if (!params.value) return <Typography variant="caption" color="text.secondary">—</Typography>;
                const date = params.value?.toDate ? params.value.toDate() : new Date(params.value);
                return (
                    <Typography variant="caption">
                        {date.toLocaleDateString()}
                    </Typography>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            renderCell: (params) => {
                const isActive = params.row.proActive;
                return (
                    <Button
                        variant={isActive ? 'outlined' : 'contained'}
                        size="small"
                        onClick={() =>
                            setConfirmDialog({ open: true, vendor: params.row, activate: !isActive })
                        }
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            ...(isActive
                                ? { color: '#c62828', borderColor: '#c62828' }
                                : { bgcolor: '#004d43', '&:hover': { bgcolor: '#00695c' } }),
                        }}
                    >
                        {isActive ? 'Deactivate' : 'Activate Pro'}
                    </Button>
                );
            },
        },
    ];

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#FFD700', width: 48, height: 48 }}>
                            <WorkspacePremium sx={{ color: '#004d43', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
                                Pro Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                Activate or deactivate Pro features for vendors • PKR 2,000/month
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={`${vendors.filter((v) => v.proActive).length} Active`}
                        sx={{ bgcolor: 'rgba(255,215,0,0.2)', color: '#FFD700', fontWeight: 'bold' }}
                    />
                </CardContent>
            </Card>

            {/* Pro Features Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {PRO_FEATURES_LIST.map((feat, i) => (
                    <Grid item xs={12} sm={4} key={i}>
                        <Card sx={{ borderRadius: 2, border: `2px solid ${feat.color}20` }}>
                            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, '&:last-child': { pb: 2 } }}>
                                <Avatar sx={{ bgcolor: `${feat.color}15`, width: 36, height: 36 }}>
                                    {React.cloneElement(feat.icon, { sx: { fontSize: 18, color: feat.color } })}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={700} sx={{ color: feat.color }}>
                                        {feat.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Included in Pro
                                    </Typography>
                                </Box>
                                <Star sx={{ fontSize: 16, color: '#FFD700', ml: 'auto' }} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Vendors Table */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004d43' }}>
                            All Vendors ({vendors.length})
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={loadVendors}
                            sx={{ color: '#004d43', borderColor: '#004d43', textTransform: 'none' }}
                        >
                            Refresh
                        </Button>
                    </Box>
                    <DataGrid
                        rows={vendors}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25]}
                        autoHeight
                        loading={vendorsLoading}
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f5f5f5',
                                borderBottom: 'none',
                                fontWeight: 'bold',
                                color: '#004d43',
                            },
                            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
                            '& .MuiDataGrid-row:hover': { backgroundColor: '#f9fafb' },
                            '& .MuiTablePagination-root': { color: '#004d43' },
                        }}
                    />
                </CardContent>
            </Card>

            {/* Confirm Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => !actionLoading && setConfirmDialog({ open: false, vendor: null, activate: false })}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#004d43' }}>
                    {confirmDialog.activate ? 'Activate Pro' : 'Deactivate Pro'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {confirmDialog.activate ? 'activate' : 'deactivate'} Pro for{' '}
                        <strong>{confirmDialog.vendor?.name || confirmDialog.vendor?.email}</strong>?
                    </Typography>
                    {confirmDialog.activate && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            This will enable Daily Reporting, Inventory Tracking, and WhatsApp Integration for this vendor.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialog({ open: false, vendor: null, activate: false })}
                        disabled={actionLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleTogglePro}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{
                            bgcolor: confirmDialog.activate ? '#004d43' : '#c62828',
                            '&:hover': { bgcolor: confirmDialog.activate ? '#00695c' : '#b71c1c' },
                        }}
                    >
                        {confirmDialog.activate ? 'Activate' : 'Deactivate'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
