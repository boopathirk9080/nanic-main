-- Create billings table to store saved bills
CREATE TABLE IF NOT EXISTS billings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  bill_name TEXT NOT NULL,
  bill_number TEXT UNIQUE NOT NULL,
  bill_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL, -- Array of {product_name, quantity, unit_price, subtotal}
  total_amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_billings_user_id ON billings(user_id);
CREATE INDEX IF NOT EXISTS idx_billings_purchase_id ON billings(purchase_id);
CREATE INDEX IF NOT EXISTS idx_billings_bill_date ON billings(bill_date);

-- Enable RLS
ALTER TABLE billings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own billings
CREATE POLICY "Users can view their own billings"
  ON billings FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own billings
CREATE POLICY "Users can insert their own billings"
  ON billings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own billings
CREATE POLICY "Users can update their own billings"
  ON billings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own billings
CREATE POLICY "Users can delete their own billings"
  ON billings FOR DELETE
  USING (auth.uid() = user_id);
