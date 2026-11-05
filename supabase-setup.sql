-- ============================================================
-- Setup database Supabase untuk Generator Struk Thermal 80mm
-- Jalankan file ini di Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- Tabel penyimpanan template struk
create table if not exists public.receipt_templates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    state jsonb not null,
    created_at timestamptz not null default now()
);

-- Index untuk mempercepat query per user
create index if not exists receipt_templates_user_created_idx
    on public.receipt_templates (user_id, created_at desc);

-- Aktifkan Row Level Security
alter table public.receipt_templates enable row level security;

-- Hapus policy lama agar script bisa dijalankan ulang
drop policy if exists "Users can view own templates" on public.receipt_templates;
drop policy if exists "Users can insert own templates" on public.receipt_templates;
drop policy if exists "Users can update own templates" on public.receipt_templates;
drop policy if exists "Users can delete own templates" on public.receipt_templates;

-- Setiap user hanya bisa mengakses template miliknya sendiri
create policy "Users can view own templates"
    on public.receipt_templates for select
    using (auth.uid() = user_id);

create policy "Users can insert own templates"
    on public.receipt_templates for insert
    with check (auth.uid() = user_id);

create policy "Users can update own templates"
    on public.receipt_templates for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own templates"
    on public.receipt_templates for delete
    using (auth.uid() = user_id);
