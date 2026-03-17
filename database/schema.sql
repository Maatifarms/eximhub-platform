-- EximHub Core Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS eximhub_db;
USE eximhub_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    google_id VARCHAR(255),
    country VARCHAR(100),
    company_name VARCHAR(255),
    subscription_tier ENUM('trial', 'Program 1', 'Program 2', 'Enterprise', 'Admin') DEFAULT 'trial',
    points_balance INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    company_size VARCHAR(50),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    product_keywords TEXT, -- comma separated tags
    company_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_industry ON companies(industry);
CREATE INDEX idx_company_country ON companies(country);
CREATE INDEX idx_company_name ON companies(company_name);

-- 3. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    title VARCHAR(255),
    department VARCHAR(100),
    linkedin VARCHAR(255),
    email VARCHAR(255),
    phone TEXT,
    mobile TEXT,
    industry VARCHAR(100),
    country VARCHAR(100),
    is_procurement TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_contact_company_id ON contacts(company_id);
CREATE INDEX idx_contact_is_procurement ON contacts(is_procurement);
CREATE INDEX idx_contact_industry ON contacts(industry);
CREATE INDEX idx_contact_country ON contacts(country);

-- 4. Reveals Table
CREATE TABLE IF NOT EXISTS reveals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    contact_id INT,
    points_used INT DEFAULT 1,
    revealed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tier VARCHAR(100),
    price INT,
    points_granted INT
);

-- 6. Books Table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INT DEFAULT 500,
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    payment_id VARCHAR(255),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 8. Search Logs Table
CREATE TABLE IF NOT EXISTS search_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    keyword VARCHAR(255),
    country_filter VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. Trending Index (Aggregation Helper)
CREATE TABLE IF NOT EXISTS search_trends (
    keyword VARCHAR(100) PRIMARY KEY,
    count INT DEFAULT 1,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 10. Security Logs
CREATE TABLE IF NOT EXISTS security_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100),
    details TEXT,
    severity ENUM('low', 'medium', 'high') DEFAULT 'low',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ROLE DETECTION TRIGGER
DELIMITER //
CREATE TRIGGER before_contact_insert
BEFORE INSERT ON contacts
FOR EACH ROW
BEGIN
    IF NEW.title REGEXP 'procurement|purchasing|sourcing|supply chain|vendor|category manager|strategic sourcing' THEN
        SET NEW.is_procurement = 1;
    END IF;
END;
//
DELIMITER ;
