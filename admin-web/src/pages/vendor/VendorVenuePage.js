import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Chip,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Alert,
    Snackbar,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardMedia
} from '@mui/material';
import {
    Add,
    MoreVert,
    LocationOn,
    Refresh,
} from '@mui/icons-material'; // Edit removed
import { fetchVenues, updateVenueStatus, clearSuccessMessage, clearError } from '../../store/slices/adminSlice';
import AddVenueModal from '../../components/AddVenueModal';

const StatusChip = ({ status }) => (
    <Chip
        label={status ? status.toUpperCase() : 'UNKNOWN'}
        size="small"
        color={status === 'active' ? 'success' : 'default'}
        sx={{ fontWeight: 'bold', fontSize: '10px' }}
    />
);

const VenueCard = ({ venue, onAction }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        onAction(venue.id, action);
        handleClose();
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="140"
                image={venue.images?.[0]?.preview || venue.images?.[0] || 'https://via.placeholder.com/300x140?text=No+Image'}
                alt={venue.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                        {venue.name}
                    </Typography>
                    <StatusChip status={venue.status} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {venue.address}
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                    Price: PKR {venue.basePrice}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Sports: {venue.sports?.join(', ') || 'N/A'}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button size="small" onClick={() => handleAction('edit')}>Edit</Button>
                <IconButton size="small" onClick={handleClick}>
                    <MoreVert />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
                    <MenuItem onClick={() => handleAction('toggle')}>
                        {venue.status === 'active' ? 'Deactivate' : 'Activate'}
                    </MenuItem>
                </Menu>
            </CardActions>
        </Card>
    );
};

export default function VendorVenuePage() {
    const dispatch = useDispatch();
    const { venues, venuesLoading, successMessage, error } = useSelector(state => state.admin);
    const { admin } = useSelector(state => state.auth);

    const [addVenueModalOpen, setAddVenueModalOpen] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);

    // Vendor ID from auth
    const vendorId = admin?.vendorId || admin?.uid;

    useEffect(() => {
        if (vendorId) {
            dispatch(fetchVenues({
                vendorId: vendorId,
                pageSize: 50 // Fetch enough venues for a list view
            }));
        }
    }, [dispatch, vendorId]);

    const handleVenueAction = (venueId, action) => {
        if (action === 'toggle') {
            const venue = venues.data.find(v => v.id === venueId);
            const newStatus = venue.status === 'active' ? 'inactive' : 'active';
            dispatch(updateVenueStatus({ venueId, status: newStatus }));
        } else if (action === 'edit') {
            const venue = venues.data.find(v => v.id === venueId);
            setEditingVenue(venue);
            setAddVenueModalOpen(true);
        }
    };

    const handleRefresh = () => {
        if (vendorId) {
            dispatch(fetchVenues({
                vendorId: vendorId,
                pageSize: 50
            }));
        }
    };

    const handleCloseSnackbar = () => {
        dispatch(clearSuccessMessage());
        dispatch(clearError());
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    My Venues
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        disabled={venuesLoading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                            setEditingVenue(null);
                            setAddVenueModalOpen(true);
                        }}
                    >
                        Add Venue
                    </Button>
                </Box>
            </Box>

            {venues.data.length === 0 && !venuesLoading ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="textSecondary">You haven't added any venues yet.</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => setAddVenueModalOpen(true)}>Add Your First Venue</Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {venues.data.map((venue) => (
                        <Grid item xs={12} sm={6} md={4} key={venue.id}>
                            <VenueCard venue={venue} onAction={handleVenueAction} />
                        </Grid>
                    ))}
                </Grid>
            )}


            {/* Add/Edit Venue Modal */}
            <AddVenueModal
                open={addVenueModalOpen}
                onClose={() => {
                    setAddVenueModalOpen(false);
                    setEditingVenue(null);
                }}
                editVenue={editingVenue}
                vendorId={vendorId}
            />

            {/* Success/Error Snackbar */}
            <Snackbar
                open={Boolean(successMessage || error)}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={successMessage ? 'success' : 'error'}
                    sx={{ width: '100%' }}
                >
                    {successMessage || error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
