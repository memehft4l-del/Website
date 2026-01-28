-- Create token_info table for dynamic token information
CREATE TABLE IF NOT EXISTS token_info (
  id BIGSERIAL PRIMARY KEY,
  token_name TEXT NOT NULL DEFAULT '$ELIXIR',
  token_symbol TEXT NOT NULL DEFAULT 'ELIXIR',
  contract_address TEXT NOT NULL,
  pump_fun_url TEXT,
  jupiter_url TEXT,
  twitter_url TEXT,
  telegram_url TEXT,
  dexscreener_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default token info
INSERT INTO token_info (
  token_name,
  token_symbol,
  contract_address,
  pump_fun_url,
  jupiter_url,
  twitter_url,
  telegram_url,
  dexscreener_url,
  is_active
) VALUES (
  '$ELIXIR',
  'ELIXIR',
  '4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2',
  'https://pump.fun/4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2',
  'https://jup.ag/swap/SOL-4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2',
  'https://twitter.com/ElixirToken',
  'https://t.me/ElixirToken',
  'https://dexscreener.com/solana/4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2',
  true
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE token_info ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON token_info
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_token_info_active ON token_info(is_active);


