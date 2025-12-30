-- Create tournament_configs table to store tournament tags and passwords
-- This allows updating tournament info without code changes

CREATE TABLE IF NOT EXISTS tournament_configs (
  id SERIAL PRIMARY KEY,
  tournament_type VARCHAR(50) UNIQUE NOT NULL, -- 'SQUIRE', 'WHALE', 'TGE'
  tournament_tag VARCHAR(100) NOT NULL,
  tournament_password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values
INSERT INTO tournament_configs (tournament_type, tournament_tag, tournament_password, is_active)
VALUES 
  ('SQUIRE', '#SQUIRE2024', 'SquirePass123!', true),
  ('WHALE', '#WHALE2024', 'WhalePass456!', true),
  ('TGE', '#TGE2024', 'TGEPass789!', true)
ON CONFLICT (tournament_type) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE tournament_configs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to tournament configs"
  ON tournament_configs
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_tournament_configs_updated_at
  BEFORE UPDATE ON tournament_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


