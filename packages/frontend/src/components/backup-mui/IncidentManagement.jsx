import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Schedule,
  Timeline,
  Add,
  Visibility,
  Edit,
  Group,
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`incident-tabpanel-${index}`}
      aria-labelledby={`incident-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IncidentManagement = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Mock data
  const incidents = [
    {
      id: 'INC-001',
      title: 'Email Service Outage',
      description: 'Complete email service failure affecting all users',
      severity: 'critical',
      status: 'investigating',
      priority: 'high',
      assignedTeam: 'Infrastructure Team',
      reporter: 'System Monitor',
      created: '2024-01-15 08:30',
      updated: '2024-01-15 09:15',
      eta: '2 hours',
      affectedUsers: 1250,
    },
    {
      id: 'INC-002',
      title: 'Database Performance Issues',
      description: 'Slow query responses on primary database',
      severity: 'high',
      status: 'identified',
      priority: 'high',
      assignedTeam: 'Database Team',
      reporter: 'John Smith',
      created: '2024-01-15 10:20',
      updated: '2024-01-15 11:45',
      eta: '4 hours',
      affectedUsers: 450,
    },
    {
      id: 'INC-003',
      title: 'VPN Connection Drops',
      description: 'Intermittent VPN disconnections for remote workers',
      severity: 'medium',
      status: 'monitoring',
      priority: 'medium',
      assignedTeam: 'Network Team',
      reporter: 'Sarah Johnson',
      created: '2024-01-14 14:15',
      updated: '2024-01-15 08:30',
      eta: '1 hour',
      affectedUsers: 85,
    },
    {
      id: 'INC-004',
      title: 'Printer Network Issue',
      description: 'Floor 3 printers not accessible from network',
      severity: 'low',
      status: 'resolved',
      priority: 'low',
      assignedTeam: 'Support Team',
      reporter: 'Mike Davis',
      created: '2024-01-13 16:00',
      updated: '2024-01-14 09:30',
      eta: 'Resolved',
      affectedUsers: 25,
    },
  ];

  const severityConfig = {
    critical: { color: '#dc2626', icon: <Error />, bg: '#fef2f2' },
    high: { color: '#ea580c', icon: <Warning />, bg: '#fff7ed' },
    medium: { color: '#ca8a04', icon: <Info />, bg: '#fefce8' },
    low: { color: '#16a34a', icon: <CheckCircle />, bg: '#f0fdf4' },
  };

  const statusConfig = {
    investigating: { color: 'error', label: 'Investigating' },
    identified: { color: 'warning', label: 'Identified' },
    monitoring: { color: 'info', label: 'Monitoring' },
    resolved: { color: 'success', label: 'Resolved' },
  };

  const incidentStats = [
    {
      title: 'Active Incidents',
      value: incidents.filter(inc => inc.status !== 'resolved').length,
      color: '#ef4444',
      icon: <Warning />,
      subtitle: 'Requiring attention',
    },
    {
      title: 'Critical Incidents',
      value: incidents.filter(inc => inc.severity === 'critical' && inc.status !== 'resolved').length,
      color: '#dc2626',
      icon: <Error />,
      subtitle: 'High priority',
    },
    {
      title: 'Affected Users',
      value: incidents.filter(inc => inc.status !== 'resolved').reduce((sum, inc) => sum + inc.affectedUsers, 0),
      color: '#3b82f6',
      icon: <Group />,
      subtitle: 'Currently impacted',
    },
    {
      title: 'Avg Resolution',
      value: '3.2hrs',
      color: '#10b981',
      icon: <Schedule />,
      subtitle: 'Last 30 days',
    },
  ];

  const recentUpdates = [
    {
      incident: 'INC-001',
      update: 'Root cause identified. Database connection pool exhausted.',
      timestamp: '5 minutes ago',
      author: 'Jane Smith',
    },
    {
      incident: 'INC-002',
      update: 'Applied temporary fix. Monitoring performance metrics.',
      timestamp: '15 minutes ago',
      author: 'Bob Wilson',
    },
    {
      incident: 'INC-001',
      update: 'Escalated to senior database administrator.',
      timestamp: '25 minutes ago',
      author: 'System',
    },
    {
      incident: 'INC-003',
      update: 'VPN gateway restart completed. Testing connections.',
      timestamp: '45 minutes ago',
      author: 'Mike Johnson',
    },
  ];

  const IncidentTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
            <TableCell sx={{ fontWeight: 600 }}>Incident ID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Affected Users</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Assigned Team</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>ETA</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                  {incident.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {incident.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {incident.description}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: severityConfig[incident.severity].bg,
                      color: severityConfig[incident.severity].color,
                    }}
                  >
                    {React.cloneElement(severityConfig[incident.severity].icon, { fontSize: 'small' })}
                  </Avatar>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {incident.severity}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={statusConfig[incident.status].label}
                  size="small"
                  color={statusConfig[incident.status].color}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {incident.affectedUsers.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {incident.assignedTeam}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color={incident.status === 'resolved' ? 'success.main' : 'text.primary'}>
                  {incident.eta}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <IconButton size="small" color="primary">
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const RecentUpdates = () => (
    <Paper sx={{ height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
          Recent Updates
        </Typography>
      </Box>
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {recentUpdates.map((update, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Chip
                      label={update.incident}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {update.timestamp}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {update.update}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {update.author}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < recentUpdates.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Incident Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#ef4444',
            '&:hover': { backgroundColor: '#dc2626' },
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Report Incident
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {incidentStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.subtitle}
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="incident tabs">
            <Tab label="All Incidents" />
            <Tab label="Active" />
            <Tab label="Critical" />
            <Tab label="Timeline" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <IncidentTable />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <IncidentTable />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <IncidentTable />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Box display="flex" alignItems="center" justifyContent="center" height={300}>
            <Typography variant="h6" color="text.secondary">
              Timeline view will be implemented here
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Recent Updates */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Additional incident details can go here */}
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentUpdates />
        </Grid>
      </Grid>
    </Box>
  );
};

export default IncidentManagement;