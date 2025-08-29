import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
} from '@mui/material';
import {
  Business,
  CloudQueue,
  Support,
  Computer,
} from '@mui/icons-material';

const ServiceCatalog = () => {
  const catalogStats = [
    { title: 'Total Services', value: '48', color: '#3b82f6', icon: <Business /> },
    { title: 'Active Requests', value: '156', color: '#10b981', icon: <Support /> },
    { title: 'Cloud Services', value: '24', color: '#f59e0b', icon: <CloudQueue /> },
    { title: 'Hardware Services', value: '12', color: '#8b5cf6', icon: <Computer /> },
  ];

  const services = [
    {
      name: 'Email Account Setup',
      description: 'Create new email account for employees',
      category: 'IT Services',
      estimatedTime: '2 hours',
      price: 'Free',
    },
    {
      name: 'Software Installation',
      description: 'Install approved software on workstation',
      category: 'Software Services',
      estimatedTime: '1 hour',
      price: 'Free',
    },
    {
      name: 'Hardware Procurement',
      description: 'Request new hardware equipment',
      category: 'Hardware Services',
      estimatedTime: '3-5 days',
      price: 'Variable',
    },
    {
      name: 'VPN Access',
      description: 'Setup VPN access for remote work',
      category: 'Security Services',
      estimatedTime: '30 minutes',
      price: 'Free',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 600 }}>
        Service Catalog
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {catalogStats.map((stat, index) => (
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

      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
        Available Services
      </Typography>

      <Grid container spacing={3}>
        {services.map((service, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {service.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="primary">
                    {service.category}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {service.estimatedTime}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={500}>
                    Price: {service.price}
                  </Typography>
                  <Button variant="contained" size="small">
                    Request
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServiceCatalog;