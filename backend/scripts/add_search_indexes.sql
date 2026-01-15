-- Add Full Text Index for generic search
ALTER TABLE users ADD FULLTEXT INDEX ft_user_search (fullName, email);

-- Add BTREE Indexes for exact/prefix lookup (High Priority)
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD INDEX idx_username (username);
ALTER TABLE users ADD INDEX idx_referral_code (referral_code); -- Note: Ensure column name matches schema (usually referral_code or referralCode)
-- Checking previous files... User model says 'referral_code'? Wait.
-- Let's check User.js first to be sure about column names before running SQL.
