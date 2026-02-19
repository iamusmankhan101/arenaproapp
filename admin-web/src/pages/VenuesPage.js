import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Rating,
  LinearProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  ToggleOn,
  ToggleOff,
  Analytics,
  Refresh,
  Stadium,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchVenues, updateVenueStatus, clearSuccessMessage, clearError } from '../store/slices/adminSlice';
import AddVenueModal from '../components/AddVenueModal';

const StatusChip = ({ status }) => (
  <Chip
    label={status.toUpperCase()}
    size="small"
    color={status === 'active' ? 'success' : 'default'}
    sx={{
      fontWeight: 'bold',
      fontSize: '10px',
      bgcolor: status === 'active' ? '#e8f5e9' : '#f5f5f5',
      color: status === 'active' ? '#2e7d32' : '#757575',
      border: 'none'
    }}
  />
);

const ActionMenu = ({ venue, onAction }) => {
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
    <>
      <IconButton onClick={handleClick} size="small">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleAction('edit')}>
          <Edit sx={{ mr: 1, fontSize: 16 }} />
          Edit Venue
        </MenuItem>
        <MenuItem onClick={() => handleAction('toggle')}>
          {venue.status === 'active' ? (
            <ToggleOff sx={{ mr: 1, fontSize: 16 }} />
          ) : (
            <ToggleOn sx={{ mr: 1, fontSize: 16 }} />
          )}
          {venue.status === 'active' ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={() => handleAction('analytics')}>
          <Analytics sx={{ mr: 1, fontSize: 16 }} />
          View Analytics
        </MenuItem>
      </Menu>
    </>
  );
};

export default function VenuesPage() {
  const dispatch = useDispatch();
  const { venues, venuesLoading, successMessage, error } = useSelector(state => state.admin);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [addVenueModalOpen, setAddVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'football', label: 'Football' },
    { key: 'cricket', label: 'Cricket' },
    { key: 'padel', label: 'Padel' },
  ];

  useEffect(() => {
    dispatch(fetchVenues({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      filter: selectedFilter,
      search: searchQuery,
    }));
  }, [dispatch, paginationModel, selectedFilter, searchQuery]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleVenueAction = (venueId, action) => {
    if (action === 'toggle') {
      const venue = venues.data.find(v => v.id === venueId);
      const newStatus = venue.status === 'active' ? 'inactive' : 'active';
      dispatch(updateVenueStatus({ venueId, status: newStatus }));
    } else if (action === 'edit') {
      const venue = venues.data.find(v => v.id === venueId);
      setEditingVenue(venue);
      setAddVenueModalOpen(true);
    } else if (action === 'analytics') {
      console.log('View analytics for venue:', venueId);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchVenues({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      filter: selectedFilter,
      search: searchQuery,
    }));
  };

  const handleCloseSnackbar = () => {
    dispatch(clearSuccessMessage());
    dispatch(clearError());
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Venue Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.area}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'sports',
      headerName: 'Sports',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params.value || []).map((sport, index) => (
            <Chip
              key={index}
              label={sport}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize', fontSize: '10px' }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'occupancy',
      headerName: 'Occupancy',
      width: 150,
      renderCell: (params) => {
        const bookedSlots = params.row.bookedSlots || 0;
        const totalSlots = params.row.totalSlots || params.row.timeSlots?.length || 1;
        const occupancyRate = (bookedSlots / totalSlots) * 100;
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">
                {bookedSlots}/{totalSlots}
              </Typography>
              <Typography variant="caption">
                {occupancyRate.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={occupancyRate}
              color={occupancyRate > 80 ? 'success' : occupancyRate > 50 ? 'warning' : 'error'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        );
      },
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={parseFloat(params.value || 0)} readOnly size="small" precision={0.1} />
          <Typography variant="caption">
            ({params.row.totalReviews || 0})
          </Typography>
        </Box>
      ),
    },
    {
      field: 'priceRange',
      headerName: 'Price Range',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          PKR {params.value || params.row.basePrice || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'revenue',
      headerName: 'Monthly Revenue',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          PKR {(params.value || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'contactPerson',
      headerName: 'Contact',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value || 'N/A'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.contactPhone || 'No phone'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <ActionMenu venue={params.row} onAction={handleVenueAction} />
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Stadium sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
                Venues Management
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Manage all sports venues, pricing, and availability
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={venuesLoading}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddVenueModalOpen(true)}
              sx={{ bgcolor: '#e8ee26', color: '#004d43', fontWeight: 700, '&:hover': { bgcolor: '#dce775' } }}
            >
              Add Venue
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search venues..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              onClick={() => handleFilterChange(filter.key)}
              color={selectedFilter === filter.key ? 'primary' : 'default'}
              variant={selectedFilter === filter.key ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={venues.data}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          rowCount={venues.total}
          paginationMode="server"
          loading={venuesLoading}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: 'none',
              fontWeight: 'bold',
              color: '#004d43',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f9fafb',
            },
            '& .MuiTablePagination-root': {
              color: '#004d43',
            },
          }}
        />
      </Box>

      {/* Add/Edit Venue Modal */}
      <AddVenueModal
        open={addVenueModalOpen}
        onClose={() => {
          setAddVenueModalOpen(false);
          setEditingVenue(null);
        }}
        editVenue={editingVenue}
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