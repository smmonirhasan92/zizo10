-- Add Full Text Index for fullName only (since email is missing)
ALTER TABLE users ADD FULLTEXT INDEX ft_name_search (fullName);
