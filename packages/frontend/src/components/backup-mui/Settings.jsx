import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';

function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'IT Management System',
    adminEmail: 'admin@company.com',
    supportEmail: 'support@company.com',
    emailNotifications: true,
    smsNotifications: false,
    autoAssignment: true,
    workingHours: '9:00 AM - 5:00 PM',
    timezone: 'UTC-5'
  });

  const handleInputChange = (event) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.value
    });
  };

  const handleSwitchChange = (event) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.checked
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Settings saved:', settings);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={settings.companyName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admin Email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleInputChange}
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Support Email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleInputChange}
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Working Hours"
                name="workingHours"
                value={settings.workingHours}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSwitchChange}
                    name="emailNotifications"
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={handleSwitchChange}
                    name="smsNotifications"
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoAssignment}
                    onChange={handleSwitchChange}
                    name="autoAssignment"
                  />
                }
                label="Auto Assignment of Tickets"
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2}>
            <Button type="submit" variant="contained">
              Save Settings
            </Button>
            <Button variant="outlined">
              Reset to Default
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default Settings;