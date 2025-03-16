const db = require('../config/database');

async function createStorageQuotasTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS storage_quotas (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                total_quota BIGINT NOT NULL,
                used_quota BIGINT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_quota (user_id)
            )
        `);
        
        console.log('Storage quotas table created or already exists');
    } catch (error) {
        console.error('Error creating storage quotas table:', error);
        throw error;
    }
}

// Script untuk menjalankan migrasi
if (require.main === module) {
    createStorageQuotasTable()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = createStorageQuotasTable;