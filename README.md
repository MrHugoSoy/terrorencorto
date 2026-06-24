# Terror en Corto

Archivo de testimonios de terror con registro de usuarios, modo autor/incógnito,
moderación y selección de historias para narrar en el canal de YouTube @terrorencorto.

## 1. Supabase

1. Crea un proyecto en https://supabase.com (gratis para empezar).
2. Ve a SQL Editor → pega y corre todo el contenido de `supabase/schema.sql`.
3. Ve a Project Settings → API y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Ve a Authentication → Providers y confirma que "Email" esté habilitado.
   - Para desarrollo rápido, en Authentication → Settings puedes desactivar
     "Confirm email" para no depender de SMTP mientras pruebas.

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y llena los dos valores de Supabase.

## 3. Correr en local

```bash
npm install
npm run dev
```

## 4. Volverte admin

1. Regístrate normal desde `/registro`.
2. En el SQL Editor de Supabase corre:
   ```sql
   update public.profiles set is_admin = true where username = 'tu_username';
   ```
3. Ya puedes entrar a `/admin`.

## 5. Deploy en Vercel

1. Sube este proyecto a un repo de GitHub.
2. Entra a https://vercel.com → "Add New Project" → importa el repo.
3. En "Environment Variables" agrega las mismas dos variables de `.env.local`.
4. Deploy.
5. En Supabase → Authentication → URL Configuration, agrega la URL de Vercel
   a "Site URL" y "Redirect URLs" (si no lo haces, el login en producción falla).

## Flujo de contenido pensado para el canal

- Usuario envía historia → cae en estado `pendiente`.
- Tú revisas en `/admin`.
- `publicado` = aparece en el sitio público.
- `seleccionado_canal` = además entra a tu cola de guiones para grabar.
- Cuando subes el video, pegas el link en el mismo panel y cambias a `usado_canal`.
- El checkbox de consentimiento (`channel_consent`) queda guardado por historia,
  independiente del modo (autor/incógnito) — es tu respaldo de que el usuario
  autorizó el uso, sin importar si su nombre aparece o no.

## Pendientes recomendados (no bloqueantes para lanzar)

- Página `/perfil` para que cada usuario vea el estado de sus propios envíos.
- Notificación por correo cuando una historia cambia de estado (Resend).
- Rate limiting en `/enviar` para evitar spam de envíos (Upstash, igual que en Resumika).
- Página `/membresia` si decides monetizar directo en el sitio más adelante.
