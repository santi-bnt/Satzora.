# Satzora cloud y estado del despliegue

## Estado actualizado

La aplicacion y la API Express viven en la raiz del repositorio. La funcion catch-all de Vercel esta en `../api/[...path].js`. En Vercel, las rutas heredadas con SQLite responden `401 sign_in_required`; las rutas autenticadas `/api/a2/cloud/*` y `/api/a2/cloud-study/*` verifican el JWT y aplican RLS.

La restricción aparece al abrir la aplicación web: pide iniciar sesión para estudiar y recuperar progreso. El modo invitado sigue funcionando en el servidor local. Añadí exportación JSON local e importación explícita a una cuenta para sesiones, respuestas, resultados recalculados, palabras guardadas, estado e historial de flashcards, límites diarios y grabaciones de voz. La importación es idempotente; inserta solo filas nuevas, valida las grabaciones y las guarda en el bucket privado usando la sesión normal del usuario. El SQLite original permanece intacto.

La función serverless y sus protecciones tienen pruebas locales automatizadas, pero la importación todavía requiere una comprobación contra Supabase y el endpoint no se ha probado bajo `vercel dev` ni en un Preview desplegado. Vercel CLI no está instalado en este entorno. Se mantiene el bloqueo del build de Vercel hasta probar la importación real y verificar Preview. No se ha desplegado ni se afirma que la URL pública esté operativa.

## Comprobación real del 8 de noviembre de 2026

Se verificaron las ocho tablas privadas, RLS, sus políticas por propietario, la configuración de Storage y los permisos de sesión. Se guardaron respaldos PostgreSQL locales y se verificó su catálogo con `pg_restore --list`. Las migraciones `202611080001` a `202611080003` se reconciliaron sin volver a ejecutarlas. La `202611080004` se probó en PostgreSQL local y se aplicó mediante la CLI después de otro respaldo.

Con dos cuentas de prueba reales se verificaron el inicio de sesión, la persistencia de una palabra, un repaso y su fecha, el reintento idempotente y la separación frente a lectura, inserción, actualización y borrado desde otra cuenta. También se comprobó directamente la persistencia de una sesión y la detección de una revisión obsoleta. El código de peticiones del frontend recuperó la palabra y el repaso reales en una prueba con JSDOM. Las pruebas reales se ejecutan con los scripts `test-cloud-flashcards-live.mjs`, `test-cloud-sessions-live.mjs` y `test-cloud-frontend-live.mjs`; utilizan cuentas de prueba y no deben ejecutarse con cuentas de estudiantes.

**Actualización:** al iniciar sesión, la interfaz utiliza Supabase para perfil, preferencias, sesiones, resultados, estadísticas, palabras, flashcards y grabaciones privadas. Una prueba con dos contextos de navegador independientes verificó la recuperación de una lección y un repaso, además de Lesen, Hören, Schreiben y grabación de Sprechen. Las pruebas RLS verificaron aislamiento con otra cuenta. El invitado local sigue usando SQLite. Los datos de prueba creados en Supabase permanecen en las cuentas de prueba.

**No desplegar todavia.** El invitado local usa SQLite y no persiste en funciones serverless; la version web requiere iniciar sesion. La exportacion/importacion esta implementada, pero la importacion real aun debe probarse contra Supabase. La API tampoco se ha verificado en Preview; el build conserva el bloqueo deliberado.

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
