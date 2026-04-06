-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_purchase_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies: tenant-isolated
CREATE POLICY "Tenant isolation for companies" ON public.companies
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Import products: tenant-isolated
CREATE POLICY "Tenant isolation for import_products" ON public.import_products
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Products: tenant-isolated
CREATE POLICY "Tenant isolation for products" ON public.products
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Purchases: tenant-isolated
CREATE POLICY "Tenant isolation for purchases" ON public.purchases
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Local companies: tenant-isolated
CREATE POLICY "Tenant isolation for local_companies" ON public.local_companies
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Purchase items: accessible if parent purchase belongs to user
CREATE POLICY "Users can access own purchase_items" ON public.purchase_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = purchase_items.purchase_id
      AND purchases.user_id = auth.uid()
    )
  );

-- Import purchase items: same
CREATE POLICY "Users can access own import_purchase_items" ON public.import_purchase_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = import_purchase_items.purchase_id
      AND purchases.user_id = auth.uid()
    )
  );