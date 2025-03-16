import api from './api';
import axios from 'axios';

export const storageApi = {
    // Get storage quota
    getQuota: () => {
        return api.get('/storage/quota', {
            headers: {
                'Cache-Control': 'max-age=300' // Enable browser caching
            }
        });
    },

    // Get files with pagination and sorting
    getFiles: (page = 1, limit = 20, sort = 'created_at', order = 'desc') => {
        return api.get('/storage/files', {
            params: { page, limit, sort, order }
        });
    },

    // Enhanced upload with progress, cancel, and retry
    uploadFile: (file, onProgress, onCancel) => {
        // Create cancel token
        const cancelSource = axios.CancelToken.source();
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Chunk size for large files (5MB)
        const CHUNK_SIZE = 5 * 1024 * 1024;
        
        if (file.size > CHUNK_SIZE) {
            return uploadLargeFile(file, CHUNK_SIZE, onProgress, cancelSource);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress?.(percentCompleted);
            },
            cancelToken: cancelSource.token
        };

        // Register cancel handler
        onCancel?.(() => cancelSource.cancel('Upload cancelled by user'));

        return api.post('/storage/upload', formData, config);
    },

    // Download with progress
    downloadFile: (fileId, onProgress) => {
        return api.get(`/storage/files/${fileId}/download`, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress?.(percentCompleted);
            }
        });
    },

    // Delete file
    deleteFile: (fileId) => api.delete(`/storage/files/${fileId}`),

    // Get file metadata
    getFileMetadata: (fileId) => api.get(`/storage/files/${fileId}/metadata`)
};

// Helper function for uploading large files in chunks
async function uploadLargeFile(file, chunkSize, onProgress, cancelSource) {
    const chunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;
    
    for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', i);
        formData.append('totalChunks', chunks);
        
        await api.post('/storage/upload/chunk', formData, {
            cancelToken: cancelSource.token,
            onUploadProgress: (progressEvent) => {
                const chunkProgress = (progressEvent.loaded / progressEvent.total) * 100;
                const totalProgress = ((uploadedChunks + (chunkProgress / 100)) / chunks) * 100;
                onProgress?.(Math.round(totalProgress));
            }
        });
        
        uploadedChunks++;
    }
    
    // Complete upload
    return api.post('/storage/upload/complete', {
        filename: file.name,
        totalChunks: chunks
    });
}