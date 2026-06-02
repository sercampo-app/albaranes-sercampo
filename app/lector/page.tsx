'use client'
import { useState, useRef } from 'react'
import { AlbaranData, AIAlbaranResult } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import AlbaranCard from '@/components/AlbaranCard'

interface PendingAlbaran {
  id: string
  imageUrl: string
  data: AlbaranData
  confidence: Record<string, 'high' | 'low'>
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function buildAlbaranData(ai: AIAlbaranResult, fechaSesion: string): AlbaranData {
  return {
    fecha_sesion: fechaSesion,
    fecha_documento: ai.fecha_documento ?? '',
    establecimiento: ai.establecimiento ?? '',
    localidad: ai.localidad ?? '',
    cif: ai.cif ?? '',
    conductor: ai.conductor ?? '',
    zona: ai.zona ?? '',
    bidones_recogidos: ai.bidones_recogidos ?? '',
    bidones_entregados: ai.bidones_entregados ?? '',
    desengrasantes: ai.desengrasantes ?? '',
    fregasuelos: ai.fregasuelos ?? '',
    lavavajillas: ai.lavavajillas ?? '',
    jabon_manos: ai.jabon_manos ?? '',
    higienizantes: ai.higienizantes ?? '',
    wc_banos: ai.wc_banos ?? '',
    l_cristales: ai.l_cristales ?? '',
    lejias: ai.lejias ?? '',
    filtros: ai.filtros ?? '',
    bayetas: ai.bayetas ?? '',
    dinero: ai.dinero ?? '',
    otros: ai.otros ?? '',
    campos_verificados: {},
  }
}

export default function LectorPage() {
  const [fechaSesion, setFechaSesion] = useState(today())
  const [albaranes, setAlbaranes] = useState<PendingAlbaran[]>([])
  const [processing, setProcessing] = useState(false)
  const [processingIndex, setProcessingIndex] = useState(0)
  const [processingTotal, setProcessingTotal] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    if (!files.length) return
    setProcessing(true)
    setErrors([])
    setProcessingTotal(files.length)
    setProcessingIndex(0)

    const newAlbaranes: PendingAlbaran[] = []

    for (let i = 0; i < files.length; i++) {
      setProcessingIndex(i + 1)
      const file = files[i]
      const imageUrl = URL.createObjectURL(file)

      try {
        const fd = new FormData()
        fd.append('imagen', file)
        const res = await fetch('/api/leer-albaran', { method: 'POST', body: fd })
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
        const json = await res.json()
        if (json.error) throw new Error(json.error)

        const ai: AIAlbaranResult = json.data
        newAlbaranes.push({
          id: `${Date.now()}-${i}`,
          imageUrl,
          data: buildAlbaranData(ai, fechaSesion),
          confidence: ai.confidence ?? {},
        })
      } catch (err) {
        setErrors((prev) => [...prev, `Imagen ${i + 1}: ${err instanceof Error ? err.message : 'Error'}`])
      }
    }

    setAlbaranes((prev) => [...prev, ...newAlbaranes])
    setProcessing(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSave(id: string, data: AlbaranData) {
    const { error } = await supabase.from('albaranes').insert([data])
    if (error) throw new Error(error.message)
  }

  function removeAlbaran(id: string) {
    setAlbaranes((prev) => prev.filter((a) => a.id !== id))
  }

  async function exportSession() {
    const saved = albaranes.map((a) => a.data)
    const res = await fetch('/api/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albaranes: saved }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `albaranes-sesion-${fechaSesion}.csv`
    a.click()
  }

  return (
    <div>
      {/* Cabecera de sesión */}
      <div className="card mb-4">
        <div className="p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de sesión</label>
            <input
              type="date"
              value={fechaSesion}
              onChange={(e) => setFechaSesion(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Subir albaranes</label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
              <span className="text-lg">📷</span>
              <span className="text-sm text-gray-500">Seleccionar imágenes (JPG, PNG)</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* Zona de drop */}
        <div
          className="mx-4 mb-4 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400 hover:border-gray-300 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        >
          O arrastra las imágenes aquí
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block"/><span>Leído con seguridad</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block"/><span>⚠ Revisar manualmente</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-50 border border-green-300 inline-block"/><span>✓ Confirmado</span></span>
      </div>

      {/* Progreso */}
      {processing && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full"/>
          <p className="text-sm text-gray-600">
            Procesando imagen {processingIndex} de {processingTotal}…
          </p>
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-700">{e}</p>
          ))}
        </div>
      )}

      {/* Albaranes */}
      {albaranes.map((a, i) => (
        <AlbaranCard
          key={a.id}
          index={i}
          data={a.data}
          confidence={a.confidence}
          imageUrl={a.imageUrl}
          onSave={(d) => handleSave(a.id, d)}
          onRemove={() => removeAlbaran(a.id)}
        />
      ))}

      {/* Exportar sesión */}
      {albaranes.length > 0 && (
        <div className="flex justify-end mt-2">
          <button onClick={exportSession} className="btn-secondary">
            <span>⬇</span> Exportar sesión a CSV
          </button>
        </div>
      )}

      {albaranes.length === 0 && !processing && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Sube fotos de albaranes para comenzar
        </div>
      )}
    </div>
  )
}
