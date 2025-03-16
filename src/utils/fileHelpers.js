import {
    Description,
    Image,
    PictureAsPdf,
    VideoLibrary,
    Code,
    Archive,
    InsertDriveFile
} from '@mui/icons-material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image />;
    if (mimeType === 'application/pdf') return <PictureAsPdf />;
    if (mimeType.startsWith('audio/')) return <AudiotrackIcon />;
    if (mimeType.startsWith('video/')) return <VideoLibrary />;
    if (mimeType.startsWith('text/')) return <Description />;
    if (mimeType.includes('compressed') || mimeType.includes('zip')) return <Archive />;
    if (mimeType.includes('javascript') || mimeType.includes('code')) return <Code />;
    return <InsertDriveFile />;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};