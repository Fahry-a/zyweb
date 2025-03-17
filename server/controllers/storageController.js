const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { promisify } = require('util');

const storageController = {
    // Get user's storage info
    async getStorageInfo(req, res) {
        try {
            const userId = req.user.id;
            const [quota] = await db.query(
                'SELECT total_quota, used_quota FROM storage_quotas WHERE user_id = ?',
                [userId]
            );

            if (!quota.length) {
                return res.status(404).json({ 
                    message: 'Storage quota not found' 
                });
            }

            res.json({
                totalQuota: quota[0].total_quota,
                usedQuota: quota[0].used_quota,
                remainingQuota: quota[0].total_quota - quota[0].used_quota
            });
        } catch (error) {
            console.error('Error getting storage info:', error);
            res.status(500).json({ 
                message: 'Internal server error' 
            });
        }
    },

    // Get user's files
    async getFiles(req, res) {
        try {
            const userId = req.user.id;
            const [files] = await db.query(
                `SELECT id, filename, original_name, mime_type, size, created_at 
                 FROM stored_files 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC`,
                [userId]
            );

            res.json(files);
        } catch (error) {
            console.error('Error getting files:', error);
            res.status(500).json({ 
                message: 'Internal server error' 
            });
        }
    },

    // Upload file
    async uploadFile(req, res) {
        try {
            const userId = req.user.id;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ 
                    message: 'No file uploaded' 
                });
            }

            // Check user's quota
            const [quota] = await db.query(
                'SELECT total_quota, used_quota FROM storage_quotas WHERE user_id = ?',
                [userId]
            );

            if (!quota.length || (quota[0].used_quota + file.size) > quota[0].total_quota) {
                return res.status(400).json({ 
                    message: 'Storage quota exceeded' 
                });
            }

            // Read file data
            const fileData = await promisify(fs.readFile)(file.path);

            // Store file in database
            const [result] = await db.query(
                `INSERT INTO stored_files 
                 (user_id, filename, original_name, mime_type, size, file_data) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, file.filename, file.originalname, file.mimetype, file.size, fileData]
            );

            // Update used quota
            await db.query(
                `UPDATE storage_quotas 
                 SET used_quota = used_quota + ? 
                 WHERE user_id = ?`,
                [file.size, userId]
            );

            // Delete temporary file
            await promisify(fs.unlink)(file.path);

            res.status(201).json({
                id: result.insertId,
                filename: file.filename,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ 
                message: 'Internal server error' 
            });
        }
    },

    // Download file
    async downloadFile(req, res) {
        try {
            const userId = req.user.id;
            const fileId = req.params.id;

            const [file] = await db.query(
                `SELECT filename, original_name, mime_type, file_data 
                 FROM stored_files 
                 WHERE id = ? AND user_id = ?`,
                [fileId, userId]
            );

            if (!file.length) {
                return res.status(404).json({ 
                    message: 'File not found' 
                });
            }

            res.setHeader('Content-Type', file[0].mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${file[0].original_name}"`);
            res.send(file[0].file_data);
        } catch (error) {
            console.error('Error downloading file:', error);
            res.status(500).json({ 
                message: 'Internal server error' 
            });
        }
    },

    // Delete file
    async deleteFile(req, res) {
        try {
            const userId = req.user.id;
            const fileId = req.params.id;

            // Get file size first for quota update
            const [file] = await db.query(
                'SELECT size FROM stored_files WHERE id = ? AND user_id = ?',
                [fileId, userId]
            );

            if (!file.length) {
                return res.status(404).json({ 
                    message: 'File not found' 
                });
            }

            // Delete file
            await db.query(
                'DELETE FROM stored_files WHERE id = ? AND user_id = ?',
                [fileId, userId]
            );

            // Update used quota
            await db.query(
                `UPDATE storage_quotas 
                 SET used_quota = used_quota - ? 
                 WHERE user_id = ?`,
                [file[0].size, userId]
            );

            res.json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({ 
                message: 'Internal server error' 
            });
        }
    }
};

module.exports = storageController;