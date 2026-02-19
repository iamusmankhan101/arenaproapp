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
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
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

    return (
        <Box>
            {/* Hero Banner */}
            <Card
                sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Avatar
                            sx={{
                                bgcolor: '#FFD700',
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
                                icon={<Star sx={{ color: '#FFD700 !important' }} />}
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
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#004d43', pb: 0 }}>
                    Activate Arena Pro
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Card sx={{ bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body1" fontWeight={600}>
                                        Arena Pro Subscription
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} sx={{ color: '#004d43' }}>
                                        PKR 2,000
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Monthly subscription • Includes all 3 premium features
                                </Typography>
                            </CardContent>
                        </Card>

                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004d43', mb: 2 }}>
                            Payment Method
                        </Typography>

                        <Card sx={{ border: '2px solid #004d43', borderRadius: 2, bgcolor: '#e0f2f1' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: '#004d43', width: 44, height: 44 }}>
                                        <Payment sx={{ color: '#fff' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004d43' }}>
                                            Easypaisa
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Mobile Payment
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Account Number
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700} sx={{ color: '#004d43', letterSpacing: 1 }}>
                                            0305-8562523
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Amount
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700}>
                                            PKR 2,000
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Box sx={{ mt: 3, p: 2, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe082' }}>
                            <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600 }}>
                                📌 After sending the payment, please contact admin to activate your Pro features. Your account will be upgraded within 24 hours.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setPaymentOpen(false)} sx={{ textTransform: 'none' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
