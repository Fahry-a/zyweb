import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Container, Typography, Button, IconButton,
    Grid, Paper, LinearProgress, Alert, Snackbar,
    List, ListItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Menu, MenuItem, AudiotrackIcon 
} from '@mui/material';
import {
    CloudUpload, Delete, Download, Description,
    MoreVert, PictureAsPdf, Image, InsertDriveFile
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { storageApi } from '../services/storage';
import { formatFileSize, getFileIcon } from '../utils/fileHelpers';
import { debounce } from 'lodash';

const CloudStorage = () => {
    const [files, setFiles] = useState([]);
    const [storage, setStorage] = useState({ used: 0, total: 0 });
    const [uploads, setUploads] = useState(new Map());
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [sortOrder, setSortOrder] = useState({ field: 'created_at', direction: 'desc' });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Load storage data with debounce
    const loadStorageData = useCallback(
        debounce(async () => {
            try {
                setLoading(true);
                const [quotaResponse, filesResponse] = await Promise.all([
                    storageApi.getQuota(),
                    storageApi.getFiles(page, 20, sortOrder.field, sortOrder.direction)
                ]);
                
                setStorage(quotaResponse.data);
                setFiles(prev => [...prev, ...filesResponse.data]);
            } catch (err) {
                setError('Failed to load storage data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300),
        [page, sortOrder]
    );

    useEffect(() => {
        loadStorageData();
    }, [loadStorageData]);

    // File upload with drag & drop
    const onDrop = useCallback(async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            if (storage.used + file.size > storage.total) {
                setError('Storage quota exceeded');
                continue;
            }

            const uploadId = Date.now().toString();
            setUploads(prev => new Map(prev).set(uploadId, { 
                file,
                progress: 0,
                status: 'uploading'
            }));

            try {
                let cancelUpload;
                await storageApi.uploadFile(
                    file,
                    (progress) => {
                        setUploads(prev => new Map(prev).set(uploadId, { 
                            file,
                            progress,
                            status: 'uploading'
                        }));
                    },
                    (cancel) => { cancelUpload = cancel }
                );

                setUploads(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(uploadId);
                    return newMap;
                });
                
                setSuccess('File uploaded successfully');
                loadStorageData();
            } catch (err) {
                setUploads(prev => new Map(prev).set(uploadId, { 
                    file,
                    progress: 0,
                    status: 'error',
                    error: err.message
                }));
                console.error('Upload error:', err);
            }
        }
    }, [storage, loadStorageData]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    // File operations
    const handleDownload = async (file) => {
        try {
            const response = await storageApi.downloadFile(
                file.id,
                (progress) => {
                    // Update download progress if needed
                }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download file');
            console.error(err);
        }
    };

    const handleDelete = async (file) => {
        try {
            await storageApi.deleteFile(file.id);
            setSuccess('File deleted successfully');
            loadStorageData();
        } catch (err) {
            setError('Failed to delete file');
            console.error(err);
        }
    };

    // Render functions
    const renderStorageInfo = () => (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Storage Usage
            </Typography>
            <LinearProgress 
                variant="determinate"
                value={(storage.used / storage.total) * 100}
                sx={{ 
                    height: 10,
                    borderRadius: 5,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                        bgcolor: (storage.used / storage.total) > 0.9 ? 'error.main' : 'primary.main'
                    }
                }}
            />
            <Typography variant="body2" color="text.secondary">
                {formatFileSize(storage.used)} of {formatFileSize(storage.total)} used
                ({Math.round((storage.used / storage.total) * 100)}%)
            </Typography>
        </Paper>
    );

    const renderUploadArea = () => (
        <Paper
            {...getRootProps()}
            sx={{
                p: 3,
                mb: 3,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            <input {...getInputProps()} />
            <Box sx={{ textAlign: 'center' }}>
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {isDragActive ? 
                        'Drop files here...' : 
                        'Drag & drop files here, or click to select files'
                    }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Maximum file size: {formatFileSize(storage.total - storage.used)}
                </Typography>
            </Box>
        </Paper>
    );

    const renderUploads = () => (
        uploads.size > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Active Uploads
                </Typography>
                <List>
                    {Array.from(uploads.entries()).map(([id, upload]) => (
                        <ListItem key={id}>
                            <ListItemIcon>
                                {getFileIcon(upload.file.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={upload.file.name}
                                secondary={
                                    upload.status === 'error' ? 
                                    upload.error :
                                    `${upload.progress.toFixed(1)}% - ${formatFileSize(upload.file.size)}`
                                }
                            />
                            {upload.status === 'uploading' && (
                                <LinearProgress 
                                    variant="determinate"
                                    value={upload.progress}
                                    sx={{ width: 100, ml: 2 }}
                                />
                            )}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        )
    );

    const renderFileList = () => (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                    My Files
                </Typography>
                <Button
                    size="small"
                    onClick={() => setSortOrder(prev => ({
                        ...prev,
                        direction: prev.direction === 'asc' ? 'desc' : 'asc'
                    }))}
                >
                    Sort by {sortOrder.field} ({sortOrder.direction})
                </Button>
            </Box>
            
            <List>
                {files.map(file => (
                    <ListItem
                        key={file.id}
                        sx={{
                            '&:hover': {
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <ListItemIcon>
                            {getFileIcon(file.type)}
                        </ListItemIcon>
                        <ListItemText
                            primary={file.name}
                            secondary={`${formatFileSize(file.size)} - ${new Date(file.created_at).toLocaleString()}`}
                        />
                        <IconButton onClick={(e) => {
                            setSelectedFile(file);
                            setContextMenu(e.currentTarget);
                        }}>
                            <MoreVert />
                        </IconButton>
                    </ListItem>
                ))}
                
                {loading && (
                    <ListItem>
                        <LinearProgress sx={{ width: '100%' }} />
                    </ListItem>
                )}
            </List>

            {files.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                        No files uploaded yet
                    </Typography>
                </Box>
            )}

            {/* Infinite scroll trigger */}
            {!loading && files.length >= page * 20 && (
                <Button
                    fullWidth
                    onClick={() => setPage(p => p + 1)}
                    sx={{ mt: 2 }}
                >
                    Load More
                </Button>
            )}
        </Paper>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Cloud Storage
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    {renderStorageInfo()}
                    {renderUploadArea()}
                    {renderUploads()}
                    {renderFileList()}
                </Grid>
            </Grid>

            {/* Context Menu */}
            <Menu
                anchorEl={contextMenu}
                open={Boolean(contextMenu)}
                onClose={() => setContextMenu(null)}
            >
                <MenuItem onClick={() => {
                    handleDownload(selectedFile);
                    setContextMenu(null);
                }}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    Download
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        handleDelete(selectedFile);
                        setContextMenu(null);
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <Delete fontSize="small" color="error" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>

            {/* Notifications */}
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError('')}
            >
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={Boolean(success)}
                autoHideDuration={3000}
                onClose={() => setSuccess('')}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CloudStorage;