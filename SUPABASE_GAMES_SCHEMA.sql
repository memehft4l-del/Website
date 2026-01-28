-- Updated Schema for Direct Wallet Escrow System
-- Funds go directly to admin wallet, tracked in Supabase

-- Create wagers table if it doesn't exist
CREATE TABLE IF NOT EXISTS wagers (
  id BIGSERIAL PRIMARY KEY,
  creator_id TEXT NOT NULL,
  opponent_id TEXT,
  amount DECIMAL(18, 9) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED')) DEFAULT 'PENDING',
  winner_id TEXT,
  transaction_signature TEXT,
  verification_status TEXT CHECK (verification_status IN ('PENDING', 'VERIFIED', 'NEEDS_REVIEW', 'DISPUTED')) DEFAULT 'PENDING',
  payout_status TEXT CHECK (payout_status IN ('PENDING', 'PAID', 'REFUNDED')) DEFAULT 'PENDING',
  admin_wallet TEXT,
  deposit_signature TEXT,
  payout_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  match_result JSONB,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Update wagers table to add new columns if they don't exist
DO $$ 
BEGIN
  -- Add verification_status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='verification_status') THEN
    ALTER TABLE wagers ADD COLUMN verification_status TEXT CHECK (verification_status IN ('PENDING', 'VERIFIED', 'NEEDS_REVIEW', 'DISPUTED')) DEFAULT 'PENDING';
  END IF;
  
  -- Add payout_status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='payout_status') THEN
    ALTER TABLE wagers ADD COLUMN payout_status TEXT CHECK (payout_status IN ('PENDING', 'PAID', 'REFUNDED')) DEFAULT 'PENDING';
  END IF;
  
  -- Add admin_wallet if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='admin_wallet') THEN
    ALTER TABLE wagers ADD COLUMN admin_wallet TEXT;
  END IF;
  
  -- Add deposit_signature if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='deposit_signature') THEN
    ALTER TABLE wagers ADD COLUMN deposit_signature TEXT;
  END IF;
  
  -- Add payout_signature if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='payout_signature') THEN
    ALTER TABLE wagers ADD COLUMN payout_signature TEXT;
  END IF;
  
  -- Add verified_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='verified_at') THEN
    ALTER TABLE wagers ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add paid_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='paid_at') THEN
    ALTER TABLE wagers ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add match_result if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='match_result') THEN
    ALTER TABLE wagers ADD COLUMN match_result JSONB;
  END IF;
  
  -- Add notes if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='notes') THEN
    ALTER TABLE wagers ADD COLUMN notes TEXT;
  END IF;
  
  -- Add tournament_tag if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='tournament_tag') THEN
    ALTER TABLE wagers ADD COLUMN tournament_tag TEXT;
  END IF;
  
  -- Add tournament_password if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='tournament_password') THEN
    ALTER TABLE wagers ADD COLUMN tournament_password TEXT;
  END IF;
  
  -- Add refund_status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='refund_status') THEN
    ALTER TABLE wagers ADD COLUMN refund_status TEXT;
  END IF;
  
  -- Add refund_signature if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='refund_signature') THEN
    ALTER TABLE wagers ADD COLUMN refund_signature TEXT;
  END IF;
  
  -- Remove escrow_address if it exists (we don't need it anymore)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wagers' AND column_name='escrow_address') THEN
    ALTER TABLE wagers DROP COLUMN escrow_address;
  END IF;
END $$;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  cr_tag TEXT,
  total_points INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  total_winnings DECIMAL(18, 9) DEFAULT 0,
  total_wagered DECIMAL(18, 9) DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_win_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Update user_profiles to add new columns if they don't exist
DO $$ 
BEGIN
  -- Add total_points if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='total_points') THEN
    ALTER TABLE user_profiles ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;
  
  -- Add games_won if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='games_won') THEN
    ALTER TABLE user_profiles ADD COLUMN games_won INTEGER DEFAULT 0;
  END IF;
  
  -- Add games_lost if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='games_lost') THEN
    ALTER TABLE user_profiles ADD COLUMN games_lost INTEGER DEFAULT 0;
  END IF;
  
  -- Add total_winnings if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='total_winnings') THEN
    ALTER TABLE user_profiles ADD COLUMN total_winnings DECIMAL(18, 9) DEFAULT 0;
  END IF;
  
  -- Add total_wagered if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='total_wagered') THEN
    ALTER TABLE user_profiles ADD COLUMN total_wagered DECIMAL(18, 9) DEFAULT 0;
  END IF;
  
  -- Add win_streak if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='win_streak') THEN
    ALTER TABLE user_profiles ADD COLUMN win_streak INTEGER DEFAULT 0;
  END IF;
  
  -- Add best_win_streak if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='best_win_streak') THEN
    ALTER TABLE user_profiles ADD COLUMN best_win_streak INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wins ON user_profiles(games_won DESC);
CREATE INDEX IF NOT EXISTS idx_wagers_verification_status ON wagers(verification_status);
CREATE INDEX IF NOT EXISTS idx_wagers_payout_status ON wagers(payout_status);
CREATE INDEX IF NOT EXISTS idx_wagers_admin_wallet ON wagers(admin_wallet);

-- Create a view for leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  wallet_address,
  cr_tag,
  total_points,
  games_won,
  games_lost,
  CASE 
    WHEN games_won + games_lost > 0 
    THEN ROUND((games_won::DECIMAL / (games_won + games_lost)) * 100, 2)
    ELSE 0 
  END as win_rate,
  total_winnings,
  win_streak,
  best_win_streak,
  updated_at
FROM user_profiles
WHERE total_points > 0 OR games_won > 0 OR games_lost > 0
ORDER BY total_points DESC, games_won DESC, win_rate DESC;

-- Grant permissions
GRANT SELECT ON leaderboard TO anon, authenticated;

