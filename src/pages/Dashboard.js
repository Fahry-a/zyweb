import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
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
  Storage as StorageIcon,
  Chat as ChatIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storageApi } from '../services/storage';
import { chatApi } from '../services/chat';
import api from '../services/api';

const StorageTab = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [quota, setQuota] = useState({ used: 0, total: 0 });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fungsi untuk mendapatkan total storage berdasarkan role
  const getTotalStorageByRole = (role) => {
    switch (role) {
      case 'premium':
        return 15 * 1024 * 1024 * 1024; // 15GB dalam bytes
      case 'admin':
      case 'user':
      default:
        return 5 * 1024 * 1024 * 1024; // 5GB dalam bytes
    }
  };

  const loadStorageData = useCallback(async () => {
    try {
      const [quotaData, filesData] = await Promise.all([
        storageApi.getQuota(),
        storageApi.getFiles()
      ]);
      
      // Set quota dengan total storage berdasarkan role
      const totalStorage = getTotalStorageByRole(user?.role);
      setQuota({
        used: quotaData.data.used || 0,
        total: totalStorage
      });
      setFiles(filesData.data);
    } catch (error) {
      console.error('Failed to load storage data:', error);
      // Set default quota jika terjadi error
      const totalStorage = getTotalStorageByRole(user?.role);
      setQuota({
        used: 0,
        total: totalStorage
      });
    }
  }, [user?.role]); // Tambahkan user?.role sebagai dependency

  useEffect(() => {
    loadStorageData();
  }, [loadStorageData]); // Gunakan loadStorageData sebagai dependency

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if upload would exceed storage limit
    if (quota.used + file.size > quota.total) {
      alert('Not enough storage space. Please free up some space or upgrade to premium.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      await storageApi.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      loadStorageData(); // Reload storage data after successful upload
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Tambahkan fungsi handleFileDelete yang sebelumnya tidak ada
  const handleFileDelete = async (fileId) => {
    try {
      await storageApi.deleteFile(fileId);
      loadStorageData(); // Reload data setelah file dihapus
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Format bytes to human readable size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Storage Usage ({user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Account)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(quota.used / quota.total) * 100}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: (quota.used / quota.total) > 0.9 ? 'error.main' : 'primary.main'
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {formatSize(quota.used)} of {formatSize(quota.total)} used ({Math.round((quota.used / quota.total) * 100)}%)
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading || quota.used >= quota.total}
                >
                  Upload File
                </Button>
              </label>
              {quota.used >= quota.total && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  Storage full! {user?.role !== 'premium' && 'Consider upgrading to Premium for more storage.'}
                </Typography>
              )}
            </Box>

            {uploading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary">
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

            <List>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => storageApi.downloadFile(file.id)}>
                        <DownloadIcon />
                      </IconButton>
                      <IconButton onClick={() => handleFileDelete(file.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    {file.type.startsWith('image/') ? <FileIcon /> : <FolderIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatSize(file.size)} • ${new Date(file.createdAt).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Chat Tab Component
const ChatTab = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await chatApi.getChats();
      setChats(response.data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await chatApi.getMessages(chatId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await chatApi.sendMessage(selectedChat.id, newMessage);
      setNewMessage('');
      loadMessages(selectedChat.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={4}>
        <Paper sx={{ height: '70vh', overflow: 'auto' }}>
          <List>
            {chats.map((chat) => (
              <ListItem
                key={chat.id}
                button
                selected={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary={chat.name || 'Chat'}
                  secondary={`${chat.participants.length} participants`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={8}>
        {selectedChat ? (
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{selectedChat.name || 'Chat'}</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.isMine ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      bgcolor: message.isMine ? 'primary.main' : 'background.paper',
                      color: message.isMine ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </Grid>
                <Grid item>
                  <IconButton onClick={handleSendMessage} color="primary">
                    <SendIcon />
                  </IconButton>
                  <IconButton component="label">
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          chatApi.sendFile(selectedChat.id, e.target.files[0]);
                        }
                      }}
                    />
                    <AttachFileIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">Select a chat to start messaging</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

// Overview Tab Component
const OverviewTab = ({ user, onChangePassword, onDeleteAccount }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card elevation={3}>
          <CardContent>
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

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<KeyIcon />}
                onClick={onChangePassword}
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
                onClick={onDeleteAccount}
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
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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
      await api.post('/users/change-password', {
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
      await api.post('/users/delete-account', { password: deletePassword });
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

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ bgcolor: 'primary.dark' }}
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<StorageIcon />} label="Storage" />
          <Tab icon={<ChatIcon />} label="Messages" />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {tabValue === 0 && (
          <OverviewTab 
            user={user}
            onChangePassword={handleOpenPasswordDialog}
            onDeleteAccount={handleOpenDeleteDialog}
          />
        )}
        {tabValue === 1 && <StorageTab />}
        {tabValue === 2 && <ChatTab />}

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