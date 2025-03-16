import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function Chat() {
  const [message, setMessage] = useState('');
  
  // You'll need to implement these functions based on your backend
  const handleSendMessage = (e) => {
    e.preventDefault();
    // Handle sending message logic
    setMessage('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat
      </Typography>

      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          <List>
            {/* Sample messages - you'll need to map through your actual messages */}
            <ListItem>
              <Avatar sx={{ mr: 2 }}>U</Avatar>
              <ListItemText
                primary="User Name"
                secondary="This is a sample message"
                secondaryTypographyProps={{ 
                  sx: { 
                    backgroundColor: 'primary.main',
                    p: 1,
                    borderRadius: 2,
                    display: 'inline-block'
                  }
                }}
              />
            </ListItem>
          </List>
        </Box>

        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Chat;