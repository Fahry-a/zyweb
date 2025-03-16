import React from 'react';

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Chat as ChatIcon,
  CloudUpload as CloudUploadIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const Landing = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: 'primary.dark', 
        color: 'white',
        py: 8
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom>
            Your Complete Cloud Solution
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Store, share, and communicate - all in one place
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ 
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Grid container spacing={4}>
          {/* Cloud Storage */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <StorageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Cloud Storage
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="5GB Free Storage" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="20GB Premium Storage" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="All File Types Supported" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Media Storage */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Media Storage
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Photo Storage" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Video Storage" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="All Formats Supported" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Messaging */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <ChatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Messaging
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Private Messaging" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Group Chats" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="File Sharing" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;