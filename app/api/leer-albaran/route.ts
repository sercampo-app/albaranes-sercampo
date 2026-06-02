import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ALL_CONDUCTORES, ZONA_POR_CONDUCTOR } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `Eres un experto en leer albaranes manuscritos de Sercampo, empresa de recogida de aceites vegetales usados.
Extrae TODOS los campos del formulario. Si un campo está en blanco o es ilegible, devuelve cadena vacía "".
Para el conductor, identifica por el estilo de letra y el contexto. Conductores posibles: Julián, Rafa, Antonio, Jorge (zona Cuenca), David, Toni, Ángel (zona Ciudad Real/Toledo).
Los productos tienen formato: número = unidades, número+C = cajas, número+P = paquetes.
El nombre del establecimiento es siempre un bar o restaurante.

Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta estructura exacta:
{
  "fecha_documento": "DD/MM/YYYY o texto tal como aparece",
  "establecimiento": "nombre del bar/restaurante",
  "localidad": "ciudad/pueblo",
  "cif": "CIF del negocio",
  "conductor": "nombre del conductor o vacío si no se identifica",
  "zona": "Cuenca o Ciudad Real / Toledo o vacío",
  "bidones_recogidos": "número",
  "bidones_entregados": "número",
  "desengrasantes": "cantidad o vacío",
  "fregasuelos": "cantidad o vacío",
  "lavavajillas": "cantidad o vacío",
  "jabon_manos": "cantidad o vacío",
  "higienizantes": "cantidad o vacío",
  "wc_banos": "cantidad o vacío",
  "l_cristales": "cantidad o vacío",
  "lejias": "cantidad o vacío",
  "filtros": "cantidad o vacío",
  "bayetas": "cantidad o vacío",
  "dinero": "cantidad o vacío",
  "otros": "texto o vacío",
  "confidence": {
    "fecha_documento": "high o low",
    "establecimiento": "high o low",
    "localidad": "high o low",
    "cif": "high o low",
    "conductor": "high o low",
    "bidones_recogidos": "high o low",
    "bidones_entregados": "high o low",
    "desengrasantes": "high o low",
    "fregasuelos": "high o low",
    "lavavajillas": "high o low",
    "jabon_manos": "high o low",
    "higienizantes": "high o low",
    "wc_banos": "high o low",
    "l_cristales": "high o low",
    "lejias": "high o low",
    "filtros": "high o low",
    "bayetas": "high o low",
    "dinero": "high o low",
    "otros": "high o low"
  }
}`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('imagen') as File | null
    const conductoresInfo = formData.get('conductoresInfo') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const contextExtra = conductoresInfo
      ? `\nContexto adicional sobre estilos de letra de conductores:\n${conductoresInfo}`
      : ''

    const result = await model.generateContent([
      SYSTEM_PROMPT + contextExtra,
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
    ])

    const text = result.response.text().trim()

    // Extraer JSON de la respuesta (puede venir entre ```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Respuesta inválida de la IA' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Completar zona si falta
    if (parsed.conductor && !parsed.zona) {
      const conductorName = ALL_CONDUCTORES.find(
        (c) => c.toLowerCase() === parsed.conductor?.toLowerCase()
      )
      if (conductorName) {
        parsed.zona = ZONA_POR_CONDUCTOR[conductorName] ?? ''
      }
    }

    return NextResponse.json({ data: parsed })
  } catch (err) {
    console.error('Error en leer-albaran:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
