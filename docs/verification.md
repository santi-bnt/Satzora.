# Verificación de la ampliación A2

Fecha del entorno: 7 de noviembre de 2026. Node.js 26.13.0.

| Comprobación ejecutada | Resultado |
| --- | --- |
| `npm run validate:content` | 10 módulos, 80 lecciones, 1.200 actividades, 400 contextos; cero errores estructurales |
| `npm test` | 36 pruebas correctas |
| `npm run test:ui` | Una prueba integrada correcta, React + JSDOM contra una API real en base temporal |
| `npm run build` | TypeScript y Vite correctos |
| `npm audit --json` | Cero vulnerabilidades informadas |
| HTTP de la aplicación local | 200; título A2 correcto |
| Inventario de la API local | 80 lecciones, 1.200 actividades y dos modelos |
| MP3 servido por HTTP | 200; archivo de prueba de 115.488 bytes |
| Inventario de audio | 34 MP3; duración, tamaño y frecuencia verificados con Mutagen |

La comprobación de contenido incluye cada uno de los diez módulos de ocho lecciones: formatos, objetivos, explicaciones en ambos idiomas, referencias de audio y soluciones. Los recuentos se generan desde el contenido, no desde cifras de demostración. Cada contexto origina tres actividades de formatos distintos; no hay 1.200 textos independientes.

La integración de servidor comprueba datos anteriores conservados, respuestas recuperadas tras reinicio, finalización idempotente, errores por tema, sesiones de cuatro duraciones, combinación de habilidades, cronómetro persistido, cierre al caducar, rechazo de edición fuera de sección, límites de escucha y guardado/recuperación de grabaciones. Los servicios opcionales se prueban con respuestas controladas y sin llamadas externas facturables.

La prueba de componentes comprueba catálogo, diccionario, modales anidados, guardado, navegación de actividades, reanudación, español/inglés y persistencia de tema. JSDOM no reproduce sonido, permisos de micrófono ni medidas de diseño reales.

Pendiente de comprobación manual: reproducción mediante altavoces, grabación con un micrófono físico, inspección visual y desbordamientos en móvil, una sesión con proveedor externo configurado y revisión lingüística independiente. El acceso a navegador y aplicaciones nativas no está disponible en esta sesión. No se presentan esas verificaciones como completadas ni se atribuyen notas oficiales a los resultados orientativos.
