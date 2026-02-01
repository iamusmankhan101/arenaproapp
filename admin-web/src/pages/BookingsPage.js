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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  CheckCircle,
  Cancel,
  Phone,
  Email,
  Refresh,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchBookings, updateBookingStatus } from '../store/slices/adminSlice';
import { format } from 'date-fns';

const statusColors = {
  confirmed: '#4CAF50',
  pending: '#FF9800',
  cancelled: '#F44336',
  completed: '#2196F3',
};

const StatusChip = ({ status }) => (
  <Chip
    label={status.toUpperCase()}
    size="small"
    sx={{
      backgroundColor: `${statusColors[status]}20`,
      color: statusColors[status],
      fontWeight: 'bold',
      fontSize: '10px',
    }}
  />
);

const ActionMenu = ({ booking, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    onAction(booking.id, action);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {booking.status === 'pending' && (
          <MenuItem onClick={() => handleAction('confirm')}>
            <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
            Confirm
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAction('cancel')}>
          <Cancel sx={{ mr: 1, fontSize: 16 }} />
          Cancel
        </MenuItem>
        <MenuItem onClick={() => handleAction('contact')}>
          <Phone sx={{ mr: 1, fontSize: 16 }} />
          Contact Customer
        </MenuItem>
      </Menu>
    </>
  );
};

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { bookings, bookingsLoading, bookingsError } = useSelector(state => state.admin);
  
  // Debug logging
  console.log('📊 BookingsPage render:', {
    bookingsData: bookings?.data,
    bookingsTotal: bookings?.total,
    bookingsLoading,
    bookingsError,
    dataLength: bookings?.data?.length
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'today', label: 'Today' },
  ];

  useEffect(() => {
    dispatch(fetchBookings({
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

  const handleBookingAction = (bookingId, action) => {
    if (action === 'confirm') {
      dispatch(updateBookingStatus({ bookingId, status: 'confirmed' }));
    } else if (action === 'cancel') {
      dispatch(updateBookingStatus({ bookingId, status: 'cancelled' }));
    } else if (action === 'contact') {
      const booking = bookings.data.find(b => b.id === bookingId);
      setSelectedBooking(booking);
      setDialogOpen(true);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchBookings({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      filter: selectedFilter,
      search: searchQuery,
    }));
  };

  const columns = [
    {
      field: 'bookingId',
      headerName: 'Booking ID',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.customerPhone}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'turfName',
      headerName: 'Venue',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.turfArea}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'sport',
      headerName: 'Sport',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'dateTime',
      headerName: 'Date & Time',
      width: 160,
      renderCell: (params) => {
        try {
          const date = new Date(params.value);
          return (
            <Box>
              <Typography variant="body2">
                {format(date, 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {format(date, 'hh:mm a')}
              </Typography>
            </Box>
          );
        } catch (error) {
          console.error('Date formatting error:', error, params.value);
          return (
            <Box>
              <Typography variant="body2">
                Invalid Date
              </Typography>
            </Box>
          );
        }
      },
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 100,
      renderCell: (params) => `${params.value}h`,
    },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => {
        try {
          const amount = Number(params.value) || 0;
          return (
            <Typography variant="body2" fontWeight="medium">
              PKR {amount.toLocaleString()}
            </Typography>
          );
        } catch (error) {
          console.error('Amount formatting error:', error, params.value);
          return (
            <Typography variant="body2" fontWeight="medium">
              PKR 0
            </Typography>
          );
        }
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'paid' ? 'success' : params.value === 'pending' ? 'warning' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <ActionMenu booking={params.row} onAction={handleBookingAction} />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bookings Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={bookingsLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search bookings..."
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
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ minWidth: 120 }}
          >
            Export
          </Button>
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

      {/* Error Display */}
      {bookingsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading bookings: {bookingsError}
        </Alert>
      )}

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={bookings?.data || []}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          rowCount={bookings?.total || 0}
          paginationMode="server"
          loading={bookingsLoading}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
        />
      </Box>

      {/* Contact Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Customer</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Customer contact information for booking #{selectedBooking.bookingId}
              </Alert>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone />
                  <Typography>{selectedBooking.customerPhone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email />
                  <Typography>{selectedBooking.customerEmail}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}