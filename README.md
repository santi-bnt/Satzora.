# Satzora Â· Goethe A2 Intensiv

PreparaciÃ³n personal para el **Goethe-Zertifikat A2 para adultos**, ampliando la aplicaciÃ³n React + TypeScript + Vite / Express + SQLite existente. Interfaz espaÃ±ola e inglesa, sin itinerario introductorio obligatorio. Sin afiliaciÃ³n con el Goethe-Institut.

**Despliegue online pendiente:** las cuentas autenticadas usan Supabase; el invitado local usa SQLite. La importacion explicita a una cuenta esta implementada, pero aun requiere validacion real. En Vercel se requiere iniciar sesion porque SQLite no persiste entre funciones. El build conserva un bloqueo hasta completar las pruebas de Preview.

El workflow opcional de mantenimiento de Supabase, sus requisitos y limitaciones se describen en [Keep-alive de Supabase](docs/supabase-keepalive.md). AÃºn no estÃ¡ operativo en producciÃ³n mientras no exista el despliegue y no se configuren el rol y los secretos.

## Ejecutar

Node.js 26 y npm; verificado con Node.js 26.13. TambiÃ©n se admiten las ramas Node.js 22 desde 22.22.2 y Node.js 24 desde 24.15.0, segÃºn los requisitos de las dependencias de pruebas.

```powershell
npm ci
npm run dev
```

Vite muestra la direcciÃ³n de desarrollo (normalmente http://127.0.0.1:5173); el mismo comando inicia la API en http://127.0.0.1:3001.

```powershell
npm run build
npm start
```

La compilaciÃ³n completa se sirve en http://127.0.0.1:3001. `PORT` permite cambiar el puerto; en desarrollo ajusta tambiÃ©n el proxy de `vite.config.ts`.

## Inventario comprobado

| MÃ³dulo | Lecciones | Actividades |
| --- | ---: | ---: |
| Satzbau und Konnektoren | 8 | 120 |
| Vergangenheit | 8 | 120 |
| Die FÃ¤lle | 8 | 120 |
| PrÃ¤positionen | 8 | 120 |
| Verben | 8 | 120 |
| Adjektive und Pronomen | 8 | 120 |
| Arbeit und Kommunikation | 8 | 120 |
| Alltag und Reisen | 8 | 120 |
| Lesen, HÃ¶ren und Schreiben | 8 | 120 |
| Goethe A2 Intensiv | 8 | 120 |
| **Total** | **80** | **1.200** |

Cada lecciÃ³n contiene objetivo, explicaciÃ³n espaÃ±ola e inglesa, ocho ejemplos alemanes con anotaciones bilingÃ¼es, un ejemplo de error frecuente, expresiones contextuales y quince actividades: elecciÃ³n, huecos, ordenaciÃ³n, transformaciÃ³n, correcciÃ³n y producciÃ³n escrita. Las primeras lecciones de preparaciÃ³n oral incluyen grabaciÃ³n. Las producciones escritas practican SMS de 20â€“30 palabras y correo de 30â€“40.

**Criterio de recuento:** las 1.200 actividades no son 1.200 textos independientes: el currÃ­culo usa 400 contextos base, reutilizados en distintos tipos de actividad; 25 ejercicios se sustituyeron por comprensiÃ³n vinculada a documentos y grabaciones. Un constructor reutilizable utiliza frases, focos y distractores explÃ­citos. El informe [docs/content-validation.json](docs/content-validation.json) enumera las 80 lecciones y cantidades; no quedan mÃ³dulos vacÃ­os segÃºn la validaciÃ³n estructural. Esta validaciÃ³n no equivale a una certificaciÃ³n lingÃ¼Ã­stica externa ni demuestra que todas las soluciones posibles estÃ©n reconocidas.

Hay **tres modelos originales**, con 45 tareas cada uno (20 Lesen, 20 HÃ¶ren, dos Schreiben y tres Sprechen) y 36 archivos de audio de examen. El banco de prÃ¡ctica reutiliza sus materiales y aÃ±ade contenido independiente. Las tareas del simulador no se suman a las 1.200 actividades de lecciÃ³n. No se han copiado textos ni audios de Goethe.

El inventario reproducible [docs/bank-validation.json](docs/bank-validation.json) cuenta **20 materiales de lectura, 12 actividades de audiciÃ³n, 28 consignas de escritura y 86 tarjetas orales** agrupadas en 41 actividades. Incluye los materiales de los tres simulacros, sin volver a sumarlos como contenido independiente. Faltan 80 materiales de lectura, 88 actividades de audiciÃ³n, 122 consignas de escritura, 114 tarjetas orales y siete simulacros respecto a los objetivos solicitados. Las cifras representan materiales que superan controles estructurales, no una revisiÃ³n editorial o una garantÃ­a de ausencia de ambigÃ¼edades.

## Funciones

### Wortschatz â€“ Flashcards

La secciÃ³n nueva incluye **20 tarjetas iniciales** con traducciÃ³n espaÃ±ola e inglesa y dos ejemplos originales; faltan 480 para el objetivo inicial de 500. Las palabras guardadas desde el diccionario tambiÃ©n aparecen como tarjetas personales, con la oraciÃ³n de origen cuando se seleccionan desde un texto. Estas entradas anteriores no se cuentan como parte del lote de dos ejemplos. El diccionario permanece desactivado durante un examen activo.

El algoritmo es una adaptaciÃ³n documentada de SM-2, no una implementaciÃ³n idÃ©ntica: Â«otra vezÂ» programa 10 minutos y reinicia la racha; en los aciertos iniciales se usan intervalos de 1 y 6 dÃ­as para Â«bienÂ», 1 y 3 para Â«difÃ­cilÂ», y 4 y 8 para Â«fÃ¡cilÂ». DespuÃ©s, se multiplican por un factor mÃ­nimo de facilidad de 1,3 (difÃ­cil usa 1,2; fÃ¡cil, facilidad Ã— 1,3). Se marca dominio tras al menos tres aciertos consecutivos y un intervalo de 21 dÃ­as. Las opciones de nuevas y repasos diarios empiezan en 10 y 30 y se pueden modificar. En sentido inverso, los sustantivos aceptan su artÃ­culo correcto u omitirlo; se normalizan mayÃºsculas, espacios y Unicode, pero no se sustituyen diÃ©resis ni ÃŸ.

Los repasos e historial usan Supabase al iniciar sesiÃ³n y SQLite en el modo invitado local. La pronunciaciÃ³n necesita una voz alemana disponible en el navegador. La validaciÃ³n automÃ¡tica comprueba campos y ejemplos; no sustituye una revisiÃ³n lingÃ¼Ã­stica externa.

- CatÃ¡logo con bÃºsqueda, filtros de tema/dificultad/habilidad/estado, acceso libre, repeticiÃ³n, reanudaciÃ³n y pruebas de repaso por mÃ³dulo.
- Banco de prÃ¡ctica con filtros por habilidad, parte y tema, selecciÃ³n que evita actividades recientes, repeticiÃ³n de errores e historial persistido. Las respuestas modelo de producciÃ³n se muestran despuÃ©s de un intento.
- A2 Intensiv: 15, 30, 45 o 60 minutos, entrenamiento general o por habilidad/gramÃ¡tica. Se priorizan temas dÃ©biles, preguntas no vistas y dificultad segÃºn los Ãºltimos tres resultados objetivos. Es una heurÃ­stica de estudio, no una predicciÃ³n de aprobado.
- Meine Fehler: errores de la Ãºltima respuesta objetiva por actividad, clasificados por tema, con explicaciones y entrenamiento relacionado. Las producciones libres no se marcan incorrectas por no coincidir con un modelo.
- EstadÃ­sticas basadas en intentos persistidos. Completada significa finalizada con todas las respuestas; dominio refleja aciertos de referencia en ejercicios cerrados. Los ordenamientos alternativos no reconocidos quedan por revisar.
- Diccionario al tocar palabras, lemas e inflexiones conocidas (`gefahren â†’ fahren`, `Terminen â†’ Termin`), traducciÃ³n espaÃ±ola/inglesa, ejemplo, pronunciaciÃ³n y guardado. Es local y curado, no universal: una palabra desconocida se indica como tal.
- Vocabulario anterior conservado y repaso espaciado: 1, 3, 7, 15 y hasta 30 dÃ­as para palabras recordadas; las difÃ­ciles vuelven al dÃ­a siguiente.
- Idioma y tema claro/oscuro persistidos. Los textos de aprendizaje, tÃ­tulos de mÃ³dulos y nombres de habilidades permanecen intencionalmente en alemÃ¡n.
- GrabaciÃ³n con MediaRecorder, almacenamiento y reproducciÃ³n local. Requiere navegador compatible y HTTPS o localhost; siempre se puede escribir una respuesta.

## Simulador y evaluaciÃ³n

Referencia estructural del modelo pÃºblico para adultos:

- Lesen: 30 minutos, cuatro partes de cinco preguntas (artÃ­culo, informaciÃ³n, correo y anuncios; una correspondencia sin soluciÃ³n).
- HÃ¶ren: 30 minutos, cuatro partes de cinco preguntas, lÃ­mites de reproducciÃ³n 2 / 1 / 1 / 2. La segunda parte utiliza nueve pictogramas y la tercera elecciÃ³n de imÃ¡genes. Los pictogramas son emojis originales; su aspecto depende del dispositivo.
- Schreiben: 30 minutos, SMS de 20â€“30 y correo de 30â€“40 palabras; tres puntos comunicativos por tarea.
- Sprechen: unos 15 minutos para dos participantes, preguntas personales, tema cotidiano y planificaciÃ³n compartida.

Practice Mode permite ayudas, diccionario y repeticiones. Exam Mode conserva fechas lÃ­mite en el servidor, bloquea ediciÃ³n de secciones fuera de su horario y oculta diccionario, transcripciones y correcciones hasta terminar. Un simulacro completo usa ventanas consecutivas de 30 + 30 + 30 + 15 minutos; al caducar se evalÃºan respuestas guardadas. Los clips se inician manualmente y no reproducen la duraciÃ³n ni el ritmo completo de una sesiÃ³n oficial: el resto del tiempo es para lectura y respuesta. El navegador no es un sistema inviolable contra trampas.

La correcciÃ³n cerrada tolera puntuaciÃ³n, mayÃºsculas y espacios. Las transformaciones/correcciones piden conservar el resto de la frase. En ordenaciÃ³n, una alternativa no reconocida queda pendiente en lugar de marcarse mal automÃ¡ticamente. Escritura y habla se guardan; sin servicios externos solo reciben una **lista de comprobaciÃ³n local orientativa**. Contar palabras y conectores **no evalÃºa por sÃ­ mismo** gramÃ¡tica, cumplimiento, coherencia o pronunciaciÃ³n. No se inventan notas Goethe ni certificados.

## Voz y correcciÃ³n avanzada opcionales

Copia `.env.example` a `.env` y configura una clave propia en `OPENAI_API_KEY`. Para correcciÃ³n y conversaciÃ³n, configura tambiÃ©n un modelo de texto disponible en tu cuenta en `OPENAI_TEXT_MODEL`. Reinicia el servidor. Nunca pongas claves en variables `VITE_`.

- `OPENAI_API_KEY`: transcripciÃ³n mediante la API de audio.
- `OPENAI_TEXT_MODEL`: con la clave activa feedback de consigna, gramÃ¡tica, vocabulario, coherencia y registro, y diÃ¡logo con el interlocutor.
- `OPENAI_TRANSCRIBE_MODEL`: modelo de transcripciÃ³n; el ejemplo usa `gpt-4o-mini-transcribe`.

Solo se envÃ­a contenido al pulsar la acciÃ³n correspondiente. El feedback se conserva en la sesiÃ³n; las transcripciones, con la grabaciÃ³n. La transcripciÃ³n textual no permite juzgar pronunciaciÃ³n. La conversaciÃ³n es por turnos explÃ­citos, no una llamada simultÃ¡nea; la pronunciaciÃ³n del interlocutor usa las voces del navegador. Sin servicio, se puede grabar, escuchar y practicar con otra persona sin fingir un interlocutor inteligente.

DocumentaciÃ³n: [Responses](https://developers.openai.com/api/docs/guides/text), [transcripciÃ³n](https://developers.openai.com/api/docs/guides/speech-to-text). Los adaptadores se prueban con respuestas controladas, sin llamadas facturables. No se ha verificado una sesiÃ³n con credenciales externas reales.

## Datos y compatibilidad

La base local de invitado esta en `data/deutsch-lernen.sqlite`; `DATA_DIR` cambia el directorio. Tambien se conserva `data/backup-before-cloud-1794124894385.sqlite`. Los usuarios autenticados usan las tablas privadas `dl_*` de Supabase con RLS. Las rutas SQLite se bloquean en Vercel.

Los textos se autoguardan en Supabase para usuarios autenticados y en SQLite local para invitados, con un borrador local de respaldo por sesiÃ³n. Los plazos no se reinician al recargar. Los conflictos de revisiÃ³n no sobrescriben silenciosamente los datos remotos. El tiempo registrado es tiempo transcurrido, no una mediciÃ³n de atenciÃ³n activa. La fecha diaria usa `America/Mexico_City`.

La aplicaciÃ³n mantiene un solo perfil por servidor y escucha en localhost. No aÃ±ade autenticaciÃ³n multiusuario. Las grabaciones permanecen en la base local: tenlo en cuenta al compartir o respaldar esa base.

## ValidaciÃ³n reproducible

```powershell
npm run validate:content
npm run validate:exams
npm run validate:bank
npm test
npm run test:ui
npm run build
npm audit --json
```

Ultima ejecucion tras consolidar el proyecto en la raiz: **65 pruebas de servidor/contenido, 4 pruebas de interfaz y build correctos**. La exportacion SQLite se verifico en modo solo lectura y ambas bases devolvieron `integrity_check: ok`. La importacion real a Supabase y el Preview de Vercel siguen pendientes.

Los MP3 tienen verificaciÃ³n de tamaÃ±o, duraciÃ³n y seÃ±al decodificada; el inventario estÃ¡ en `public/audio/manifest.json`. **QA manual pendiente:** revisiÃ³n editorial de correspondencia y ambigÃ¼edad, escucha humana, altavoces, permisos y grabaciÃ³n real de micrÃ³fono, inspecciÃ³n visual y desbordamientos en dispositivos fÃ­sicos. Las pruebas de componentes no sustituyen esas comprobaciones.

Para regenerar los audios: `node scripts/audio-manifest.js`, instalar `edge-tts` y `mutagen` en Python y ejecutar `python scripts/generate_audio.py`. La generaciÃ³n requiere red; los MP3 incluidos se reproducen sin proveedor de IA ni voz instalada.

## Referencias pÃºblicas

- [InformaciÃ³n oficial para adultos](https://www.goethe.de/ins/de/de/prf/gzsd2.cfm).
- Modelo pÃºblico: [Lesen](https://bfu.goethe.de/a2_mod_2MX5/lesen.php), [HÃ¶ren](https://bfu.goethe.de/a2_mod_2MX5/hoeren.php), [Schreiben](https://bfu.goethe.de/a2_mod_2MX5/schreiben.php), [Sprechen](https://bfu.goethe.de/a2_mod_2MX5/sprechen.php).
