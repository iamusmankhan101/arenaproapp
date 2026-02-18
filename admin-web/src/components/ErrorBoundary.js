import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        backgroundColor: '#f5f5f5',
                        p: 3,
                    }}
                >
                    <Container maxWidth="md">
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 2,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h4" color="error" gutterBottom>
                                Something went wrong
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                The application encountered an unexpected error.
                            </Typography>

                            <Box
                                sx={{
                                    mt: 3,
                                    mb: 3,
                                    p: 2,
                                    bgcolor: '#fff0f0',
                                    borderRadius: 1,
                                    border: '1px solid #ffcdd2',
                                    textAlign: 'left',
                                    overflow: 'auto',
                                    maxHeight: '300px',
                                }}
                            >
                                <Typography variant="subtitle2" color="error" gutterBottom sx={{ fontFamily: 'monospace' }}>
                                    {this.state.error && this.state.error.toString()}
                                </Typography>
                                {this.state.errorInfo && (
                                    <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                        {this.state.errorInfo.componentStack}
                                    </Typography>
                                )}
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => window.location.reload()}
                            >
                                Reload Application
                            </Button>
                        </Paper>
                    </Container>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
