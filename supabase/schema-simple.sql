-- Supabase SQL schema for BarStock (Tables only - no RLS)
-- Run this in the Supabase SQL editor

-- Enable uuid extension
create extension if not exists "pgcrypto";

-- Profiles linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text check (role in ('admin','staff','customer')) not null default 'customer',
  phone text,
  created_at timestamptz default now()
);

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

-- Suppliers
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  contact_person text,
  phone text,
  email text,
  address text
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  name text not null,
  brand text,
  description text,
  image_url text,
  abv numeric,
  volume_ml integer,
  price numeric not null default 0,
  stock_quantity integer not null default 0,
  reorder_threshold integer not null default 0,
  sku text unique,
  is_archived boolean default false,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete set null,
  staff_id uuid references profiles(id) on delete set null,
  total_amount numeric not null default 0,
  order_type text check (order_type in ('walk-in','preorder')) default 'walk-in',
  status text check (status in ('pending','confirmed','ready','completed','cancelled')) default 'pending',
  loyalty_points_earned integer default 0,
  loyalty_points_used integer default 0,
  payment_method text,
  guest_name text,
  guest_phone text,
  created_at timestamptz default now()
);

-- Order items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null default 1,
  unit_price numeric not null,
  subtotal numeric not null
);

-- Loyalty points
create table if not exists loyalty_points (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete cascade,
  points_balance integer default 0,
  total_earned bigint default 0,
  total_redeemed bigint default 0,
  updated_at timestamptz default now()
);

-- Stock logs
create table if not exists stock_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  staff_id uuid references profiles(id) on delete set null,
  previous_stock integer,
  new_stock integer,
  action_type text,
  created_at timestamptz default now()
);

-- Helpful index on products for search
create index if not exists products_name_gin on products using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(brand,'')));

-- Insert sample data
insert into categories (name, description) values 
  ('Whiskey', 'Whisky and whiskey spirits'),
  ('Vodka', 'Vodka and grain spirits'),
  ('Rum', 'Rum and sugarcane spirits'),
  ('Gin', 'Gin and botanicals'),
  ('Wine', 'Wine and fortified wines'),
  ('Beer', 'Beer and ales')
on conflict do nothing;

insert into suppliers (supplier_name, contact_person, phone, email, address) values
  ('Premium Spirits Co.', 'John Smith', '555-0101', 'john@premiumspirits.com', '123 Trade St'),
  ('Global Liquor Group', 'Jane Doe', '555-0102', 'jane@globalliquor.com', '456 Export Ave'),
  ('Local Brewery Supply', 'Bob Johnson', '555-0103', 'bob@localbrewery.com', '789 Brewery Ln')
on conflict do nothing;

insert into products (category_id, supplier_id, name, brand, sku, price, stock_quantity, volume_ml, abv, reorder_threshold) 
select c.id, s.id, 'Highland Malt Whiskey', 'Glen Premium', 'SKU-001', 49.99, 50, 750, 43.0, 10
from categories c, suppliers s
where c.name = 'Whiskey' and s.supplier_name = 'Premium Spirits Co.'
on conflict do nothing;

insert into products (category_id, supplier_id, name, brand, sku, price, stock_quantity, volume_ml, abv, reorder_threshold)
select c.id, s.id, 'Pure Vodka 40', 'Crystal Clear', 'SKU-002', 29.99, 75, 750, 40.0, 15
from categories c, suppliers s
where c.name = 'Vodka' and s.supplier_name = 'Global Liquor Group'
on conflict do nothing;

insert into products (category_id, supplier_id, name, brand, sku, price, stock_quantity, volume_ml, abv, reorder_threshold)
select c.id, s.id, 'Craft IPA Beer', 'Local Brew', 'SKU-003', 12.99, 120, 355, 6.5, 30
from categories c, suppliers s
where c.name = 'Beer' and s.supplier_name = 'Local Brewery Supply'
on conflict do nothing;

-- End of schema
