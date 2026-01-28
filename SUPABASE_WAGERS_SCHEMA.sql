-- Wagers Table Schema for 1v1 Clash Royale Wagering System

-- Create wagers table
CREATE TABLE IF NOT EXISTS wagers (
  id BIGSERIAL PRIMARY KEY,
  creator_id TEXT NOT NULL, -- Wallet address of creator
  opponent_id TEXT, -- Wallet address of opponent (null until accepted)
  amount DECIMAL(18, 9) NOT NULL, -- SOL amount
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED')) DEFAULT 'PENDING',
  winner_id TEXT, -- Wallet address of winner (null until match completed)
  escrow_address TEXT, -- Solana escrow address for this wager
  transaction_signature TEXT, -- Transaction signature for escrow deposit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE, -- When wager status changed to ACTIVE
  completed_at TIMESTAMP WITH TIME ZONE, -- When wager status changed to COMPLETED
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_profiles table (if not exists) with cr_tag field
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  cr_tag TEXT, -- Clash Royale player tag (e.g., #ABC123XYZ)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_wagers_creator ON wagers(creator_id);
CREATE INDEX IF NOT EXISTS idx_wagers_opponent ON wagers(opponent_id);
CREATE INDEX IF NOT EXISTS idx_wagers_status ON wagers(status);
CREATE INDEX IF NOT EXISTS idx_wagers_escrow ON wagers(escrow_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cr_tag ON user_profiles(cr_tag);

-- Enable Row Level Security (RLS)
ALTER TABLE wagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read wagers" ON wagers;
DROP POLICY IF EXISTS "Allow public insert wagers" ON wagers;
DROP POLICY IF EXISTS "Allow public update own wagers" ON wagers;
DROP POLICY IF EXISTS "Allow public read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public update own profile" ON user_profiles;

-- Create policies for wagers table
CREATE POLICY "Allow public read wagers" ON wagers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert wagers" ON wagers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update own wagers" ON wagers
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for user_profiles table
CREATE POLICY "Allow public read profiles" ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert profiles" ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update own profile" ON user_profiles
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for wagers updated_at
DROP TRIGGER IF EXISTS update_wagers_updated_at ON wagers;
CREATE TRIGGER update_wagers_updated_at
  BEFORE UPDATE ON wagers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON wagers TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE wagers_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO anon, authenticated;


