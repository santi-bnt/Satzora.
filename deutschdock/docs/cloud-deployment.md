# Preparación del despliegue: pendiente de implementación

**No desplegar como aplicación pública todavía.** La aplicación actual utiliza una sola base SQLite y un solo perfil por servidor. Las funciones de Vercel no proporcionan una base persistente compartida y la API actual no autentica usuarios. El `buildCommand` de `vercel.json` detiene el despliegue de forma deliberada hasta que exista y se pruebe una implementación multiusuario. El build local `npm run build` continúa funcionando.

## Estado de este espacio

- El proyecto está en `WortWerk/deutschdock`, dentro del repositorio local cuyo remoto es `santi-bnt/WortWerk`; el directorio de la aplicación aparece sin seguimiento en Git. No se ha verificado una conexión con el repositorio mencionado como `deutsch-lernen`.
- No se ha vinculado un proyecto de Vercel ni uno de Supabase; no existe una URL pública verificada. No hay herramientas conectadas de Vercel o Supabase en esta sesión.
- La migración `supabase/migrations/202611080001_initial_private_data.sql` es una base propuesta, no aplicada ni conectada a la aplicación. Su RLS y la prueba `supabase/tests/private_data.test.sql` requieren una base Supabase de prueba; la prueba no se ha ejecutado aquí.

## Trabajo técnico imprescindible antes de quitar el bloqueo

1. Implementar Supabase Auth, recuperación de contraseña, cierre y persistencia de sesión; limitar las redirecciones a los orígenes autorizados de Production y Preview.
2. Sustituir el acceso SQLite compartido en **todos** los endpoints por operaciones multiusuario con token verificado y RLS, sin perder temporizadores, grabaciones, ejercicios, resultados ni vocabulario anterior. El SQL solo prepara tablas: no implementa esta integración.
3. Implementar invitado realmente aislado por navegador, exportación/importación explícita y reanudable del progreso SQLite anterior, con IDs estables y deduplicación. La base SQLite actual pertenece al servidor, no a cada visitante.
4. Añadir control de concurrencia por versión para datos editables, cola de escritura, reintentos y presentación de conflictos. La columna `revision` es solo una preparación: el SQL todavía no obliga a usarla. Probar modificaciones concurrentes desde dos dispositivos, sin basarse en el reloj del cliente.
5. Adaptar grabaciones a un bucket privado y conservar controles de autorización en cada operación. Los audios educativos y las imágenes estáticas versionados pueden servirse como assets; las grabaciones personales no deben ser públicas.
6. Ejecutar migración y pruebas RLS contra una instancia aislada con dos usuarios reales; añadir pruebas de Storage, expiración de tokens, duplicados, desconexión y recuperación. Las comprobaciones estáticas del repositorio no prueban la seguridad de Postgres.
7. Solo después de validar todo, sustituir el bloqueo de `scripts/verify-cloud-ready.js` por comprobaciones reales y desplegar primero Preview.

## Vinculación posterior

Cuando el código esté listo, el propietario debe elegir el repositorio GitHub autorizado, conectar ese repositorio con Vercel y seleccionar `deutschdock` como **Root Directory** si se utiliza el repositorio actual. La rama principal se configura como Production y las ramas/PR como Preview. En Supabase deben crearse proyectos o entornos separados para Preview y Production, aplicar las migraciones y configurar Site URL y Redirect URLs sin comodines más amplios de lo necesario. Seguir las instrucciones oficiales de [Vercel para monorepos](https://vercel.com/docs/monorepos) y [redirecciones de Supabase Auth](https://supabase.com/docs/guides/auth/redirect-urls).

Las variables previstas son `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para el cliente, y `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL`, `OPENAI_TRANSCRIBE_MODEL` y `OPENAI_SPEECH_MODEL` exclusivamente del lado servidor si se habilitan los servicios opcionales. Las variables Supabase aún no son consumidas por el código; no existe un flujo funcional de login. No enviar credenciales por chat ni incluir claves secretas o service-role en el navegador o Git.

## Verificación pendiente en Preview y Production

Registro, confirmación de correo, recuperación, cierre y entrada; aislamiento cruzado con dos cuentas; importar sin duplicados; guardado y recuperación de una lección, un simulacro y una flashcard; reintentos y conflicto entre dispositivos; audio, grabaciones privadas, móvil y accesibilidad; auditoría del bundle y variables; URL HTTPS desde computadora y teléfono. Se requiere una instancia y dispositivos disponibles para ejecutar estas pruebas.
