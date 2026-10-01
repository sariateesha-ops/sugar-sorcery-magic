CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category_id text NOT NULL,
  category_name text NOT NULL,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.products (id, name, category_id, category_name, variants, sort_order) VALUES
('bombo-chocolate','Chocolate','bombolonis','Bombolonis','[{"label":"Box of 2","price":270},{"label":"Box of 4","price":560},{"label":"Box of 6","price":800}]'::jsonb,0),
('bombo-pastry-cream','Pastry Cream','bombolonis','Bombolonis','[{"label":"Box of 2","price":240},{"label":"Box of 4","price":480},{"label":"Box of 6","price":720}]'::jsonb,1),
('bombo-caramelized-milk','Caramelized Milk','bombolonis','Bombolonis','[{"label":"Box of 2","price":300},{"label":"Box of 4","price":680},{"label":"Box of 6","price":900}]'::jsonb,2),
('bombo-milk-chocolate-cardamom','Milk Chocolate Cardamom','bombolonis','Bombolonis','[{"label":"Box of 2","price":300},{"label":"Box of 4","price":600},{"label":"Box of 6","price":900}]'::jsonb,3),
('cookie-triple-chocolate','Triple Chocolate','cookies','Cookies','[{"label":"Each","price":100}]'::jsonb,4),
('cookie-chocolate-orange','Chocolate Orange','cookies','Cookies','[{"label":"Each","price":100}]'::jsonb,5),
('cookie-smores','S''mores','cookies','Cookies','[{"label":"Each","price":150}]'::jsonb,6),
('cookie-orange-pistachio','Orange Pistachio','cookies','Cookies','[{"label":"Each","price":130}]'::jsonb,7),
('brownie-classic-chocolate','Classic Chocolate','brownies','Brownies','[{"label":"Box of 4","price":450},{"label":"Box of 6","price":600}]'::jsonb,8),
('brownie-tiramisu','Tiramisu','brownies','Brownies','[{"label":"Box of 4","price":800},{"label":"Box of 6","price":1000}]'::jsonb,9),
('brownie-matcha-swirl','Matcha Swirl','brownies','Brownies','[{"label":"Box of 4","price":800},{"label":"Box of 6","price":900}]'::jsonb,10),
('brownie-caramel','Caramel','brownies','Brownies','[{"label":"Box of 4","price":500},{"label":"Box of 6","price":650}]'::jsonb,11),
('cake-classic-chocolate','Classic Chocolate','classic-cakes','Classic Cakes','[{"label":"½ KG","price":600},{"label":"1 KG","price":1100}]'::jsonb,12),
('cake-orange-chocolate','Orange Chocolate','classic-cakes','Classic Cakes','[{"label":"½ KG","price":700},{"label":"1 KG","price":1300}]'::jsonb,13),
('cake-salted-caramel','Salted Caramel','classic-cakes','Classic Cakes','[{"label":"½ KG","price":700},{"label":"1 KG","price":1300}]'::jsonb,14),
('cake-nutella-hazelnut','Nutella Hazelnut','classic-cakes','Classic Cakes','[{"label":"½ KG","price":800},{"label":"1 KG","price":1500}]'::jsonb,15),
('cake-chocolate-peanutbutter','Chocolate Peanutbutter','classic-cakes','Classic Cakes','[{"label":"½ KG","price":600},{"label":"1 KG","price":1200}]'::jsonb,16),
('cake-mixed-fruit','Mixed Fruit Cake','classic-cakes','Classic Cakes','[{"label":"½ KG","price":600},{"label":"1 KG","price":1200}]'::jsonb,17),
('cake-lemon-blueberry','Lemon Blueberry','classic-cakes','Classic Cakes','[{"label":"½ KG","price":900},{"label":"1 KG","price":1500}]'::jsonb,18),
('cake-coconut-pineapple','Coconut Pineapple','classic-cakes','Classic Cakes','[{"label":"½ KG","price":650},{"label":"1 KG","price":1200}]'::jsonb,19),
('cake-lotus-biscoff','Lotus Biscoff','classic-cakes','Classic Cakes','[{"label":"½ KG","price":750},{"label":"1 KG","price":1400}]'::jsonb,20),
('cake-opera','Opera','classic-cakes','Classic Cakes','[{"label":"½ KG","price":700},{"label":"1 KG","price":1400}]'::jsonb,21),
('basque-classic','Classic','basque-cheesecake','Basque Cheesecake','[{"label":"½ KG","price":800},{"label":"1 KG","price":1600}]'::jsonb,22),
('basque-chocolate','Chocolate','basque-cheesecake','Basque Cheesecake','[{"label":"½ KG","price":900},{"label":"1 KG","price":1800}]'::jsonb,23),
('basque-espresso','Espresso','basque-cheesecake','Basque Cheesecake','[{"label":"½ KG","price":950},{"label":"1 KG","price":1850}]'::jsonb,24),
('basque-matcha','Matcha','basque-cheesecake','Basque Cheesecake','[{"label":"½ KG","price":1100},{"label":"1 KG","price":2200}]'::jsonb,25);
CREATE POLICY "Admins read product images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));