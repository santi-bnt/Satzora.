# Satzora · Goethe A2 Intensiv

Preparación personal para el **Goethe-Zertifikat A2 para adultos**, ampliando la aplicación React + TypeScript + Vite / Express + SQLite existente. Interfaz española e inglesa, sin itinerario introductorio obligatorio. Sin afiliación con el Goethe-Institut.

**Despliegue online pendiente:** la aplicación todavía usa un perfil y una base SQLite compartidos, sin cuentas ni sincronización. La migración inicial de Supabase y las tareas necesarias están en [la guía de despliegue](docs/cloud-deployment.md). Vercel tiene un bloqueo deliberado de compilación hasta completar y comprobar el aislamiento por usuario; no hay una URL pública verificada.

## Ejecutar

Node.js 26 y npm; verificado con Node.js 26.13. También se admiten las ramas Node.js 22 desde 22.22.2 y Node.js 24 desde 24.15.0, según los requisitos de las dependencias de pruebas.

```powershell
cd deutschdock
npm ci
npm run dev
```

Vite muestra la dirección de desarrollo (normalmente http://127.0.0.1:5173); el mismo comando inicia la API en http://127.0.0.1:3001.

```powershell
npm run build
npm start
```

La compilación completa se sirve en http://127.0.0.1:3001. `PORT` permite cambiar el puerto; en desarrollo ajusta también el proxy de `vite.config.ts`.

## Inventario comprobado

| Módulo | Lecciones | Actividades |
| --- | ---: | ---: |
| Satzbau und Konnektoren | 8 | 120 |
| Vergangenheit | 8 | 120 |
| Die Fälle | 8 | 120 |
| Präpositionen | 8 | 120 |
| Verben | 8 | 120 |
| Adjektive und Pronomen | 8 | 120 |
| Arbeit und Kommunikation | 8 | 120 |
| Alltag und Reisen | 8 | 120 |
| Lesen, Hören und Schreiben | 8 | 120 |
| Goethe A2 Intensiv | 8 | 120 |
| **Total** | **80** | **1.200** |

Cada lección contiene objetivo, explicación española e inglesa, ocho ejemplos alemanes con anotaciones bilingües, un ejemplo de error frecuente, expresiones contextuales y quince actividades: elección, huecos, ordenación, transformación, corrección y producción escrita. Las primeras lecciones de preparación oral incluyen grabación. Las producciones escritas practican SMS de 20–30 palabras y correo de 30–40.

**Criterio de recuento:** las 1.200 actividades no son 1.200 textos independientes: el currículo usa 400 contextos base, reutilizados en distintos tipos de actividad; 25 ejercicios se sustituyeron por comprensión vinculada a documentos y grabaciones. Un constructor reutilizable utiliza frases, focos y distractores explícitos. El informe [docs/content-validation.json](docs/content-validation.json) enumera las 80 lecciones y cantidades; no quedan módulos vacíos según la validación estructural. Esta validación no equivale a una certificación lingüística externa ni demuestra que todas las soluciones posibles estén reconocidas.

Hay **tres modelos originales**, con 45 tareas cada uno (20 Lesen, 20 Hören, dos Schreiben y tres Sprechen) y 36 archivos de audio de examen. El banco de práctica reutiliza sus materiales y añade contenido independiente. Las tareas del simulador no se suman a las 1.200 actividades de lección. No se han copiado textos ni audios de Goethe.

El inventario reproducible [docs/bank-validation.json](docs/bank-validation.json) cuenta **20 materiales de lectura, 12 actividades de audición, 28 consignas de escritura y 86 tarjetas orales** agrupadas en 41 actividades. Incluye los materiales de los tres simulacros, sin volver a sumarlos como contenido independiente. Faltan 80 materiales de lectura, 88 actividades de audición, 122 consignas de escritura, 114 tarjetas orales y siete simulacros respecto a los objetivos solicitados. Las cifras representan materiales que superan controles estructurales, no una revisión editorial o una garantía de ausencia de ambigüedades.

## Funciones

### Wortschatz – Flashcards

La sección nueva incluye **20 tarjetas iniciales** con traducción española e inglesa y dos ejemplos originales; faltan 480 para el objetivo inicial de 500. Las palabras guardadas desde el diccionario también aparecen como tarjetas personales, con la oración de origen cuando se seleccionan desde un texto. Estas entradas anteriores no se cuentan como parte del lote de dos ejemplos. El diccionario permanece desactivado durante un examen activo.

El algoritmo es una adaptación documentada de SM-2, no una implementación idéntica: «otra vez» programa 10 minutos y reinicia la racha; en los aciertos iniciales se usan intervalos de 1 y 6 días para «bien», 1 y 3 para «difícil», y 4 y 8 para «fácil». Después, se multiplican por un factor mínimo de facilidad de 1,3 (difícil usa 1,2; fácil, facilidad × 1,3). Se marca dominio tras al menos tres aciertos consecutivos y un intervalo de 21 días. Las opciones de nuevas y repasos diarios empiezan en 10 y 30 y se pueden modificar. En sentido inverso, los sustantivos aceptan su artículo correcto u omitirlo; se normalizan mayúsculas, espacios y Unicode, pero no se sustituyen diéresis ni ß.

Los repasos y su historial se guardan en SQLite local sin modificar el repaso anterior. No hay autenticación ni sincronización entre dispositivos: solo se comparten si acceden al mismo servidor y base de datos. La pronunciación necesita una voz alemana disponible en el navegador. La validación automática comprueba campos y ejemplos; no sustituye una revisión lingüística externa.

- Catálogo con búsqueda, filtros de tema/dificultad/habilidad/estado, acceso libre, repetición, reanudación y pruebas de repaso por módulo.
- Banco de práctica con filtros por habilidad, parte y tema, selección que evita actividades recientes, repetición de errores e historial persistido. Las respuestas modelo de producción se muestran después de un intento.
- A2 Intensiv: 15, 30, 45 o 60 minutos, entrenamiento general o por habilidad/gramática. Se priorizan temas débiles, preguntas no vistas y dificultad según los últimos tres resultados objetivos. Es una heurística de estudio, no una predicción de aprobado.
- Meine Fehler: errores de la última respuesta objetiva por actividad, clasificados por tema, con explicaciones y entrenamiento relacionado. Las producciones libres no se marcan incorrectas por no coincidir con un modelo.
- Estadísticas basadas en intentos persistidos. Completada significa finalizada con todas las respuestas; dominio refleja aciertos de referencia en ejercicios cerrados. Los ordenamientos alternativos no reconocidos quedan por revisar.
- Diccionario al tocar palabras, lemas e inflexiones conocidas (`gefahren → fahren`, `Terminen → Termin`), traducción española/inglesa, ejemplo, pronunciación y guardado. Es local y curado, no universal: una palabra desconocida se indica como tal.
- Vocabulario anterior conservado y repaso espaciado: 1, 3, 7, 15 y hasta 30 días para palabras recordadas; las difíciles vuelven al día siguiente.
- Idioma y tema claro/oscuro persistidos. Los textos de aprendizaje, títulos de módulos y nombres de habilidades permanecen intencionalmente en alemán.
- Grabación con MediaRecorder, almacenamiento y reproducción local. Requiere navegador compatible y HTTPS o localhost; siempre se puede escribir una respuesta.

## Simulador y evaluación

Referencia estructural del modelo público para adultos:

- Lesen: 30 minutos, cuatro partes de cinco preguntas (artículo, información, correo y anuncios; una correspondencia sin solución).
- Hören: 30 minutos, cuatro partes de cinco preguntas, límites de reproducción 2 / 1 / 1 / 2. La segunda parte utiliza nueve pictogramas y la tercera elección de imágenes. Los pictogramas son emojis originales; su aspecto depende del dispositivo.
- Schreiben: 30 minutos, SMS de 20–30 y correo de 30–40 palabras; tres puntos comunicativos por tarea.
- Sprechen: unos 15 minutos para dos participantes, preguntas personales, tema cotidiano y planificación compartida.

Practice Mode permite ayudas, diccionario y repeticiones. Exam Mode conserva fechas límite en el servidor, bloquea edición de secciones fuera de su horario y oculta diccionario, transcripciones y correcciones hasta terminar. Un simulacro completo usa ventanas consecutivas de 30 + 30 + 30 + 15 minutos; al caducar se evalúan respuestas guardadas. Los clips se inician manualmente y no reproducen la duración ni el ritmo completo de una sesión oficial: el resto del tiempo es para lectura y respuesta. El navegador no es un sistema inviolable contra trampas.

La corrección cerrada tolera puntuación, mayúsculas y espacios. Las transformaciones/correcciones piden conservar el resto de la frase. En ordenación, una alternativa no reconocida queda pendiente en lugar de marcarse mal automáticamente. Escritura y habla se guardan; sin servicios externos solo reciben una **lista de comprobación local orientativa**. Contar palabras y conectores **no evalúa por sí mismo** gramática, cumplimiento, coherencia o pronunciación. No se inventan notas Goethe ni certificados.

## Voz y corrección avanzada opcionales

Copia `.env.example` a `.env` y configura una clave propia en `OPENAI_API_KEY`. Para corrección y conversación, configura también un modelo de texto disponible en tu cuenta en `OPENAI_TEXT_MODEL`. Reinicia el servidor. Nunca pongas claves en variables `VITE_`.

- `OPENAI_API_KEY`: transcripción mediante la API de audio.
- `OPENAI_TEXT_MODEL`: con la clave activa feedback de consigna, gramática, vocabulario, coherencia y registro, y diálogo con el interlocutor.
- `OPENAI_TRANSCRIBE_MODEL`: modelo de transcripción; el ejemplo usa `gpt-4o-mini-transcribe`.

Solo se envía contenido al pulsar la acción correspondiente. El feedback se conserva en la sesión; las transcripciones, con la grabación. La transcripción textual no permite juzgar pronunciación. La conversación es por turnos explícitos, no una llamada simultánea; la pronunciación del interlocutor usa las voces del navegador. Sin servicio, se puede grabar, escuchar y practicar con otra persona sin fingir un interlocutor inteligente.

Documentación: [Responses](https://developers.openai.com/api/docs/guides/text), [transcripción](https://developers.openai.com/api/docs/guides/speech-to-text). Los adaptadores se prueban con respuestas controladas, sin llamadas facturables. No se ha verificado una sesión con credenciales externas reales.

## Datos y compatibilidad

La base sigue en `data/deutsch-lernen.sqlite`; `DATA_DIR` cambia el directorio. Se añaden tablas `a2_*` sin borrar `completions`, `activity`, `reviews` ni el perfil. Los endpoints anteriores siguen disponibles para compatibilidad, pero el curso A1 ya no aparece en la experiencia principal. No se añadió B1.

Los textos se autoguardan en SQLite y tienen un borrador local de respaldo por sesión. Los plazos no se reinician al recargar. El tiempo registrado es tiempo transcurrido, limitado a la duración de sesión, no una medición de atención activa; las estadísticas históricas conservan su significado original. La fecha diaria usa `America/Mexico_City`.

La aplicación mantiene un solo perfil por servidor y escucha en localhost. No añade autenticación multiusuario. Las grabaciones permanecen en la base local: tenlo en cuenta al compartir o respaldar esa base.

## Validación reproducible

```powershell
npm run validate:content
npm run validate:exams
npm run validate:bank
npm test
npm run test:ui
npm run build
npm audit --json
```

Última ejecución: **50 pruebas de servidor/contenido y tres pruebas de componentes correctas**, validaciones y compilación correctas. Se comprueban estructura bilingüe, formatos, respuestas, duplicados, referencias de audio, límites y temporizadores, guardado/reanudación, vocabulario, errores, ausencia de servicios configurados y conservación del historial. Dos pruebas de React + JSDOM usan una API real aislada; la prueba de interacción de flashcards usa respuestas de API simuladas.

Los MP3 tienen verificación de tamaño, duración y señal decodificada; el inventario está en `public/audio/manifest.json`. **QA manual pendiente:** revisión editorial de correspondencia y ambigüedad, escucha humana, altavoces, permisos y grabación real de micrófono, inspección visual y desbordamientos en dispositivos físicos. Las pruebas de componentes no sustituyen esas comprobaciones.

Para regenerar los audios: `node scripts/audio-manifest.js`, instalar `edge-tts` y `mutagen` en Python y ejecutar `python scripts/generate_audio.py`. La generación requiere red; los MP3 incluidos se reproducen sin proveedor de IA ni voz instalada.

## Referencias públicas

- [Información oficial para adultos](https://www.goethe.de/ins/de/de/prf/gzsd2.cfm).
- Modelo público: [Lesen](https://bfu.goethe.de/a2_mod_2MX5/lesen.php), [Hören](https://bfu.goethe.de/a2_mod_2MX5/hoeren.php), [Schreiben](https://bfu.goethe.de/a2_mod_2MX5/schreiben.php), [Sprechen](https://bfu.goethe.de/a2_mod_2MX5/sprechen.php).
