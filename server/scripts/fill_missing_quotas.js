const db = require('../config/database');
const { createStorageQuota } = require('../utils/storageQuota');

async function fillMissingQuotas() {
    try {
        // Get all users who don't have storage quotas
        const [users] = await db.execute(`
            SELECT u.id, u.role 
            FROM users u 
            LEFT JOIN storage_quotas sq ON u.id = sq.user_id 
            WHERE sq.id IS NULL
        `);

        console.log(`Found ${users.length} users without storage quotas`);

        // Create storage quotas for each user
        for (const user of users) {
            await createStorageQuota(user.id, user.role);
            console.log(`Created storage quota for user ${user.id}`);
        }

        console.log('Completed filling missing storage quotas');
    } catch (error) {
        console.error('Error filling missing quotas:', error);
        throw error;
    }
}

// Run script
if (require.main === module) {
    fillMissingQuotas()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = fillMissingQuotas;