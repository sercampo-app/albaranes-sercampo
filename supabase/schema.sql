-- Ejecutar en Supabase → SQL Editor → New Query

create table if not exists albaranes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  fecha_sesion date not null,
  fecha_documento text default '',
  establecimiento text default '',
  localidad text default '',
  cif text default '',
  conductor text default '',
  zona text default '',
  nota_conductor text default '',
  bidones_recogidos text default '',
  bidones_entregados text default '',
  desengrasantes text default '',
  fregasuelos text default '',
  lavavajillas text default '',
  jabon_manos text default '',
  higienizantes text default '',
  wc_banos text default '',
  l_cristales text default '',
  lejias text default '',
  filtros text default '',
  bayetas text default '',
  dinero text default '',
  otros text default '',
  campos_verificados jsonb default '{}'::jsonb
);

-- Índices para filtros rápidos
create index if not exists idx_albaranes_fecha_sesion on albaranes(fecha_sesion desc);
create index if not exists idx_albaranes_conductor on albaranes(conductor);
create index if not exists idx_albaranes_zona on albaranes(zona);
create index if not exists idx_albaranes_localidad on albaranes(localidad);

-- Política RLS (activar RLS en la tabla desde el panel)
-- Por ahora: acceso público (ajustar si se añade autenticación)
alter table albaranes enable row level security;

create policy "Acceso público lectura" on albaranes for select using (true);
create policy "Acceso público escritura" on albaranes for insert with check (true);
create policy "Acceso público eliminación" on albaranes for delete using (true);
