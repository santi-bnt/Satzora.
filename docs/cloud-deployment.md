# Satzora: nube y estado del despliegue

## Estado actual — 8 de noviembre de 2026

El código se consolidó en la raíz y está vinculado al proyecto Vercel `santi-bnts-projects/satzora`. Las variables públicas de Supabase están configuradas para Preview y Production. `.env.local` y los archivos SQLite siguen excluidos de Git.

Se creó el Preview protegido `https://satzora-81mi8lucs-santi-bnts-projects.vercel.app`. El deployment está `READY`. La página respondió HTTP 200, `/api/health` respondió `{"status":"ok"}`, las solicitudes anónimas a estudio devolvieron 401, y una cuenta de prueba obtuvo HTTP 200 en el endpoint autenticado de flashcards. Una sesión de estudio de prueba se creó con HTTP 201 y se recuperó con HTTP 200 desde Supabase a través de la API Vercel.

Contra Supabase real, las cuentas de prueba A/B verificaron importación de sesión y flashcards, persistencia, reintentos idempotentes y aislamiento entre usuarios. No se usaron datos de estudiantes.

La web requiere iniciar sesión en producción. El modo invitado continúa disponible localmente en SQLite y puede importarse mediante la acción explícita de exportación/importación; no se sincroniza como invitado en Vercel. La copia SQLite original permanece intacta.

El endpoint Keep-Alive no está configurado aún: Vercel no tiene `KEEPALIVE_TOKEN` ni `KEEPALIVE_DATABASE_URL`, y no se creó una credencial de mínimo privilegio. Por tanto, el workflow de GitHub no debe activarse hasta configurar ambas variables en Vercel y `KEEPALIVE_URL`/`KEEPALIVE_TOKEN` en GitHub.

El deployment Preview sigue protegido por Vercel Authentication. No se cambió Production desde esta verificación.
## Estado anterior (conservado como referencia)

- La aplicación se consolidó en la raíz del repositorio local `WortWerk`; `package.json`, `vercel.json` y `api/` están en esa raíz. La base SQLite y su copia se conservaron en `data/`.
- No se ha vinculado un proyecto de Vercel ni uno de Supabase; no existe una URL pública verificada. No hay herramientas conectadas de Vercel o Supabase en esta sesión.
- El `vercel.json` de la raíz fija el preset **Other**, ejecuta `npm ci`, conserva el bloqueo de build y publica `dist/`. Configura Vercel con la raíz del repositorio como **Root Directory**; no se requiere una subcarpeta.
- El esquema inicial y la función de revisión se ejecutaron manualmente desde SQL Editor en el proyecto Supabase. El editor muestra las ocho tablas y las ocho solicitudes anónimas devolvieron HTTP 401. **No se registraron como migraciones de Supabase CLI**: no ejecutar de nuevo los dos archivos iniciales sin reconciliar el historial, pues las tablas ya existen. Falta ejecutar la prueba de aislamiento con dos usuarios y conectar la aplicación.
- Existe un panel inicial de cuenta conectado a Supabase Auth, con registro, acceso, recuperación y cierre de sesión. Sus llamadas se han probado con servicios simulados, no con una cuenta real. El panel advierte que el progreso sigue siendo local y todavía no se sincroniza. Vite busca la configuración local en `.env.local` de la raíz del repositorio.

## Trabajo técnico imprescindible antes de quitar el bloqueo

1. Decidir si la web seguira requiriendo cuenta o si se construira un modo invitado con almacenamiento del navegador. El invitado local sigue disponible mediante SQLite.
2. Probar exportacion/importacion contra Supabase con dos cuentas de prueba, incluidos conflictos, reintentos y grabaciones privadas.
3. Probar el entrypoint Express en Vercel Preview, los redirects de Auth y las variables. Confirmar que el navegador no expone secretos.
4. Ampliar las pruebas de desconexión y conflictos en dispositivos reales; la prueba con navegadores sin interfaz no sustituye una comprobación en Windows, Android y iPhone.
5. Solo despues de validar todo, actualizar el gate de `scripts/verify-cloud-ready.js` y verificar Preview.

## Vinculación posterior

Cuando el código esté listo, conecta el repositorio GitHub con Vercel y deja la raíz del repositorio como **Root Directory**. La rama principal se configura como Production y las ramas/PR como Preview. En Supabase deben crearse proyectos o entornos separados para Preview y Production, aplicar las migraciones y configurar Site URL y Redirect URLs sin comodines más amplios de lo necesario. Seguir las instrucciones oficiales de [Vercel para monorepos](https://vercel.com/docs/monorepos) y [redirecciones de Supabase Auth](https://supabase.com/docs/guides/auth/redirect-urls).

Las variables previstas son `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para el cliente, y `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL`, `OPENAI_TRANSCRIBE_MODEL` y `OPENAI_SPEECH_MODEL` exclusivamente del lado servidor si se habilitan los servicios opcionales. El panel inicial consume las variables Supabase, pero su flujo real no se ha verificado. No enviar credenciales por chat ni incluir claves secretas o service-role en el navegador o Git.

## Verificación pendiente en Preview y Production

Registro, confirmación de correo, recuperación, cierre y entrada; aislamiento cruzado con dos cuentas; importar sin duplicados; guardado y recuperación de una lección, un simulacro y una flashcard; reintentos y conflicto entre dispositivos; audio, grabaciones privadas, móvil y accesibilidad; auditoría del bundle y variables; URL HTTPS desde computadora y teléfono. Se requiere una instancia y dispositivos disponibles para ejecutar estas pruebas.
