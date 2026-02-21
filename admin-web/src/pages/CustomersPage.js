import { useEffect, useState } from 'react';
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
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Block,
  CheckCircle,
  Phone,
  Star,
  Refresh,
  People,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchCustomers, updateCustomerStatus } from '../store/slices/adminSlice';
import { format } from 'date-fns';

const StatusChip = ({ status }) => (
  <Chip
    label={status ? status.toUpperCase() : 'UNKNOWN'}
    size="small"
    color={status === 'active' ? 'success' : 'default'}
    sx={{ fontWeight: 'bold', fontSize: '10px' }}
  />
);

const TierChip = ({ totalSpent, isVip }) => {
  let tier, color;
  if (isVip || totalSpent > 50000) {
    tier = 'VIP';
    color = '#FFD700';
  } else if (totalSpent > 20000) {
    tier = 'Gold';
    color = '#FF9800';
  } else if (totalSpent > 10000) {
    tier = 'Silver';
    color = '#9E9E9E';
  } else {
    tier = 'Bronze';
    color = '#8D6E63';
  }

  return (
    <Chip
      label={tier}
      size="small"
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 'bold',
        fontSize: '10px',
      }}
      icon={<Star sx={{ fontSize: 12 }} />}
    />
  );
};

const ActionMenu = ({ customer, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    onAction(customer.id, action);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleAction('view')}>
          <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleAction('contact')}>
          <Phone sx={{ mr: 1, fontSize: 16 }} />
          Contact Customer
        </MenuItem>
        <MenuItem onClick={() => handleAction('block')}>
          <Block sx={{ mr: 1, fontSize: 16 }} />
          {customer.status === 'active' ? 'Block' : 'Unblock'} Customer
        </MenuItem>
      </Menu>
    </>
  );
};

export default function CustomersPage() {
  const dispatch = useDispatch();
  const { customers, customersLoading, customersError } = useSelector(state => state.admin);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'vip', label: 'VIP' },
    { key: 'new', label: 'New (30 days)' },
  ];

  useEffect(() => {
    console.log('🔄 CustomersPage: Fetching customers with params:', {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      filter: selectedFilter,
      search: searchQuery,
    });

    dispatch(fetchCustomers({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      filter: selectedFilter,
      search: searchQuery,
    }));
  }, [dispatch, paginationModel, selectedFilter, searchQuery]);

  // Debug logging
  useEffect(() => {
    console.log('📊 CustomersPage: State updated:', {
      customersData: customers.data,
      customersTotal: customers.total,
      customersLoading,
      dataLength: customers.data?.length || 0
    });
  }, [customers, customersLoading]);

  // Enhanced debugging for customers loading
  useEffect(() => {
    console.log('🔍 CustomersPage: Component state debug:', {
      customersData: customers.data,
      customersDataType: typeof customers.data,
      customersDataIsArray: Array.isArray(customers.data),
      customersTotal: customers.total,
      customersLoading,
      customersError,
      dataLength: customers.data?.length || 0,
      firstCustomer: customers.data?.[0] || null
    });

    // Force re-render if data exists but DataGrid is empty
    if (customers.data && customers.data.length > 0 && !customersLoading) {
      console.log('✅ CustomersPage: Data available, should display in DataGrid');
    } else if (!customersLoading && (!customers.data || customers.data.length === 0)) {
      console.log('⚠️ CustomersPage: No data available after loading complete');
    }
  }, [customers, customersLoading, customersError]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleCustomerAction = (customerId, action) => {
    if (action === 'block') {
      const customer = customers.data.find(c => c.id === customerId);
      const newStatus = customer.status === 'active' ? 'inactive' : 'active';
      dispatch(updateCustomerStatus({ customerId, status: newStatus }));
    } else if (action === 'view') {
      console.log('View customer details:', customerId);
    } else if (action === 'contact') {
      console.log('Contact customer:', customerId);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchCustomers({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      filter: selectedFilter,
      search: searchQuery,
    }));
  };

  const columns = [
    {
      field: 'customer',
      headerName: 'Customer',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.row.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'tier',
      headerName: 'Tier',
      width: 100,
      renderCell: (params) => (
        <TierChip totalSpent={params.row.totalSpent} isVip={params.row.isVip} />
      ),
    },
    {
      field: 'totalBookings',
      headerName: 'Bookings',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'totalSpent',
      headerName: 'Total Spent',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          PKR {(params.value / 1000).toFixed(0)}K
        </Typography>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Star sx={{ fontSize: 16, color: '#FFD700' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'preferredSports',
      headerName: 'Sports',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.slice(0, 2).map((sport, index) => (
            <Chip
              key={index}
              label={sport}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize', fontSize: '9px' }}
            />
          ))}
          {params.value.length > 2 && (
            <Typography variant="caption" color="textSecondary">
              +{params.value.length - 2}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'joinDate',
      headerName: 'Join Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), 'MMM dd, yyyy')}
        </Typography>
      ),
    },
    {
      field: 'lastBooking',
      headerName: 'Last Booking',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="textSecondary">
          {format(new Date(params.value), 'MMM dd, yyyy')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <ActionMenu customer={params.row} onAction={handleCustomerAction} />
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
              <People sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
                Customers Management
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                View and manage registered users
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              handleRefresh();
            }}
            disabled={customersLoading}
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
          >
            {customersLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search customers..."
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

      {/* Error Display */}
      {customersError && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
          <Typography variant="body2" color="error">
            ❌ Error loading customers: {customersError}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        </Box>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        {/* Debug info before DataGrid */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              DataGrid Debug: Rows={customers.data?.length || 0}, Loading={customersLoading ? 'Yes' : 'No'}, Error={customersError || 'None'}
            </Typography>
          </Box>
        )}

        <DataGrid
          rows={customers.data || []}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          rowCount={customers.total || 0}
          paginationMode="server"
          loading={customersLoading}
          disableRowSelectionOnClick
          key={`customers-${customers.data?.length || 0}-${customersLoading}`}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
          onStateChange={(state) => {
            console.log('📊 DataGrid state change:', {
              rows: state.rows?.length || 0,
              rowCount: state.pagination?.rowCount,
              loading: state.loading,
              error: state.error
            });
          }}
          // Add error handling
          onError={(error) => {
            console.error('❌ DataGrid error:', error);
          }}
        />

        {/* Enhanced Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              Debug Info: Rows={customers.data?.length || 0}, Total={customers.total || 0}, Loading={customersLoading ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="caption" display="block">
              Data: {JSON.stringify(customers.data?.slice(0, 2) || [], null, 2)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}