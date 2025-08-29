import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Build,
  CloudDone,
  Warning,
  CheckCircle,
  Schedule,
  Add,
  Edit,
  Visibility,
  TrendingUp,
} from '@mui/icons-material';

const ServiceManagement = () => {
  const services = [
    {
      id: 'SVC-001',
      name: 'Email Service',
      status: 'operational',
      uptime: 99.9,
      sla: 99.5,
      owner: 'Infrastructure Team',
      users: 1500,
      incidents: 2,
      lastIncident: '2 days ago',
    },
    {
      id: 'SVC-002',
      name: 'File Storage',
      status: 'operational',
      uptime: 98.7,
      sla: 99.0,
      owner: 'Storage Team',
      users: 1200,
      incidents: 1,
      lastIncident: '5 days ago',
    },
    {
      id: 'SVC-003',
      name: 'Web Portal',
      status: 'degraded',
      uptime: 96.2,
      sla: 98.0,
      owner: 'Web Team',
      users: 2000,
      incidents: 5,
      lastIncident: '1 hour ago',
    },
    {
      id: 'SVC-004',
      name: 'Database Service',
      status: 'maintenance',
      uptime: 99.1,
      sla: 99.5,
      owner: 'Database Team',
      users: 800,
      incidents: 0,
      lastIncident: '1 week ago',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      operational: '#10b981',
      degraded: '#f59e0b',
      maintenance: '#6b7280',
      outage: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      operational: <CheckCircle />,
      degraded: <Warning />,
      maintenance: <Schedule />,
      outage: <Warning />,
    };
    return icons[status] || <Schedule />;
  };

  const serviceStats = [
    {
      title: 'Total Services',
      value: services.length,
      color: '#3b82f6',
      icon: <Build />,
    },
    {
      title: 'Operational',
      value: services.filter(s => s.status === 'operational').length,
      color: '#10b981',
      icon: <CheckCircle />,
    },
    {
      title: 'Average SLA',
      value: '98.8%',
      color: '#8b5cf6',
      icon: <TrendingUp />,
    },
    {
      title: 'Total Users',
      value: services.reduce((sum, s) => sum + s.users, 0),
      color: '#f59e0b',
      icon: <CloudDone />,
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Service Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#3b82f6',
            '&:hover': { backgroundColor: '#2563eb' },
            borderRadius: '8px',
            textTransform: 'none',
          }}
        >
          Add Service
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {serviceStats.map((stat, index) => (
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

      {/* Services Grid */}
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} md={6} key={service.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {service.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.id} • {service.owner}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: getStatusColor(service.status) + '20',
                        color: getStatusColor(service.status),
                      }}
                    >
                      {React.cloneElement(getStatusIcon(service.status), { fontSize: 'small' })}
                    </Avatar>
                    <Chip
                      label={service.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(service.status) + '20',
                        color: getStatusColor(service.status),
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Uptime</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {service.uptime}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={service.uptime}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: service.uptime >= service.sla ? '#10b981' : '#f59e0b',
                      },
                    }}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      SLA Target
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {service.sla}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {service.users.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Incidents (30d)
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {service.incidents}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Incident
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {service.lastIncident}
                    </Typography>
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <IconButton size="small" color="primary">
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServiceManagement;