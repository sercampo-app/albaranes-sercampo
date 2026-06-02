'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CONDUCTORES, AlbaranData } from '@/lib/types'

interface ConductorStats {
  nombre: string
  zona: string
  albaranes: number
  bidones: number
  establecimientos: number
  nota_conductor?: string
}

export default function ConductoresPage() {
  const [stats, setStats] = useState<ConductorStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('albaranes').select('conductor,zona,bidones_recogidos,establecimiento,nota_conductor')
      const rows = (data as AlbaranData[]) ?? []

      const result: ConductorStats[] = []
      for (const [zona, conductores] of Object.entries(CONDUCTORES)) {
        for (const nombre of conductores) {
          const mine = rows.filter((r) => r.conductor === nombre)
          const lastNota = mine.filter((r) => r.nota_conductor).at(-1)?.nota_conductor
          result.push({
            nombre,
            zona,
            albaranes: mine.length,
            bidones: mine.reduce((s, r) => s + (parseInt(r.bidones_recogidos) || 0), 0),
            establecimientos: new Set(mine.map((r) => r.establecimiento).filter(Boolean)).size,
            nota_conductor: lastNota,
          })
        }
      }
      setStats(result)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Cargando…</div>
  }

  const zonas = Object.keys(CONDUCTORES)

  return (
    <div>
      {zonas.map((zona) => (
        <div key={zona} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{zona}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.filter((s) => s.zona === zona).map((c) => (
              <div key={c.nombre} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-400">{c.zona}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                    {c.nombre[0]}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Albaranes', value: c.albaranes },
                    { label: 'Bidones', value: c.bidones },
                    { label: 'Establec.', value: c.establecimientos },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center bg-gray-50 rounded-lg py-2">
                      <p className="text-lg font-bold text-gray-700">{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>

                {c.nota_conductor && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-amber-700 mb-1">Estilo de letra</p>
                    <p className="text-xs text-amber-800">{c.nota_conductor}</p>
                  </div>
                )}

                {!c.nota_conductor && c.albaranes === 0 && (
                  <p className="text-xs text-gray-300 text-center">Sin albaranes procesados</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
