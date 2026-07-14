alter table public.work_orders
  add column if not exists quote_materials numeric(12, 2) not null default 0,
  add column if not exists quote_labor numeric(12, 2) not null default 0,
  add column if not exists quote_discount numeric(12, 2) not null default 0,
  add column if not exists quote_total numeric(12, 2)
    generated always as (quote_materials + quote_labor - quote_discount) stored,
  add column if not exists quote_term text,
  add column if not exists quoted_at timestamptz;

alter table public.work_orders
  drop constraint if exists work_orders_quote_values_check;

alter table public.work_orders
  add constraint work_orders_quote_values_check check (
    quote_materials >= 0
    and quote_labor >= 0
    and quote_discount >= 0
    and (
      (
        quote_term is null
        and quoted_at is null
        and quote_materials = 0
        and quote_labor = 0
        and quote_discount = 0
      )
      or (
        quote_term is not null
        and char_length(quote_term) between 2 and 160
        and quoted_at is not null
        and quote_materials + quote_labor > 0
        and quote_discount <= quote_materials + quote_labor
      )
    )
  );
