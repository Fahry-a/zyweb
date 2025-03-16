import api from './api';

export const storageApi = {
  getQuota: () => api.get('/storage/quota'),
  getFiles: () => api.get('/storage/files'),
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percentCompleted);
      }
    });
  },
  deleteFile: (fileId) => api.delete(`/storage/files/${fileId}`),
  downloadFile: (fileId) => api.get(`/storage/files/${fileId}/download`)
};