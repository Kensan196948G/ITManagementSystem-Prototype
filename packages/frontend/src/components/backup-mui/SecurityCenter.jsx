import React from 'react';
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
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Security,
  Shield,
  Warning,
  BugReport,
  Lock,
  Verified,
} from '@mui/icons-material';

const SecurityCenter = () => {
  const securityMetrics = [
    { title: 'Security Score', value: '87%', color: '#10b981', icon: <Shield /> },
    { title: 'Vulnerabilities', value: '23', color: '#ef4444', icon: <Warning /> },
    { title: 'Threats Blocked', value: '1,456', color: '#3b82f6', icon: <Security /> },
    { title: 'Compliance', value: '94%', color: '#8b5cf6', icon: <Verified /> },
  ];

  const threats = [
    { type: 'Malware', count: 45, severity: 'high', blocked: true },
    { type: 'Phishing', count: 123, severity: 'medium', blocked: true },
    { type: 'Brute Force', count: 12, severity: 'high', blocked: true },
    { type: 'Suspicious Activity', count: 67, severity: 'low', blocked: false },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 600 }}>
        Security Center
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {securityMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                  </Box>
                  <Avatar sx={{ backgroundColor: metric.color + '20', color: metric.color }}>
                    {metric.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Security Events
            </Typography>
            <List>
              {threats.map((threat, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={threat.type}
                    secondary={`${threat.count} attempts detected`}
                  />
                  <Chip
                    label={threat.blocked ? 'Blocked' : 'Investigating'}
                    color={threat.blocked ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Security Status
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Overall Security Health
              </Typography>
              <LinearProgress
                variant="determinate"
                value={87}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Last updated: 5 minutes ago
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecurityCenter;