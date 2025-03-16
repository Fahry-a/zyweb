import api from './api';

export const chatApi = {
  getChats: () => api.get('/chat/chats'),
  createChat: (data) => api.post('/chat/chats', data),
  getChatById: (chatId) => api.get(`/chat/chats/${chatId}`),
  sendMessage: (chatId, message) => 
    api.post(`/chat/chats/${chatId}/messages`, { content: message }),
  getMessages: (chatId) => api.get(`/chat/chats/${chatId}/messages`),
  sendFile: (chatId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/chat/chats/${chatId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};