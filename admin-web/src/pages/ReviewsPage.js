import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Alert,
    Tooltip,
    Rating
} from '@mui/material';
import {
    Refresh,
    Delete,
    Check,

} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchReviews, deleteReview, updateReviewStatus } from '../store/slices/adminSlice';
import { format } from 'date-fns';

export default function ReviewsPage() {
    const dispatch = useDispatch();
    const { reviews, reviewsLoading, reviewsError } = useSelector(state => state.admin);

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });

    useEffect(() => {
        dispatch(fetchReviews({
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
        }));
    }, [dispatch, paginationModel]);

    const handleRefresh = () => {
        dispatch(fetchReviews({
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
        }));
    };

    const handleDelete = (venueId, reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            dispatch(deleteReview({ venueId, reviewId }));
        }
    };

    const handleStatusUpdate = (venueId, reviewId, status) => {
        console.log(`Updating status for review ${reviewId} to ${status}`);
        dispatch(updateReviewStatus({ venueId, reviewId, status }));
    };

    const columns = [
        {
            field: 'date',
            headerName: 'Date',
            width: 150,
            renderCell: (params) => {
                try {
                    return format(new Date(params.value), 'MMM dd, yyyy');
                } catch (e) {
                    return 'Invalid Date';
                }
            }
        },
        {
            field: 'venueName',
            headerName: 'Venue',
            width: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'userName',
            headerName: 'User',
            width: 150,
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 140,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={params.value} readOnly size="small" />
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({params.value})
                    </Typography>
                </Box>
            )
        },
        {
            field: 'comment',
            headerName: 'Comment',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Typography variant="body2" noWrap>
                        {params.value}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                const status = params.value || 'approved'; // Default to approved for old reviews


                return (
                    <Box
                        sx={{
                            backgroundColor: status === 'approved' ? '#e8f5e9' : status === 'pending' ? '#fff3e0' : '#ffebee',
                            color: status === 'approved' ? '#2e7d32' : status === 'pending' ? '#ef6c00' : '#c62828',
                            borderRadius: '16px',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
                            display: 'inline-block'
                        }}
                    >
                        {status}
                    </Box>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => {
                const status = params.row.status || 'approved';
                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {status === 'pending' && (
                            <Tooltip title="Approve">
                                <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() => handleStatusUpdate(params.row.venueId, params.id, 'approved')}
                                >
                                    <Check />
                                </IconButton>
                            </Tooltip>
                        )}

                        {(status === 'pending' || status === 'approved') && (
                            <Tooltip title="Delete/Reject">
                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDelete(params.row.venueId, params.id)}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>

                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                    disabled={reviewsLoading}
                >
                    Refresh
                </Button>
            </Box>

            {reviewsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading reviews: {reviewsError}
                </Alert>
            )}

            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={reviews?.data || []}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[25, 50, 100]}
                    rowCount={reviews?.total || 0}
                    paginationMode="client" // Client-side pagination for collectionGroup query simplification
                    loading={reviewsLoading}
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
        </Box>
    );
}
