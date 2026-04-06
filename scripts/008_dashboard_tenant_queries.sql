-- Dashboard Queries - Tenant-based data fetching
-- All queries filter by authenticated user_id for tenant isolation

-- Fetch user's products
SELECT * FROM public.products WHERE user_id = 'current-user-id';

-- Fetch user's purchases with optional date filtering
SELECT * FROM public.purchases
WHERE user_id = 'current-user-id'
  AND purchase_date >= 'start-date'
  AND purchase_date <= 'end-date';

-- Fetch purchase items for user's purchases
SELECT * FROM public.purchase_items
WHERE purchase_id IN (
  SELECT id FROM public.purchases
  WHERE user_id = 'current-user-id'
);

-- Supabase client code equivalent:
-- const { data: products } = await supabase
--   .from("products")
--   .select("*")
--   .eq("user_id", user.id)
--
-- const { data: purchases } = await supabase
--   .from("purchases")
--   .select("*")
--   .eq("user_id", user.id)
--   .gte("purchase_date", startDate)
--   .lte("purchase_date", endDate)
--
-- const { data: purchaseItems } = await supabase
--   .from("purchase_items")
--   .select("*")
--   .in("purchase_id", purchases.map(p => p.id))