CREATE DATABASE IF NOT EXISTS zyroxiweb_db;
USE zyroxiweb_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'premium') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create initial admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@admin.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj a5i0ZyZFi', 'admin')
ON DUPLICATE KEY UPDATE id=id;