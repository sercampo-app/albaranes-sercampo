export type FieldState = 'normal' | 'warn' | 'confirmed'

export interface AlbaranData {
  id?: string
  created_at?: string
  fecha_sesion: string
  fecha_documento: string
  establecimiento: string
  localidad: string
  cif: string
  conductor: string
  zona: string
  nota_conductor?: string
  bidones_recogidos: string
  bidones_entregados: string
  desengrasantes: string
  fregasuelos: string
  lavavajillas: string
  jabon_manos: string
  higienizantes: string
  wc_banos: string
  l_cristales: string
  lejias: string
  filtros: string
  bayetas: string
  dinero: string
  otros: string
  campos_verificados: Record<string, boolean>
}

export type AlbaranField = keyof Omit<AlbaranData, 'id' | 'created_at' | 'campos_verificados'>

export const CONDUCTORES: Record<string, string[]> = {
  'Cuenca': ['Julián', 'Rafa', 'Antonio', 'Jorge'],
  'Ciudad Real / Toledo': ['David', 'Toni', 'Ángel'],
}

export const ALL_CONDUCTORES = Object.values(CONDUCTORES).flat()

export const ZONA_POR_CONDUCTOR: Record<string, string> = {
  'Julián': 'Cuenca',
  'Rafa': 'Cuenca',
  'Antonio': 'Cuenca',
  'Jorge': 'Cuenca',
  'David': 'Ciudad Real / Toledo',
  'Toni': 'Ciudad Real / Toledo',
  'Ángel': 'Ciudad Real / Toledo',
}

export const PRODUCT_FIELDS: { key: AlbaranField; label: string }[] = [
  { key: 'desengrasantes', label: 'Desengrasantes' },
  { key: 'fregasuelos', label: 'Fregasuelos' },
  { key: 'lavavajillas', label: 'Lavavajillas' },
  { key: 'jabon_manos', label: 'Jabón de Manos' },
  { key: 'higienizantes', label: 'Higienizantes' },
  { key: 'wc_banos', label: 'WC Baños' },
  { key: 'l_cristales', label: 'L. Cristales' },
  { key: 'lejias', label: 'Lejías' },
]

export const OTROS_FIELDS: { key: AlbaranField; label: string }[] = [
  { key: 'filtros', label: 'Filtros' },
  { key: 'bayetas', label: 'Bayetas' },
  { key: 'dinero', label: 'Dinero' },
  { key: 'otros', label: 'Otros' },
]

export interface AIAlbaranResult {
  fecha_documento: string
  establecimiento: string
  localidad: string
  cif: string
  conductor: string
  zona: string
  bidones_recogidos: string
  bidones_entregados: string
  desengrasantes: string
  fregasuelos: string
  lavavajillas: string
  jabon_manos: string
  higienizantes: string
  wc_banos: string
  l_cristales: string
  lejias: string
  filtros: string
  bayetas: string
  dinero: string
  otros: string
  confidence: Record<string, 'high' | 'low'>
}
