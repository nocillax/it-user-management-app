-- IT User Management System Database Schema
-- This schema creates the users table with proper constraints and indexes

-- Create enum type for user status
-- Important: This enum defines the three possible user states
CREATE TYPE user_status AS ENUM ('unverified', 'active', 'blocked');

-- Create users table
-- Nota bene: This table is the core of our user management system
CREATE TABLE users (
    -- Primary key using UUID for better security and distribution
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User information fields
    name VARCHAR(255) NOT NULL,
    
    -- Email with unique constraint - this is enforced at DB level as required
    -- Important: Unique index ensures no duplicate emails without code checks
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Password hash - never store plain passwords
    password_hash VARCHAR(255) NOT NULL,
    
    -- User status using our custom enum
    -- Default is 'unverified' for new registrations
    status user_status DEFAULT 'unverified' NOT NULL,
    
    -- Timestamp fields for tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Additional constraint to ensure email format (basic validation)
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
-- Important: Index on email for fast lookups during login
CREATE INDEX idx_users_email ON users(email);

-- Index on status for filtering users by status
CREATE INDEX idx_users_status ON users(status);

-- Index on last_login for sorting (most common sort operation)
-- Note: This supports DESC order for showing most recent logins first
CREATE INDEX idx_users_last_login ON users(last_login DESC NULLS LAST);

-- Index on created_at for general sorting purposes
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create a function to update last_login timestamp
-- Nota bene: This function will be called whenever a user successfully logs in
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Important: Update last_login timestamp for the specified user
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert a sample admin user for testing (optional)
-- Note: This is just for development - remove in production
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (name, email, password_hash, status, last_login) 
VALUES (
    'Administrator',
    'admin@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'active',
    CURRENT_TIMESTAMP
);

-- Show table structure for verification
\d+ users;