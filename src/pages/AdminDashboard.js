import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Star as PremiumIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersByRole: []
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    suspended: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/dashboard')
      ]);
      setUsers(usersResponse.data.users);
      setStats(statsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data.logs);
    } catch (err) {
      setError('Failed to fetch logs');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tabValue === 2) {
      fetchLogs();
    }
  }, [tabValue]);

  const handleAddUser = async () => {
    try {
      if (!addForm.name || !addForm.email || !addForm.password) {
        setError('All fields are required');
        return;
      }
      await api.post('/admin/users', addForm);
      setSuccess('User added successfully');
      setOpenAddDialog(false);
      setAddForm({ name: '', email: '', password: '', role: 'user' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      suspended: user.suspended
    });
    setOpenEditDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!editForm.name || !editForm.email) {
        setError('Name and email are required');
        return;
      }
      await api.put(`/admin/users/${selectedUser.id}`, editForm);
      setSuccess('User updated successfully');
      setOpenEditDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setSuccess('User deleted successfully');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const UserTable = ({ users, onEdit, onDelete }) => (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  icon={
                    user.role === 'admin' ? <AdminIcon /> :
                    user.role === 'premium' ? <PremiumIcon /> :
                    <PersonIcon />
                  }
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  color={
                    user.role === 'admin' ? 'error' :
                    user.role === 'premium' ? 'warning' :
                    'primary'
                  }
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.suspended ? 'Suspended' : 'Active'}
                  color={user.suspended ? 'error' : 'success'}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onEdit(user)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(user.id)}
                  color="error"
                  disabled={user.role === 'admin'}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography>Loading...</Typography>
        </Box>
      );
    }

    switch (tabValue) {
      case 0: // Dashboard
        return (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h3">
                    {stats.totalUsers}
                  </Typography>
                </Paper>
              </Grid>
              {stats.usersByRole.map((roleStats) => (
                <Grid item xs={12} md={4} key={roleStats.role}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {roleStats.role.charAt(0).toUpperCase() + roleStats.role.slice(1)}s
                    </Typography>
                    <Typography variant="h3">
                      {roleStats.count}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setOpenAddDialog(true)}
                >
                  Add New User
                </Button>
              </Box>
              <UserTable
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </Paper>
          </>
        );

      case 1: // User Management
        return (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                User Management
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setOpenAddDialog(true)}
                sx={{ mb: 2 }}
              >
                Add New User
              </Button>
            </Box>
            <UserTable
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          </Paper>
        );

      case 2: // Logs
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Logs
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.userEmail}</TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <AdminIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ bgcolor: 'primary.dark' }}
        >
          <Tab label="Dashboard" />
          <Tab label="User Management" />
          <Tab label="Logs" />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Snackbar
            open={Boolean(success)}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
          >
            <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          </Snackbar>
        )}
        {renderContent()}
      </Container>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.suspended ? 'suspended' : 'active'}
                onChange={(e) => setEditForm({ ...editForm, suspended: e.target.value === 'suspended' })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;