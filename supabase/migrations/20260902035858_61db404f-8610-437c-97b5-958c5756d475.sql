ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email text;