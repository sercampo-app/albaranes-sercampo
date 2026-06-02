import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseSQL = `
-- Ejecutar en Supabase SQL Editor:

create table if not exists albaranes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  fecha_sesion date not null,
  fecha_documento text,
  establecimiento text,
  localidad text,
  cif text,
  conductor text,
  zona text,
  nota_conductor text,
  bidones_recogidos text,
  bidones_entregados text,
  desengrasantes text,
  fregasuelos text,
  lavavajillas text,
  jabon_manos text,
  higienizantes text,
  wc_banos text,
  l_cristales text,
  lejias text,
  filtros text,
  bayetas text,
  dinero text,
  otros text,
  campos_verificados jsonb default '{}'::jsonb
);

create index if not exists idx_albaranes_fecha_sesion on albaranes(fecha_sesion);
create index if not exists idx_albaranes_conductor on albaranes(conductor);
create index if not exists idx_albaranes_zona on albaranes(zona);
`
