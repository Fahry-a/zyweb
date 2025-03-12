const db = require('../config/database');

const ActivityLog = {
  create: async (userId, action, details) => {
    const [result] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, JSON.stringify(details)]
    );
    return result.insertId;
  },

  getAll: async (limit = 100) => {
    const [logs] = await db.execute(`
      SELECT al.*, u.name as user_name 
      FROM activity_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC 
      LIMIT ?
    `, [limit]);
    return logs;
  },

  getByUserId: async (userId, limit = 50) => {
    const [logs] = await db.execute(
      'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return logs;
  }
};

module.exports = ActivityLog;