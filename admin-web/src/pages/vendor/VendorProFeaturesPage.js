import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Avatar,
    Dialog,
    DialogContent,
    DialogActions,
    Divider,
    IconButton,
    Tooltip,
    Snackbar,
    Alert as MuiAlert,
} from '@mui/material';
import {
    WhatsApp,
    Inventory2,
    Assessment,
    WorkspacePremium,
    Star,
    CheckCircle,
    Payment,
    Campaign,
    Close,
    ContentCopy,
    Info,
    Smartphone,
} from '@mui/icons-material';


const PRO_FEATURES = [
    {
        title: 'Daily Reporting',
        description:
            'A complete end-of-day operations module: financial ledger reconciling digital deposits and cash collection, customer insights with new vs. returning player analytics, court utilization rates, and a one-click PDF/WhatsApp shift handover report.',
        icon: <Assessment sx={{ fontSize: 40 }} />,
        color: '#004d43',
        tag: 'Operations',
    },
    {
        title: 'Live Inventory Tracking',
        description:
            'Go beyond simple upsells. Track premium padel rackets, cricket tape balls, and other equipment in real-time. Prevents double-booking items across simultaneous court reservations.',
        icon: <Inventory2 sx={{ fontSize: 40 }} />,
        color: '#00796b',
        tag: 'Operations',
    },
    {
        title: 'WhatsApp API Integration',
        description:
            'Email notifications often get ignored. Connect a business WhatsApp integration so booking confirmations, payment reminders, or sudden rain delay alerts go directly to the player\'s phone.',
        icon: <WhatsApp sx={{ fontSize: 40 }} />,
        color: '#25D366',
        tag: 'Communication',
    },
    {
        title: 'Promo & In-App Marketing',
        description: 'Boost your venue visibility by 3x. Get priority placement in search results and run exclusive "Dead Hour" or "Weekend" promos directly on the user home screen.',
        icon: <Campaign sx={{ fontSize: 40 }} />,
        color: '#e65100',
        tag: 'Marketing',
    },
];

export default function VendorProFeaturesPage() {
    const { admin } = useSelector((state) => state.auth);
    const isProActive = admin?.proActive === true;
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyAccount = () => {
        navigator.clipboard.writeText('03058562523');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box>
            {/* Hero Banner */}
            <Card
                sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Avatar
                            sx={{
                                bgcolor: '#e8ee26',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <WorkspacePremium sx={{ color: '#004d43', fontSize: 32 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                                Arena Pro
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                Unlock powerful tools to grow your venue business
                            </Typography>
                        </Box>
                        {isProActive ? (
                            <Chip
                                icon={<Star sx={{ color: '#004d43 !important' }} />}
                                label="ACTIVE"
                                sx={{
                                    bgcolor: 'rgba(255,215,0,0.2)',
                                    color: '#FFD700',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    border: '1px solid rgba(255,215,0,0.4)',
                                }}
                            />
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<Payment />}
                                onClick={() => setPaymentOpen(true)}
                                sx={{
                                    bgcolor: '#FFD700',
                                    color: '#004d43',
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    '&:hover': { bgcolor: '#FFC107' },
                                }}
                            >
                                Activate Pro
                            </Button>
                        )}
                    </Box>

                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFD700' }}>
                            PKR 2,000
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            / month
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                            All 3 premium features included
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Feature Cards */}
            <Grid container spacing={3}>
                {PRO_FEATURES.map((feature, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 3,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(0,77,67,0.15)',
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${feature.color}15`,
                                            width: 56,
                                            height: 56,
                                        }}
                                    >
                                        {React.cloneElement(feature.icon, { sx: { fontSize: 28, color: feature.color } })}
                                    </Avatar>
                                    <Chip
                                        label={feature.tag}
                                        size="small"
                                        sx={{
                                            bgcolor: `${feature.color}15`,
                                            color: feature.color,
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                                    {feature.title}
                                </Typography>

                                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {feature.description}
                                </Typography>

                                <Box sx={{ mt: 3 }}>
                                    {isProActive ? (
                                        <Chip
                                            icon={<CheckCircle sx={{ fontSize: '16px !important', color: '#004d43 !important' }} />}
                                            label="Active"
                                            size="small"
                                            sx={{
                                                bgcolor: '#e0f2f1',
                                                color: '#004d43',
                                                fontWeight: 600,
                                            }}
                                        />
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                color: feature.color,
                                                borderColor: feature.color,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Coming Soon
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pricing Info */}
            <Card sx={{ mt: 4, borderRadius: 3, border: '2px solid #004d43' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#004d43', mb: 1 }}>
                        Pro Plan Includes
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            'Daily Financial Ledger',
                            'Live Inventory Tracking',
                            'WhatsApp API Integration',
                            'Customer & No-Show Insights',
                            'Court Utilization Analytics',
                            'One-Click EOD Shift Handover',
                        ].map((item, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle sx={{ fontSize: 18, color: '#004d43' }} />
                                    <Typography variant="body2">{item}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    {!isProActive && (
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Payment />}
                                onClick={() => setPaymentOpen(true)}
                                sx={{
                                    bgcolor: '#004d43',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: '#00695c' },
                                }}
                            >
                                Activate Pro — PKR 2,000/month
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog
                open={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }
                }}
            >
                {/* Branded Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #004d43 0%, #00796b 100%)',
                    p: 3,
                    position: 'relative',
                    color: '#fff'
                }}>
                    <IconButton
                        onClick={() => setPaymentOpen(false)}
                        sx={{ position: 'absolute', right: 12, top: 12, color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                    >
                        <Close />
                    </IconButton>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                        Activate Arena Pro
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Complete your subscription to unlock all premium features
                    </Typography>
                </Box>

                <DialogContent sx={{ p: 4, bgcolor: '#fbfcfc' }}>
                    {/* Subscription Summary Card */}
                    <Card sx={{
                        borderRadius: 3,
                        mb: 4,
                        border: '1px solid rgba(0,77,67,0.1)',
                        boxShadow: '0 4px 12px rgba(0,77,67,0.05)',
                        overflow: 'visible',
                        position: 'relative'
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: -12,
                            left: 20,
                            bgcolor: '#e8ee26',
                            color: '#004d43',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>
                            RECOMMENDED
                        </Box>
                        <CardContent sx={{ p: 3, pt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={800} color="#00463f">
                                        Arena Pro Plan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Monthly Billing • Includes all 6 features
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h4" fontWeight={900} sx={{ color: '#004d43' }}>
                                        PKR 2,000
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#004d43', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Payment fontSize="small" /> PAYMENT INSTRUCTIONS
                    </Typography>

                    {/* Payment Details Card */}
                    <Card sx={{
                        borderRadius: 3,
                        bgcolor: '#fff',
                        border: '1px solid #e0e0e0',
                        boxShadow: 'none'
                    }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f0f4f4' }}>
                                <Avatar sx={{ bgcolor: '#004d43', width: 48, height: 48 }}>
                                    <Smartphone sx={{ color: '#e8ee26' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#004d43' }}>
                                        Easypaisa
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        DIRECT MOBILE TRANSFER
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                                            ACCOUNT NAME
                                        </Typography>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: '#004d43', mb: 2 }}>
                                            Muhammad Usman Khan
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                                            SEND TO ACCOUNT
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            bgcolor: '#f8f9fa',
                                            borderRadius: 2,
                                            border: '2px dashed #004d43'
                                        }}>
                                            <Typography variant="h5" fontWeight={800} sx={{ color: '#004d43', letterSpacing: 2 }}>
                                                0305-8562523
                                            </Typography>
                                            <Tooltip title={copied ? "Copied!" : "Copy Account #"}>
                                                <Button
                                                    onClick={handleCopyAccount}
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                                                    sx={{
                                                        bgcolor: copied ? '#4caf50' : '#004d43',
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        px: 2,
                                                        minWidth: 100,
                                                        '&:hover': { bgcolor: copied ? '#43a047' : '#00695c' }
                                                    }}
                                                >
                                                    {copied ? 'Copied' : 'Copy'}
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                                Total Due Today
                                            </Typography>
                                            <Typography variant="h6" fontWeight={800} color="#1a1a1a">
                                                PKR 2,000
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Help Alert */}
                    <Box sx={{
                        mt: 4,
                        p: 2.5,
                        bgcolor: 'rgba(232, 238, 38, 0.1)',
                        borderRadius: 3,
                        border: '1px solid rgba(232, 238, 38, 0.3)',
                        display: 'flex',
                        gap: 2
                    }}>
                        <Info sx={{ color: '#004d43', mt: 0.3 }} />
                        <Typography variant="body2" sx={{ color: '#004d43', lineHeight: 1.6, fontWeight: 500 }}>
                            <Box component="span" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>Verification Required</Box>
                            After sending the payment, please share the screenshot with our support team to activate your Pro features. Your account will be upgraded within <Box component="span" sx={{ fontWeight: 800 }}>24 hours</Box>.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0, bgcolor: '#fbfcfc' }}>
                    <Button
                        fullWidth
                        size="large"
                        onClick={() => setPaymentOpen(false)}
                        sx={{
                            textTransform: 'none',
                            color: '#004d43',
                            fontWeight: 700,
                            borderRadius: 3,
                            py: 1.5,
                            border: '2px solid #004d43',
                            '&:hover': { border: '2px solid #004d43', bgcolor: 'rgba(0,77,67,0.05)' }
                        }}
                    >
                        Close & Pay Later
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={copied} autoHideDuration={3000} onClose={() => setCopied(false)}>
                <MuiAlert onClose={() => setCopied(false)} severity="success" sx={{ width: '100%', borderRadius: 2 }}>
                    Account number copied to clipboard!
                </MuiAlert>
            </Snackbar>
        </Box>
    );
}
