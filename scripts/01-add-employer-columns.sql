-- Add employer-related columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bedrijfsnaam VARCHAR(255),
ADD COLUMN IF NOT EXISTS kvk VARCHAR(8),
ADD COLUMN IF NOT EXISTS bedrijfsGrootte VARCHAR(50),
ADD COLUMN IF NOT EXISTS contactpersoon VARCHAR(255);

-- Create index on kvk for faster lookups
ALTER TABLE users 
ADD UNIQUE INDEX IF NOT EXISTS idx_kvk (kvk);

-- Update existing employers to have a default contact person if missing
UPDATE users 
SET contactpersoon = COALESCE(contactpersoon, 'Nog in te vullen') 
WHERE role = 'employer' AND contactpersoon IS NULL;
