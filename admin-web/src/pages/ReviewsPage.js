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
    Delete
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchReviews, deleteReview } from '../store/slices/adminSlice';
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
            minWidth: 300,
            renderCell: (params) => (
                <Tooltip title={params.value}>
                    <Typography variant="body2" noWrap>
                        {params.value}
                    </Typography>
                </Tooltip>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(params.row.venueId, params.id)}
                >
                    <Delete />
                </IconButton>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Reviews
                </Typography>
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
        </Box>
    );
}
