import React from 'react';
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
  Avatar,
} from '@mui/material';
import {
  Devices,
  Computer,
  Smartphone,
  Print,
  Router,
  Add,
} from '@mui/icons-material';

const AssetManagement = () => {
  const assets = [
    { id: 'AST-001', name: 'Dell Laptop - XPS 13', type: 'laptop', status: 'assigned', assignee: 'John Doe', location: 'Floor 2' },
    { id: 'AST-002', name: 'HP Printer - LaserJet', type: 'printer', status: 'available', assignee: '', location: 'Floor 1' },
    { id: 'AST-003', name: 'iPhone 12', type: 'mobile', status: 'assigned', assignee: 'Jane Smith', location: 'Remote' },
    { id: 'AST-004', name: 'Network Router - Cisco', type: 'network', status: 'deployed', assignee: 'IT Team', location: 'Server Room' },
  ];

  const assetStats = [
    { title: 'Total Assets', value: '1,247', color: '#3b82f6', icon: <Devices /> },
    { title: 'Available', value: '89', color: '#10b981', icon: <Computer /> },
    { title: 'Assigned', value: '1,098', color: '#f59e0b', icon: <Smartphone /> },
    { title: 'Maintenance', value: '60', color: '#ef4444', icon: <Print /> },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Asset Management
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Asset
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {assetStats.map((stat, index) => (
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Asset ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} hover>
                <TableCell>{asset.id}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>
                  <Chip label={asset.status} size="small" />
                </TableCell>
                <TableCell>{asset.assignee || 'Unassigned'}</TableCell>
                <TableCell>{asset.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AssetManagement;