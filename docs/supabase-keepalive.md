# Keep-alive de Supabase

El workflow `.github/workflows/supabase-keepalive.yml` ejecuta diariamente a las 12:23 UTC y se puede lanzar manualmente desde **Actions → Supabase keep-alive → Run workflow**. Envía un POST autenticado al endpoint de Vercel, que abre una conexión PostgreSQL con TLS y ejecuta únicamente `SELECT 1 AS ok`. Solo devuelve éxito si recibe el resultado esperado; no lee ni modifica datos de estudiantes. El workflow falla si falta configuración, falla la conexión o la respuesta es incorrecta. No se imprimen los errores internos, URL ni credenciales.

**Estado actual:** Satzora aún no tiene un despliegue funcional verificado; el build de Vercel conserva el bloqueo documentado en [cloud-deployment.md](cloud-deployment.md). El workflow y el endpoint no se pueden comprobar en producción hasta que el despliegue esté listo y las variables y el rol estén configurados. No eliminar el bloqueo únicamente para activar este mecanismo.

## Configuración de base de datos

1. Con una conexión administrativa, revisa `supabase/keepalive-role.sql` y crea el rol `satzora_keepalive`. Establece una contraseña aleatoria fuerte mediante `\password satzora_keepalive` en una sesión `psql` segura; no la incluyas en el archivo SQL, commits, capturas o mensajes. El rol tiene una transacción de solo lectura por defecto y no se le conceden tablas de estudiantes.
2. PostgreSQL otorga permisos a `PUBLIC` que también heredan los roles sin `INHERIT`. **Audita los permisos `PUBLIC` existentes** del proyecto antes de utilizar este rol; este script no revoca permisos globales ni garantiza que otras funciones existentes no sean ejecutables. Restringe cualquier permiso adicional que no se necesite sin afectar a la aplicación.
3. Obtén en Supabase la conexión de pooler compatible con el rol y usa el nombre de usuario de pooler correcto para el proyecto. La URL debe ser `postgresql://...`, sin parámetros `ssl*`: el endpoint exige verificación TLS. No se usa `service_role`.

## Secretos

En **Vercel → Project Settings → Environment Variables**, añade para Production:

- `KEEPALIVE_DATABASE_URL`: URL de PostgreSQL para el rol dedicado, con su contraseña. Solo servidor.
- `KEEPALIVE_TOKEN`: cadena aleatoria distinta de al menos 32 caracteres.

En **GitHub → Settings → Secrets and variables → Actions**, añade:

- `KEEPALIVE_URL`: URL HTTPS exacta del endpoint, por ejemplo `https://satzora.vercel.app/api/keepalive`, únicamente después de verificar el dominio.
- `KEEPALIVE_TOKEN`: el mismo token que en Vercel.

No uses prefijos `VITE_` ni coloques esos valores en Git o en el navegador. Cambiar variables de Vercel requiere un nuevo despliegue. Activa las notificaciones de fallos de Actions en GitHub. El registro muestra únicamente éxito o un error genérico, y no sigue redirecciones que puedan filtrar el token.

## Comprobación y reanudación

Cuando exista el despliegue, configura los secretos, ejecuta el workflow manualmente y revisa que el job termine correctamente. También comprueba que una petición sin token recibe 401 y que una conexión de base de datos incorrecta hace fallar el job. Si falla, puede deberse a credenciales, conexión, Vercel o a un proyecto pausado: el error no demuestra por sí solo que esté pausado. Para comprobarlo, abre [Supabase Dashboard](https://supabase.com/dashboard), selecciona la organización y el proyecto; si aparece pausado, pulsa **Resume project**. Después repite la ejecución manual.

Las ejecuciones programadas de GitHub pueden retrasarse y Supabase puede cambiar sus criterios; esto **no garantiza** evitar una pausa. Según [Supabase](https://supabase.com/docs/guides/platform/free-project-pausing), los proyectos de pago no están sujetos a la pausa automática por inactividad.
