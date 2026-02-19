import React from 'react';
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
} from '@mui/material';
import {
    Lock,
    WhatsApp,
    Inventory2,
    AccountBalance,
    WorkspacePremium,
    Star,
} from '@mui/icons-material';

const PRO_FEATURES = [
    {
        title: 'Automated Partner Payouts',
        description:
            'If the venue has multiple investors or partners, the system can automatically split the net revenue and generate individual payout reports at the end of the month.',
        icon: <AccountBalance sx={{ fontSize: 40 }} />,
        color: '#004d43',
        tag: 'Finance',
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
];

export default function VendorProFeaturesPage() {
    const { admin } = useSelector((state) => state.auth);
    const isProActive = admin?.proActive === true;

    return (
        <Box>
            {/* Hero Banner */}
            <Card
                sx={{
                    mb: 4,
                    background: isProActive
                        ? 'linear-gradient(135deg, #004d43 0%, #00897b 100%)'
                        : 'linear-gradient(135deg, #37474f 0%, #546e7a 100%)',
                    color: 'white',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                            sx={{
                                bgcolor: isProActive ? '#FFD700' : 'rgba(255,255,255,0.15)',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <WorkspacePremium sx={{ color: isProActive ? '#004d43' : '#fff', fontSize: 32 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                Arena Pro
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                Unlock powerful tools to grow your venue business
                            </Typography>
                        </Box>
                        {isProActive && (
                            <Chip
                                icon={<Star sx={{ color: '#FFD700 !important' }} />}
                                label="ACTIVE"
                                sx={{
                                    ml: 'auto',
                                    bgcolor: 'rgba(255,215,0,0.2)',
                                    color: '#FFD700',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    border: '1px solid rgba(255,215,0,0.4)',
                                }}
                            />
                        )}
                    </Box>

                    {!isProActive && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Upgrade to Pro
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    PKR 1,500/month • Contact admin to activate
                                </Typography>
                            </Box>
                            <Chip
                                label="Contact Admin"
                                sx={{
                                    bgcolor: '#FFD700',
                                    color: '#004d43',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    px: 1,
                                }}
                            />
                        </Box>
                    )}
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
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                filter: isProActive ? 'none' : 'grayscale(100%)',
                                opacity: isProActive ? 1 : 0.6,
                                '&:hover': {
                                    transform: isProActive ? 'translateY(-4px)' : 'none',
                                    boxShadow: isProActive ? '0 8px 25px rgba(0,77,67,0.15)' : 'none',
                                },
                            }}
                        >
                            {/* Lock Overlay */}
                            {!isProActive && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        bgcolor: 'rgba(255,255,255,0.4)',
                                        zIndex: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.5)', width: 48, height: 48 }}>
                                        <Lock sx={{ color: 'white' }} />
                                    </Avatar>
                                </Box>
                            )}

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
                                    ) : (
                                        <Chip
                                            icon={<Lock sx={{ fontSize: '14px !important' }} />}
                                            label="Pro Required"
                                            size="small"
                                            sx={{
                                                bgcolor: '#f5f5f5',
                                                color: '#9e9e9e',
                                                fontWeight: 600,
                                            }}
                                        />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pricing Info */}
            <Card sx={{ mt: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#004d43', mb: 1 }}>
                        Pro Plan Details
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        All fields marked with an asterisk (*) are included in the Pro plan.
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            'Automated Partner Payouts*',
                            'Live Inventory Tracking*',
                            'WhatsApp API Integration*',
                            'Priority Support',
                            'Advanced Analytics',
                            'Custom Branding',
                        ].map((item, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Star sx={{ fontSize: 16, color: '#FFD700' }} />
                                    <Typography variant="body2">{item}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#004d43' }}>
                            PKR 1,500
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            / month
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
