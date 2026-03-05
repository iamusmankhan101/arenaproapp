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
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
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
  WhatsApp,
  EventNote,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchBookings, updateBookingStatus } from '../store/slices/adminSlice';
import { format } from 'date-fns';

const statusColors = {
  confirmed: '#2e7d32', // Brand Green
  pending: '#ed6c02',   // Brand Orange
  cancelled: '#d32f2f', // Brand Red
  completed: '#004d43', // Brand Teal
};

const StatusChip = ({ status }) => (
  <Chip
    label={status ? status.toUpperCase() : 'UNKNOWN'}
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
        <MenuItem onClick={() => handleAction('whatsapp')}>
          <WhatsApp sx={{ mr: 1, fontSize: 16, color: booking.venueOwnerPhone ? '#25D366' : 'action.disabled' }} />
          <Typography color={booking.venueOwnerPhone ? 'textPrimary' : 'textSecondary'}>
            Notify Owner
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { bookings, bookingsLoading, bookingsError } = useSelector(state => state.admin);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    } else if (action === 'whatsapp') {
      const booking = bookings.data.find(b => b.id === bookingId);
      if (booking && booking.venueOwnerPhone) {
        // Format message
        const message = encodeURIComponent(
          `*New Booking Alert! from Arena Pro*\n\n` +
          `Hello! You have a new booking at *${booking.turfName}*.\n\n` +
          `📅 Date: ${format(new Date(booking.dateTime), 'MMM dd, yyyy')}\n` +
          `⏰ Time: ${booking.timeSlot}\n` +
          `👤 Customer: ${booking.customerName}\n` +
          `💰 Amount: PKR ${booking.totalAmount}\n\n` +
          `Please ensure the facility is ready. Thanks!`
        );

        // Open WhatsApp
        window.open(`https://wa.me/${booking.venueOwnerPhone.replace(/\+/g, '')}?text=${message}`, '_blank');
      } else {
        alert('This venue does not have an Owner Phone Number configured. Please edit the venue to add one.');
      }
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
      headerName: 'ID',
      width: isMobile ? 70 : 130,
      flex: isMobile ? 0 : undefined,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" fontSize={isMobile ? '0.7rem' : '0.875rem'}>
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      width: isMobile ? 100 : 150,
      flex: isMobile ? 0 : undefined,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" fontSize={isMobile ? '0.7rem' : '0.875rem'} noWrap>
            {params.value}
          </Typography>
          {!isSmallMobile && (
            <Typography variant="caption" color="textSecondary" fontSize={isMobile ? '0.6rem' : '0.75rem'} noWrap>
              {params.row.customerPhone}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'turfName',
      headerName: 'Venue',
      width: isMobile ? 90 : 180,
      flex: isMobile ? 0 : undefined,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" fontSize={isMobile ? '0.7rem' : '0.875rem'} noWrap>
            {params.value}
          </Typography>
          {!isSmallMobile && (
            <Typography variant="caption" color="textSecondary" fontSize={isMobile ? '0.6rem' : '0.75rem'} noWrap>
              {params.row.turfArea}
            </Typography>
          )}
        </Box>
      ),
    },
    ...(!isMobile ? [{
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
    }] : []),
    {
      field: 'dateTime',
      headerName: isMobile ? 'Date' : 'Date & Time',
      width: isMobile ? 80 : 160,
      flex: isMobile ? 0 : undefined,
      renderCell: (params) => {
        try {
          const date = new Date(params.value);
          return (
            <Box>
              <Typography variant="body2" fontSize={isMobile ? '0.65rem' : '0.875rem'} noWrap>
                {format(date, isMobile ? 'MMM dd' : 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="caption" color="textSecondary" fontSize={isMobile ? '0.6rem' : '0.75rem'} noWrap>
                {format(date, isMobile ? 'h:mm a' : 'hh:mm a')}
              </Typography>
            </Box>
          );
        } catch (error) {
          console.error('Date formatting error:', error, params.value);
          return (
            <Box>
              <Typography variant="body2" fontSize={isMobile ? '0.65rem' : '0.875rem'}>
                Invalid
              </Typography>
            </Box>
          );
        }
      },
    },
    ...(!isSmallMobile ? [{
      field: 'duration',
      headerName: 'Dur',
      width: isMobile ? 50 : 100,
      flex: isMobile ? 0 : undefined,
      renderCell: (params) => (
        <Typography fontSize={isMobile ? '0.7rem' : '0.875rem'}>
          {params.value}h
        </Typography>
      ),
    }] : []),
    {
      field: 'totalAmount',
      headerName: isMobile ? 'Amt' : 'Amount',
      width: isMobile ? 65 : 120,
      flex: isMobile ? 0 : undefined,
      renderCell: (params) => {
        try {
          const amount = Number(params.value) || 0;
          return (
            <Typography variant="body2" fontWeight="medium" fontSize={isMobile ? '0.7rem' : '0.875rem'} noWrap>
              {isMobile ? `${(amount / 1000).toFixed(0)}k` : `PKR ${amount.toLocaleString()}`}
            </Typography>
          );
        } catch (error) {
          console.error('Amount formatting error:', error, params.value);
          return (
            <Typography variant="body2" fontWeight="medium" fontSize={isMobile ? '0.7rem' : '0.875rem'}>
              0
            </Typography>
          );
        }
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: isMobile ? 75 : 120,
      flex: isMobile ? 0 : undefined,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    ...(!isMobile ? [{
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
    }] : []),
    {
      field: 'actions',
      headerName: '',
      width: isMobile ? 50 : 80,
      flex: isMobile ? 0 : undefined,
      sortable: false,
      renderCell: (params) => (
        <ActionMenu booking={params.row} onAction={handleBookingAction} />
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
        <CardContent sx={{ 
          p: { xs: 2, sm: 3 }, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <EventNote sx={{ color: '#fff', fontSize: { xs: 24, sm: 28 } }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Bookings Overview
              </Typography>
              {!isSmallMobile && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Track and manage all customer reservations
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={!isSmallMobile && <Refresh />}
            onClick={handleRefresh}
            disabled={bookingsLoading}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.5)', 
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {isSmallMobile ? <Refresh /> : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={handleSearch}
            size={isMobile ? 'small' : 'medium'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize={isMobile ? 'small' : 'medium'} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { xs: '100%', sm: 300 },
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
          {!isSmallMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              size={isMobile ? 'small' : 'medium'}
              sx={{ minWidth: 120 }}
            >
              Export
            </Button>
          )}
        </Box>

        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: 'auto', pb: 1 }}>
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              onClick={() => handleFilterChange(filter.key)}
              color={selectedFilter === filter.key ? 'primary' : 'default'}
              variant={selectedFilter === filter.key ? 'filled' : 'outlined'}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                flexShrink: 0
              }}
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
      <Box sx={{ 
        height: { xs: 500, sm: 600 }, 
        width: '100%',
        '& .MuiDataGrid-root': {
          width: '100%',
          overflowX: 'auto',
        },
      }}>
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
          disableColumnMenu={isMobile}
          columnHeaderHeight={isMobile ? 40 : 56}
          rowHeight={isMobile ? 48 : 52}
          density={isMobile ? 'compact' : 'standard'}
          sx={{
            border: 'none',
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            width: '100%',
            '& .MuiDataGrid-main': {
              width: '100%',
              overflowX: isMobile ? 'auto' : 'hidden',
            },
            '& .MuiDataGrid-virtualScroller': {
              overflowX: isMobile ? 'auto' : 'hidden',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              padding: { xs: '4px 4px', sm: '8px 16px' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: 'none',
              fontWeight: 'bold',
              color: '#004d43',
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              minHeight: { xs: '40px !important', sm: '56px !important' },
              maxHeight: { xs: '40px !important', sm: '56px !important' },
            },
            '& .MuiDataGrid-columnHeader': {
              padding: { xs: '0 4px', sm: '0 16px' },
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            '& .MuiDataGrid-row': {
              minHeight: { xs: '48px !important', sm: '52px !important' },
              maxHeight: { xs: '48px !important', sm: '52px !important' },
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f9fafb',
            },
            '& .MuiTablePagination-root': {
              color: '#004d43',
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              margin: 0,
            },
            '& .MuiTablePagination-select': {
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
            },
            '& .MuiDataGrid-footerContainer': {
              minHeight: { xs: '48px', sm: '52px' },
            },
            '& .MuiDataGrid-columnSeparator': {
              display: isMobile ? 'none' : 'block',
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