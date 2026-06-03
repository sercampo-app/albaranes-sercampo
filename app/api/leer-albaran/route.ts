import { NextRequest, NextResponse } from 'next/server'
import { ALL_CONDUCTORES, ZONA_POR_CONDUCTOR } from '@/lib/types'

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

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type

    const contextExtra = conductoresInfo
      ? `\nContexto adicional sobre estilos de letra de conductores:\n${conductoresInfo}`
      : ''

    const prompt = SYSTEM_PROMPT + contextExtra

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Error de la API de Gemini: ${response.status}` },
        { status: 500 }
      )
    }

    const geminiData = await response.json()
    const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    if (!text) {
      return NextResponse.json({ error: 'Respuesta vacía de la IA' }, { status: 500 })
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Respuesta inválida de la IA' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

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
