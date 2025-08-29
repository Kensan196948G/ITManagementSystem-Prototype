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
  Inventory as InventoryIcon,
  Storage,
  Category,
  TrendingDown,
} from '@mui/icons-material';

const Inventory = () => {
  const inventoryStats = [
    { title: 'Total Items', value: '3,247', color: '#3b82f6', icon: <InventoryIcon /> },
    { title: 'In Stock', value: '2,891', color: '#10b981', icon: <Storage /> },
    { title: 'Categories', value: '45', color: '#f59e0b', icon: <Category /> },
    { title: 'Low Stock', value: '23', color: '#ef4444', icon: <TrendingDown /> },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: '#1e293b', fontWeight: 600 }}>
        Inventory Management
      </Typography>

      <Grid container spacing={3}>
        {inventoryStats.map((stat, index) => (
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
          Inventory Overview
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
            Inventory details will be implemented here
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Inventory;