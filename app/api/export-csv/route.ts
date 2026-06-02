import { NextRequest, NextResponse } from 'next/server'
import { AlbaranData } from '@/lib/types'

function escapeCsv(val: string | null | undefined): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const HEADERS = [
  'ID', 'Fecha Sesión', 'Fecha Documento', 'Establecimiento', 'Localidad', 'CIF',
  'Conductor', 'Zona', 'Bidones Recogidos', 'Bidones Entregados',
  'Desengrasantes', 'Fregasuelos', 'Lavavajillas', 'Jabón Manos', 'Higienizantes',
  'WC Baños', 'L. Cristales', 'Lejías', 'Filtros', 'Bayetas', 'Dinero', 'Otros',
]

export async function POST(req: NextRequest) {
  try {
    const { albaranes }: { albaranes: AlbaranData[] } = await req.json()

    const rows = [
      HEADERS.join(','),
      ...albaranes.map((a) =>
        [
          a.id ?? '',
          a.fecha_sesion,
          a.fecha_documento,
          a.establecimiento,
          a.localidad,
          a.cif,
          a.conductor,
          a.zona,
          a.bidones_recogidos,
          a.bidones_entregados,
          a.desengrasantes,
          a.fregasuelos,
          a.lavavajillas,
          a.jabon_manos,
          a.higienizantes,
          a.wc_banos,
          a.l_cristales,
          a.lejias,
          a.filtros,
          a.bayetas,
          a.dinero,
          a.otros,
        ]
          .map(escapeCsv)
          .join(',')
      ),
    ].join('\r\n')

    return new NextResponse(rows, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="albaranes-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Error generando CSV' }, { status: 500 })
  }
}
