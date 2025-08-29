import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Add,
  MoreVert,
  Assignment,
  Schedule,
  Person,
  Priority,
} from '@mui/icons-material';

const TicketManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data
  const tickets = [
    {
      id: 'TKT-001',
      title: 'Email server not responding',
      requester: 'John Doe',
      assignee: 'Jane Smith',
      priority: 'high',
      status: 'open',
      category: 'Infrastructure',
      created: '2024-01-15 09:30',
      updated: '2024-01-15 14:20',
    },
    {
      id: 'TKT-002',
      title: 'Password reset request',
      requester: 'Mike Johnson',
      assignee: 'Bob Wilson',
      priority: 'medium',
      status: 'in-progress',
      category: 'Security',
      created: '2024-01-15 11:15',
      updated: '2024-01-15 13:45',
    },
    {
      id: 'TKT-003',
      title: 'Printer not working',
      requester: 'Sarah Connor',
      assignee: 'Alice Brown',
      priority: 'low',
      status: 'resolved',
      category: 'Hardware',
      created: '2024-01-14 16:00',
      updated: '2024-01-15 10:30',
    },
    {
      id: 'TKT-004',
      title: 'Software installation request',
      requester: 'David Lee',
      assignee: 'Charlie Davis',
      priority: 'medium',
      status: 'closed',
      category: 'Software',
      created: '2024-01-13 08:45',
      updated: '2024-01-14 15:20',
    },
    {
      id: 'TKT-005',
      title: 'Network connectivity issues',
      requester: 'Emma Watson',
      assignee: 'Frank Miller',
      priority: 'high',
      status: 'open',
      category: 'Network',
      created: '2024-01-15 07:20',
      updated: '2024-01-15 12:10',
    },
  ];

  const statusColors = {
    open: 'error',
    'in-progress': 'warning',
    resolved: 'success',
    closed: 'default',
  };

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || ticket.status === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    handleFilterClose();
  };

  const ticketStats = [
    { label: 'Total Tickets', value: tickets.length, color: '#3b82f6', icon: <Assignment /> },
    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: '#ef4444', icon: <Schedule /> },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: '#f59e0b', icon: <Person /> },
    { label: 'Resolved Today', value: tickets.filter(t => t.status === 'resolved').length, color: '#10b981', icon: <Priority /> },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Ticket Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#3b82f6',
            '&:hover': { backgroundColor: '#2563eb' },
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Create Ticket
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {ticketStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.7 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
            sx={{
              borderColor: '#d1d5db',
              color: '#374151',
              '&:hover': { borderColor: '#9ca3af' },
            }}
          >
            Filter: {selectedFilter === 'all' ? 'All' : selectedFilter}
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterSelect('all')}>All</MenuItem>
            <MenuItem onClick={() => handleFilterSelect('open')}>Open</MenuItem>
            <MenuItem onClick={() => handleFilterSelect('in-progress')}>In Progress</MenuItem>
            <MenuItem onClick={() => handleFilterSelect('resolved')}>Resolved</MenuItem>
            <MenuItem onClick={() => handleFilterSelect('closed')}>Closed</MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Tickets Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Ticket ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Requester</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredTickets().map((ticket) => (
              <TableRow key={ticket.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                    {ticket.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ticket.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{ticket.requester}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{ticket.assignee}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.priority}
                    size="small"
                    sx={{
                      backgroundColor: priorityColors[ticket.priority] + '20',
                      color: priorityColors[ticket.priority],
                      fontWeight: 500,
                      fontSize: '11px',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status}
                    size="small"
                    color={statusColors[ticket.status]}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.category}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(ticket.created).toLocaleDateString()}
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
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#3b82f6',
          '&:hover': { backgroundColor: '#2563eb' },
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default TicketManagement;