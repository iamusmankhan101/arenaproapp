import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import {
  Notifications,
  Security,
  Payment,
  Settings as SettingsIcon,
  Backup,
  Update,
} from '@mui/icons-material';

export default function SettingsPage() {
  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #004d43 0%, #00897b 100%)' }}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <SettingsIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
              System Settings
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Manage application configurations and preferences
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsIcon sx={{ mr: 1, color: '#004d43' }} />
                <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 700 }}>General Settings</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Auto-confirm bookings"
                    secondary="Automatically confirm bookings when payment is received"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Allow cancellations"
                    secondary="Allow customers to cancel bookings up to 2 hours before"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Require phone verification"
                    secondary="Require customers to verify their phone number"
                  />
                  <ListItemSecondaryAction>
                    <Switch />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1, color: '#004d43' }} />
                <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 700 }}>Notifications</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email notifications"
                    secondary="Receive email alerts for new bookings and cancellations"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="SMS notifications"
                    secondary="Receive SMS alerts for urgent matters"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Daily reports"
                    secondary="Receive daily summary reports via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: '#004d43' }} />
                <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 700 }}>Security</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Two-factor authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                  <ListItemSecondaryAction>
                    <Button variant="outlined" size="small">
                      Enable
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Session timeout"
                    secondary="Automatically log out after 30 minutes of inactivity"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Login alerts"
                    secondary="Get notified when someone logs into your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Payment sx={{ mr: 1, color: '#004d43' }} />
                <Typography variant="h6" sx={{ color: '#004d43', fontWeight: 700 }}>Payment Settings</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Accept online payments"
                    secondary="Allow customers to pay online via card or digital wallet"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Accept cash payments"
                    secondary="Allow customers to pay cash at the venue"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Automatic refunds"
                    secondary="Automatically process refunds for cancelled bookings"
                  />
                  <ListItemSecondaryAction>
                    <Switch />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#004d43', fontWeight: 700 }}>
                System Management
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Backup />}
                    sx={{ py: 2 }}
                  >
                    Backup Data
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Update />}
                    sx={{ py: 2 }}
                  >
                    Check Updates
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="warning"
                    sx={{ py: 2 }}
                  >
                    Clear Cache
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    sx={{ py: 2 }}
                  >
                    Reset Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              System Information
            </Typography>
            <Typography variant="body2">
              Version: 1.0.0 | Last Updated: January 31, 2025 | Database: Connected |
              Server Status: Online | Uptime: 99.9%
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}