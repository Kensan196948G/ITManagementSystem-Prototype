import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Timeline,
  PieChart,
} from '@mui/icons-material';

const Analytics = () => {
  const analyticsStats = [
    { title: 'Avg Response Time', value: '2.3h', color: '#3b82f6', icon: <Timeline /> },
    { title: 'Resolution Rate', value: '94%', color: '#10b981', icon: <Assessment /> },
    { title: 'Customer Satisfaction', value: '4.7/5', color: '#f59e0b', icon: <TrendingUp /> },
    { title: 'SLA Compliance', value: '96.2%', color: '#8b5cf6', icon: <PieChart /> },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 600 }}>
        Analytics & Reports
      </Typography>

      <Grid container spacing={3}>
        {analyticsStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: stat.color + '20', color: stat.color }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Performance Trends
        </Typography>
        <Box 
          sx={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Analytics charts will be implemented here
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Analytics;