-- IT User Management System Database Schema

-- Create enum type for user status
CREATE TYPE user_status AS ENUM ('unverified', 'active', 'blocked');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    
    -- Important: Unique constraint enforces email uniqueness at DB level
    email VARCHAR(255) UNIQUE NOT NULL,
    
    password_hash VARCHAR(255) NOT NULL,
    status user_status DEFAULT 'unverified' NOT NULL,
    previous_status user_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Email format validation constraint
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
-- Important: Index on email for fast lookups during login
CREATE INDEX idx_users_email ON users(email);

-- Index on status for filtering users by status
CREATE INDEX idx_users_status ON users(status);

-- Index for sorting by last login (most recent first)
CREATE INDEX idx_users_last_login ON users(last_login DESC NULLS LAST);

-- Index for sorting by creation date
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Function to update last_login timestamp
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Sample admin user (for development only)
INSERT INTO users (name, email, password_hash, status, last_login) 
VALUES (
    'Administrator',
    'admin@example.com',
    '$2b$12$stI8WNGisqUJIdoTzL2pRewPyp50xPKEQEfFiSMVOgmdHAGnh3VvK',
    'active',
    CURRENT_TIMESTAMP
);

-- Show table structure
\d+ users;