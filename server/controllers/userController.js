const bcrypt = require('bcryptjs');
const db = require('../config/database');

const userController = {
  getProfile: async (req, res, next) => {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user: users[0] });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      // Check if email is taken
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }

      await db.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId]
      );

      const [updatedUser] = await db.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );

      res.json({ 
        message: 'Profile updated successfully',
        user: updatedUser[0]
      });
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get current password
      const [users] = await db.execute(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword, 
        users[0].password
      );

      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;