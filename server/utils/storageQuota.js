const db = require('../config/database');

// Default quota sizes in bytes
const DEFAULT_QUOTAS = {
    user: 5 * 1024 * 1024 * 1024,     // 5GB for regular users
    premium: 15 * 1024 * 1024 * 1024,  // 15GB for premium users
    admin: 20 * 1024 * 1024 * 1024     // 20GB for admin users
};

const createStorageQuota = async (userId, userRole) => {
    try {
        // Check if quota already exists
        const [existing] = await db.execute(
            'SELECT id FROM storage_quotas WHERE user_id = ?',
            [userId]
        );

        if (existing.length === 0) {
            // Get default quota based on user role
            const defaultQuota = DEFAULT_QUOTAS[userRole] || DEFAULT_QUOTAS.user;

            // Create new quota entry
            await db.execute(
                'INSERT INTO storage_quotas (user_id, total_quota, used_quota) VALUES (?, ?, 0)',
                [userId, defaultQuota]
            );

            console.log(`Created storage quota for user ${userId} with total_quota ${defaultQuota}`);
        }
    } catch (error) {
        console.error('Error creating storage quota:', error);
        throw new Error('Failed to create storage quota');
    }
};

module.exports = { createStorageQuota };