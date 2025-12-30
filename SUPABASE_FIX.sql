-- Drop table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS tournament_signups CASCADE;

-- Create tournament_signups table with correct column names
CREATE TABLE tournament_signups (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  clash_royale_username TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('SQUIRE', 'WHALE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure one signup per wallet address
  UNIQUE(wallet_address)
);

-- Create indexes for faster lookups
CREATE INDEX idx_tournament_signups_wallet ON tournament_signups(wallet_address);
CREATE INDEX idx_tournament_signups_tier ON tournament_signups(tier);
CREATE INDEX idx_tournament_signups_username ON tournament_signups(clash_royale_username);

-- Enable Row Level Security (RLS)
ALTER TABLE tournament_signups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert" ON tournament_signups;
DROP POLICY IF EXISTS "Allow users to read own signup" ON tournament_signups;

-- Create policy to allow anyone to insert (for signups)
CREATE POLICY "Allow public insert" ON tournament_signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow users to read their own signups
CREATE POLICY "Allow users to read own signup" ON tournament_signups
  FOR SELECT
  TO public
  USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON tournament_signups TO anon, authenticated;


