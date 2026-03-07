import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Refresh,
  Email,
  CalendarToday,
  TrendingUp,
  Download,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';

const WaitlistPage = () => {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWaitlistEntries = async () => {
    setLoading(true);
    try {
      const waitlistRef = collection(db, 'waitlist');
      const q = query(waitlistRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setWaitlistEntries(entries);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlistEntries();
  }, []);

  const filteredEntries = waitlistEntries.filter(entry =>
    entry.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Email', 'Signup Date', 'Type'];
    const rows = filteredEntries.map(entry => [
      entry.email,
      format(entry.createdAt, 'yyyy-MM-dd hh:mm:ss a'),
      entry.type || 'Early Access'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waitlist.csv';
    a.click();
  };

  const columns = [
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email sx={{ fontSize: 18, color: '#004d43' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Signup Date',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2">
            {format(params.value, 'MMM dd, yyyy hh:mm a')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Early Access'}
          size="small"
          sx={{
            backgroundColor: '#e8ee2620',
            color: '#004d43',
            fontWeight: 'bold',
            fontSize: '11px',
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: () => (
        <Chip
          label="PENDING"
          size="small"
          color="warning"
          sx={{ fontWeight: 'bold', fontSize: '10px' }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#004d43', mb: 0.5 }}>
            Waitlist
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage early access signups
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export to CSV">
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportToCSV}
              sx={{
                borderColor: '#004d43',
                color: '#004d43',
                '&:hover': { borderColor: '#003830', backgroundColor: '#e8ee2610' }
              }}
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchWaitlistEntries} sx={{ color: '#004d43' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #004d43 0%, #003830 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#e8ee26', fontWeight: 'bold' }}>
                  {waitlistEntries.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>
                  Total Signups
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, color: '#e8ee26', opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #e8ee26 0%, #f5fb3d 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#004d43', fontWeight: 'bold' }}>
                  {waitlistEntries.filter(e => {
                    const dayAgo = new Date();
                    dayAgo.setDate(dayAgo.getDate() - 1);
                    return e.createdAt >= dayAgo;
                  }).length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#004d43', opacity: 0.9 }}>
                  Last 24 Hours
                </Typography>
              </Box>
              <CalendarToday sx={{ fontSize: 40, color: '#004d43', opacity: 0.6 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: '#004d43' },
              '&.Mui-focused fieldset': { borderColor: '#004d43' },
            },
          }}
        />
      </Box>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={filteredEntries}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          autoHeight
          disableSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f5f5f5' },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f9f9f9',
              fontWeight: 'bold',
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default WaitlistPage;
