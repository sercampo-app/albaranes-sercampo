'use client'
import { useState } from 'react'
import { AlbaranData, ALL_CONDUCTORES, PRODUCT_FIELDS, OTROS_FIELDS, ZONA_POR_CONDUCTOR } from '@/lib/types'
import FieldInput from './FieldInput'

interface Props {
  index: number
  data: AlbaranData
  confidence: Record<string, 'high' | 'low'>
  imageUrl: string
  onSave: (data: AlbaranData) => Promise<void>
  onRemove: () => void
}

export default function AlbaranCard({ index, data: initial, confidence, imageUrl, onSave, onRemove }: Props) {
  const [data, setData] = useState<AlbaranData>(initial)
  const [verified, setVerified] = useState<Record<string, boolean>>(initial.campos_verificados ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [imgExpanded, setImgExpanded] = useState(false)

  function getState(key: string): 'normal' | 'warn' | 'confirmed' {
    if (verified[key]) return 'confirmed'
    if (confidence[key] === 'low') return 'warn'
    return 'normal'
  }

  function handleChange(key: string, value: string) {
    setData((prev) => {
      const next = { ...prev, [key]: value }
      // auto-fill zona when conductor changes
      if (key === 'conductor' && value) {
        next.zona = ZONA_POR_CONDUCTOR[value] ?? prev.zona
      }
      return next
    })
    setVerified((v) => ({ ...v, [key]: false }))
    setSaved(false)
  }

  function handleConfirm(key: string) {
    setVerified((v) => ({ ...v, [key]: true }))
  }

  const warnFields = Object.keys(confidence).filter(
    (k) => confidence[k] === 'low' && !verified[k]
  )
  const allOk = warnFields.length === 0

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ ...data, campos_verificados: verified })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card mb-4">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">#{index + 1}</span>
          <span className="text-sm font-medium truncate">{data.establecimiento || 'Sin establecimiento'}</span>
          {data.localidad && <span className="text-xs text-gray-500">{data.localidad}</span>}
        </div>
        <div className="flex items-center gap-2">
          {warnFields.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
              {warnFields.length} campo{warnFields.length > 1 ? 's' : ''} a revisar
            </span>
          )}
          {saved && (
            <span className="text-xs bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded-full">Guardado</span>
          )}
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500 text-lg leading-none transition-colors" title="Eliminar">×</button>
        </div>
      </div>

      <div className="p-4 flex gap-4">
        {/* Miniatura imagen */}
        <div className="shrink-0">
          <button onClick={() => setImgExpanded(!imgExpanded)} className="block">
            <img
              src={imageUrl}
              alt={`Albarán ${index + 1}`}
              className="w-20 h-24 object-cover rounded border border-gray-200 hover:opacity-90 transition-opacity"
            />
          </button>
        </div>

        {/* Campos */}
        <div className="flex-1 space-y-4">
          {/* Fila 1: establecimiento, localidad, CIF, fecha */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Establecimiento" fieldKey="establecimiento" value={data.establecimiento} state={getState('establecimiento')} onChange={handleChange} onConfirm={handleConfirm} />
            <FieldInput label="Localidad" fieldKey="localidad" value={data.localidad} state={getState('localidad')} onChange={handleChange} onConfirm={handleConfirm} />
            <FieldInput label="CIF" fieldKey="cif" value={data.cif} state={getState('cif')} onChange={handleChange} onConfirm={handleConfirm} />
            <FieldInput label="Fecha documento" fieldKey="fecha_documento" value={data.fecha_documento} state={getState('fecha_documento')} onChange={handleChange} onConfirm={handleConfirm} />
          </div>

          {/* Fila 2: conductor, zona */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Conductor"
              fieldKey="conductor"
              value={data.conductor}
              state={getState('conductor')}
              onChange={handleChange}
              onConfirm={handleConfirm}
              type="select"
              options={ALL_CONDUCTORES}
            />
            <FieldInput label="Zona" fieldKey="zona" value={data.zona} state={getState('zona')} onChange={handleChange} onConfirm={handleConfirm} />
          </div>

          {/* Bidones */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Bidones recogidos" fieldKey="bidones_recogidos" value={data.bidones_recogidos} state={getState('bidones_recogidos')} onChange={handleChange} onConfirm={handleConfirm} />
            <FieldInput label="Bidones entregados" fieldKey="bidones_entregados" value={data.bidones_entregados} state={getState('bidones_entregados')} onChange={handleChange} onConfirm={handleConfirm} />
          </div>

          {/* Productos */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Productos entregados</p>
            <div className="grid grid-cols-4 gap-2">
              {PRODUCT_FIELDS.map(({ key, label }) => (
                <FieldInput key={key} label={label} fieldKey={key} value={(data as Record<string, string>)[key] ?? ''} state={getState(key)} onChange={handleChange} onConfirm={handleConfirm} compact />
              ))}
            </div>
          </div>

          {/* Otros */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Otros</p>
            <div className="grid grid-cols-4 gap-2">
              {OTROS_FIELDS.map(({ key, label }) => (
                <FieldInput key={key} label={label} fieldKey={key} value={(data as Record<string, string>)[key] ?? ''} state={getState(key)} onChange={handleChange} onConfirm={handleConfirm} compact />
              ))}
            </div>
          </div>
        </div>
      </div>

      {imgExpanded && (
        <div className="px-4 pb-4">
          <img src={imageUrl} alt="Albarán ampliado" className="w-full rounded border border-gray-200 max-h-96 object-contain" />
        </div>
      )}

      <div className="px-4 pb-4 flex justify-end gap-2">
        {!allOk && (
          <p className="text-xs text-amber-700 mr-auto self-center">
            Revisa los campos marcados en amarillo antes de guardar
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="btn-primary text-sm px-5 py-2"
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar en histórico'}
        </button>
      </div>
    </div>
  )
}
