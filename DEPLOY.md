# Despliegue de Albaranes Sercampo

## 1. Supabase — crear base de datos

1. Ir a https://supabase.com → nuevo proyecto
2. SQL Editor → New Query → pegar contenido de `supabase/schema.sql` → Run
3. Copiar en Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Gemini API Key (gratis)

1. Ir a https://aistudio.google.com/app/apikey
2. Crear API key → copiar como `GEMINI_API_KEY`

## 3. GitHub

```bash
cd sercampo-albaranes
git init
git add .
git commit -m "feat: app inicial albaranes sercampo"
git remote add origin https://github.com/sercampo-app/albaranes-sercampo.git
git push -u origin main
```

## 4. Vercel

1. Ir a https://vercel.com → New Project → importar repo de GitHub
2. En "Environment Variables" añadir las 3 variables:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

## Variables de entorno locales (.env.local)

```
GEMINI_API_KEY=tu_clave_gemini
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Desarrollo local

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```
