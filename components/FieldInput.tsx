'use client'

interface FieldInputProps {
  label: string
  fieldKey: string
  value: string
  state: 'normal' | 'warn' | 'confirmed'
  onChange: (key: string, value: string) => void
  onConfirm: (key: string) => void
  type?: 'text' | 'select'
  options?: string[]
  compact?: boolean
}

const STATE_CLS: Record<string, string> = {
  normal: 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-gray-300',
  warn:   'bg-amber-50 border-amber-300 text-amber-900 focus:ring-amber-300',
  confirmed: 'bg-green-50 border-green-300 text-green-900 focus:ring-green-300',
}

const STATE_ICON: Record<string, string | null> = {
  normal: null,
  warn: '⚠',
  confirmed: '✓',
}

const ICON_CLS: Record<string, string> = {
  warn: 'text-amber-500',
  confirmed: 'text-green-600',
}

export default function FieldInput({
  label, fieldKey, value, state, onChange, onConfirm,
  type = 'text', options = [], compact = false,
}: FieldInputProps) {
  const inputCls = `w-full border rounded-md text-sm px-2 py-1.5 focus:outline-none focus:ring-1 transition-colors ${STATE_CLS[state]}`

  return (
    <div className={compact ? '' : 'flex flex-col gap-1'}>
      <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
        {label}
        {STATE_ICON[state] && (
          <span className={`text-xs ${ICON_CLS[state]}`}>{STATE_ICON[state]}</span>
        )}
      </label>
      {type === 'select' ? (
        <select
          className={inputCls}
          value={value}
          onChange={(e) => { onChange(fieldKey, e.target.value); onConfirm(fieldKey) }}
        >
          <option value="">— seleccionar —</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          className={inputCls}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          onBlur={() => { if (value.trim()) onConfirm(fieldKey) }}
        />
      )}
    </div>
  )
}
