const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

const storageController = {
    // Get storage quota
    getQuota: async (req, res) => {
        try {
            const [rows] = await db.execute(
                'SELECT total_quota as total, used_quota as used FROM storage_quotas WHERE user_id = ?',
                [req.user.id]
            );

            if (rows.length === 0) {
                // Default quota based on user role
                const defaultQuota = req.user.role === 'premium' ? 15 * 1024 * 1024 * 1024 : 5 * 1024 * 1024 * 1024;
                
                await db.execute(
                    'INSERT INTO storage_quotas (user_id, total_quota, used_quota) VALUES (?, ?, 0)',
                    [req.user.id, defaultQuota]
                );

                return res.json({
                    total: defaultQuota,
                    used: 0
                });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Get quota error:', error);
            res.status(500).json({ message: 'Failed to get storage quota' });
        }
    },

    // Get list of files
    getFiles: async (req, res) => {
        try {
            const [files] = await db.execute(
                'SELECT id, original_name as name, mime_type as type, size, created_at FROM stored_files WHERE user_id = ? ORDER BY created_at DESC',
                [req.user.id]
            );
            res.json(files);
        } catch (error) {
            console.error('Get files error:', error);
            res.status(500).json({ message: 'Failed to get files' });
        }
    },

    // Upload file
    uploadFile: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const fileBuffer = req.file.buffer;
            
            // Check storage quota
            const [quota] = await db.execute(
                'SELECT total_quota, used_quota FROM storage_quotas WHERE user_id = ?',
                [req.user.id]
            );

            if (quota[0].used_quota + req.file.size > quota[0].total_quota) {
                return res.status(400).json({ message: 'Storage quota exceeded' });
            }

            // Generate unique filename
            const filename = `${Date.now()}-${req.file.originalname}`;
            const uploadDir = path.join(__dirname, '../uploads');
            
            // Ensure upload directory exists
            await fs.mkdir(uploadDir, { recursive: true });
            
            // Save file
            await fs.writeFile(path.join(uploadDir, filename), fileBuffer);

            // Save to database
            const [result] = await db.execute(
                'INSERT INTO stored_files (user_id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?)',
                [
                    req.user.id,
                    filename,
                    req.file.originalname,
                    req.file.mimetype,
                    req.file.size
                ]
            );

            // Update used quota
            await db.execute(
                'UPDATE storage_quotas SET used_quota = used_quota + ? WHERE user_id = ?',
                [req.file.size, req.user.id]
            );

            res.json({
                id: result.insertId,
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ message: 'Failed to upload file' });
        }
    },

    // Download file
    downloadFile: async (req, res) => {
        try {
            const [file] = await db.execute(
                'SELECT * FROM stored_files WHERE id = ? AND user_id = ?',
                [req.params.id, req.user.id]
            );

            if (!file.length) {
                return res.status(404).json({ message: 'File not found' });
            }

            const fileData = file[0];
            const filePath = path.join(__dirname, '../uploads', fileData.filename);
            
            res.setHeader('Content-Type', fileData.mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${fileData.original_name}"`);
            
            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ message: 'Failed to download file' });
        }
    },

    // Delete file
    deleteFile: async (req, res) => {
        try {
            const [file] = await db.execute(
                'SELECT * FROM stored_files WHERE id = ? AND user_id = ?',
                [req.params.id, req.user.id]
            );

            if (!file.length) {
                return res.status(404).json({ message: 'File not found' });
            }

            // Delete file from storage
            const filePath = path.join(__dirname, '../uploads', file[0].filename);
            await fs.unlink(filePath);

            // Delete from database
            await db.execute('DELETE FROM stored_files WHERE id = ?', [req.params.id]);

            // Update used quota
            await db.execute(
                'UPDATE storage_quotas SET used_quota = used_quota - ? WHERE user_id = ?',
                [file[0].size, req.user.id]
            );

            res.json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ message: 'Failed to delete file' });
        }
    }
};

module.exports = storageController;