'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AlbaranData, ALL_CONDUCTORES } from '@/lib/types'

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    ;(acc[k] ??= []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export default function HistoricoPage() {
  const [albaranes, setAlbaranes] = useState<AlbaranData[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ conductor: '', zona: '', localidad: '', fecha: '' })

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('albaranes').select('*').order('fecha_sesion', { ascending: false })
    if (filtros.conductor) q = q.eq('conductor', filtros.conductor)
    if (filtros.zona) q = q.eq('zona', filtros.zona)
    if (filtros.localidad) q = q.ilike('localidad', `%${filtros.localidad}%`)
    if (filtros.fecha) q = q.eq('fecha_sesion', filtros.fecha)
    const { data } = await q
    setAlbaranes((data as AlbaranData[]) ?? [])
    setLoading(false)
  }, [filtros])

  useEffect(() => { load() }, [load])

  async function exportAll() {
    const res = await fetch('/api/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albaranes }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `albaranes-historico.csv`
    a.click()
  }

  async function deleteAlbaran(id: string) {
    if (!confirm('¿Eliminar este albarán del histórico?')) return
    await supabase.from('albaranes').delete().eq('id', id)
    setAlbaranes((prev) => prev.filter((a) => a.id !== id))
  }

  const totalBidones = albaranes.reduce((s, a) => s + (parseInt(a.bidones_recogidos) || 0), 0)
  const establecimientos = new Set(albaranes.map((a) => a.establecimiento).filter(Boolean)).size
  const byFecha = groupBy(albaranes, (a) => a.fecha_sesion)

  return (
    <div>
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Albaranes', value: albaranes.length },
          { label: 'Bidones recogidos', value: totalBidones },
          { label: 'Establecimientos', value: establecimientos },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Filtros</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Conductor</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              value={filtros.conductor}
              onChange={(e) => setFiltros((f) => ({ ...f, conductor: e.target.value }))}
            >
              <option value="">Todos</option>
              {ALL_CONDUCTORES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Zona</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              value={filtros.zona}
              onChange={(e) => setFiltros((f) => ({ ...f, zona: e.target.value }))}
            >
              <option value="">Todas</option>
              <option>Cuenca</option>
              <option>Ciudad Real / Toledo</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Localidad</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              placeholder="Buscar..."
              value={filtros.localidad}
              onChange={(e) => setFiltros((f) => ({ ...f, localidad: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha sesión</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              value={filtros.fecha}
              onChange={(e) => setFiltros((f) => ({ ...f, fecha: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <button
            onClick={() => setFiltros({ conductor: '', zona: '', localidad: '', fecha: '' })}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Limpiar filtros
          </button>
          {albaranes.length > 0 && (
            <button onClick={exportAll} className="btn-secondary text-xs py-1.5 px-3">
              ⬇ Exportar CSV
            </button>
          )}
        </div>
      </div>

      {/* Lista agrupada por fecha */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Cargando…</div>
      ) : albaranes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No hay albaranes con los filtros seleccionados</div>
      ) : (
        Object.entries(byFecha)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([fecha, group]) => (
            <div key={fecha} className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  {new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <span className="text-xs text-gray-400">{group.length} albarán{group.length > 1 ? 'es' : ''}</span>
              </div>
              <div className="card divide-y divide-gray-100">
                {group.map((a) => (
                  <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.establecimiento || '—'}</p>
                      <p className="text-xs text-gray-500">{[a.localidad, a.conductor, a.cif].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {a.bidones_recogidos && (
                        <p className="text-xs text-gray-500">{a.bidones_recogidos} bidones</p>
                      )}
                      <p className="text-xs text-gray-400">{a.fecha_documento}</p>
                    </div>
                    <button
                      onClick={() => deleteAlbaran(a.id!)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none ml-1"
                      title="Eliminar"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  )
}
