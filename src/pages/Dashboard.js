import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Grid,
  Chip,
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  VpnKey as KeyIcon,
  DeleteForever as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  StarBorder as PremiumIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { changePassword, deleteAccount } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const utcYear = now.getUTCFullYear();
      const utcMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
      const utcDay = String(now.getUTCDate()).padStart(2, '0');
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
      
      const formattedDateTime = `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;
      setCurrentDateTime(formattedDateTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
    setError('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully');
      setOpenPasswordDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    setError('');
    setDeletePassword('');
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(deletePassword);
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            User Dashboard
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 3, 
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 12px',
            borderRadius: 1
          }}>
            <ClockIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Current Date and Time (UTC): {currentDateTime}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 3,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 12px',
            borderRadius: 1
          }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Current User's Login: {user?.name}
            </Typography>
          </Box>

          <IconButton color="inherit" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    System Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Current Date and Time (UTC)
                        </Typography>
                        <Typography variant="body1">
                          {currentDateTime}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Current User's Login
                        </Typography>
                        <Typography variant="body1">
                          {user?.name}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: user?.role === 'admin' ? 'warning.main' : 
                              user?.role === 'premium' ? 'success.main' : 'primary.main',
                      mr: 2,
                    }}
                  >
                    {user?.role === 'admin' ? <AdminIcon sx={{ fontSize: 40 }} /> :
                     user?.role === 'premium' ? <PremiumIcon sx={{ fontSize: 40 }} /> :
                     <PersonIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      Welcome, {user?.name}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user?.email}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        icon={user?.role === 'admin' ? <AdminIcon /> : 
                              user?.role === 'premium' ? <PremiumIcon /> : 
                              <PersonIcon />}
                        label={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                        color={user?.role === 'admin' ? 'warning' : 
                               user?.role === 'premium' ? 'success' : 
                               'primary'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<KeyIcon />}
                    onClick={handleOpenPasswordDialog}
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    Change Password
                  </Button>

                  {user?.role === 'admin' && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<AdminIcon />}
                      onClick={() => navigate('/admin')}
                      sx={{
                        bgcolor: 'warning.main',
                        '&:hover': { bgcolor: 'warning.dark' },
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenDeleteDialog}
                    sx={{
                      borderColor: 'error.main',
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'white',
                      },
                    }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Password Change Dialog */}
        <Dialog
          open={openPasswordDialog}
          onClose={() => setOpenPasswordDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
          }}
        >
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmNewPassword"
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmNewPassword: e.target.value,
                  })
                }
                variant="outlined"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitPasswordChange}
              variant="contained"
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
          }}
        >
          <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.secondary' }}>
              Are you sure you want to delete your account? This action cannot be undone.
              Please enter your password to confirm.
            </DialogContentText>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSuccess('')}
            severity="success"
            sx={{ width: '100%' }}
          >
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Dashboard;