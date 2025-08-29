import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  CheckCircle as ResolvedIcon,
  Warning as PendingIcon
} from '@mui/icons-material';

function Dashboard() {
  const stats = [
    {
      title: 'Total Tickets',
      value: '156',
      icon: <TicketIcon color="primary" />,
      color: 'primary.main'
    },
    {
      title: 'Open Tickets',
      value: '42',
      icon: <PendingIcon color="warning" />,
      color: 'warning.main'
    },
    {
      title: 'Resolved Tickets',
      value: '114',
      icon: <ResolvedIcon color="success" />,
      color: 'success.main'
    },
    {
      title: 'Active Users',
      value: '28',
      icon: <PeopleIcon color="info" />,
      color: 'info.main'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No recent activity to display.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard;