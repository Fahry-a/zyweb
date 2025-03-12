const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if email already exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert new user
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role, suspended) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, 'user', 0]
      );

      // Create token
      const token = jwt.sign(
        { 
          userId: result.insertId, 
          email,
          role: 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: result.insertId,
          name,
          email,
          role: 'user'
        }
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required',
          fields: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null
          }
        });
      }

      // Get user
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = users[0];

      // Check if user is suspended
      if (user.suspended) {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }

      // Verify password with constant-time comparison
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create token with all necessary user data
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      // Update last login timestamp
      await db.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Remove sensitive data before sending response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is suspended
      if (users[0].suspended) {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
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
  },

  deleteAccount: async (req, res, next) => {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      // Get user with password
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user is suspended
      if (users[0].suspended) {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, users[0].password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Password is incorrect' });
      }

      // Delete user's data
      await db.execute('DELETE FROM users WHERE id = ?', [userId]);

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, created_at, last_login FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (users[0].suspended) {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }

      res.json({ user: users[0] });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { userId } = req.user;

      const [users] = await db.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];

      if (user.suspended) {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }

      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.json({
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;