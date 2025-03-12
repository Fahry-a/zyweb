import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (userData, token) => {
    try {
      const userWithRole = {
        ...userData,
        role: userData.role || 'user' // Default to 'user' if no role specified
      };

      // Set the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('token', token);
      
      // Update state
      setUser(userWithRole);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      // Clear auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Clear state
      setUser(null);

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const updateUser = (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  const checkAuth = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const checkAdmin = () => {
    return user?.role === 'admin';
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        updateUser, 
        checkAuth, 
        checkAdmin, 
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};