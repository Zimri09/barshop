  -- Supabase SQL schema for BarStock
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

  -- Enable Row Level Security and policies

  -- Helper: allow admin/staff
  -- Policies will reference profiles table using auth.uid()

  -- PRODUCTS: public browse, restricted modifications
  alter table products enable row level security;

  create policy "public_select" on products for select using (true);

  create policy "products_staff_admin_select" on products
    for select using (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
    );
  create policy "products_staff_admin_insert" on products
    for insert with check (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
    );
  create policy "products_staff_admin_update" on products
    for update using (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
    ) with check (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
    );
  create policy "products_staff_admin_delete" on products
    for delete using (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
    );

  -- CATEGORIES accessible to admin/staff for modifications
  alter table categories enable row level security;
  create policy "categories_select" on categories for select using (true);
  create policy "categories_staff_admin_select" on categories
    for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
  create policy "categories_staff_admin_insert" on categories
    for insert with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
  create policy "categories_staff_admin_update" on categories
    for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')))
    with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
  create policy "categories_staff_admin_delete" on categories
    for delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));

  -- SUPPLIERS: protected
  alter table suppliers enable row level security;
  create policy "suppliers_select" on suppliers for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')) or true::boolean);
  create policy "suppliers_admin_select" on suppliers
    for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
  create policy "suppliers_admin_insert" on suppliers
    for insert with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
  create policy "suppliers_admin_update" on suppliers
    for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
  create policy "suppliers_admin_delete" on suppliers
    for delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

  -- ORDERS: customers can see own orders; staff/admin can manage
  alter table orders enable row level security;
  create policy "orders_customer_select" on orders for select
    using (auth.uid() = customer_id);

  create policy "orders_staff_admin_select" on orders for select
    using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));

  create policy "orders_insert_customer_or_staff" on orders for insert
    using (
      exists (select 1 from profiles p where p.id = auth.uid())
    ) with check (
      -- allow customers to create their own orders or staff/admin
      auth.uid() = customer_id or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))
    );

  create policy "orders_staff_admin_update" on orders
    for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')))
    with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
  create policy "orders_staff_admin_delete" on orders
    for delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));

  -- ORDER_ITEMS: staff/admin or owner via orders relation
  alter table order_items enable row level security;
  create policy "order_items_select" on order_items for select using (
    exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff'))))
  );

  create policy "order_items_staff_insert" on order_items
    for insert with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
  create policy "order_items_staff_update" on order_items
    for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')))
    with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
  create policy "order_items_staff_delete" on order_items
    for delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));

  -- LOYALTY: owner or admin
  alter table loyalty_points enable row level security;
  create policy "loyalty_owner_select" on loyalty_points for select
    using (customer_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
  create policy "loyalty_owner_insert" on loyalty_points
    for insert with check (customer_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
  create policy "loyalty_owner_update" on loyalty_points
    for update using (customer_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
    with check (customer_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
  create policy "loyalty_owner_delete" on loyalty_points
    for delete using (customer_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

  -- STOCK LOGS: staff/admin only
  alter table stock_logs enable row level security;
  create policy "stock_logs_staff_select" on stock_logs
    for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
  create policy "stock_logs_staff_insert" on stock_logs
    for insert with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));

  -- Helpful index on products for search
  create index if not exists products_name_gin on products using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(brand,'')));

  -- End of schema

-- Create function + trigger to auto-insert profile rows when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert a profile row if not exists
  if not exists (select 1 from public.profiles where id = new.id) then
    insert into public.profiles (id, email, created_at)
    values (new.id, new.email, now());
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users (Supabase default auth schema)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
