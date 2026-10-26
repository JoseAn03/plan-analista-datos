/* ==========================================================
   EL TALLER DE FLUJOS v2.0 — Nivel Experto
   Fuente de la Campaña de Datos de ODEA: automatización con IA
   conectada a datos. Formato compatible con AI_LADDER /
   AI_CHAPTERS / AI_MISSIONS.
   Regla: el código calcula · la IA interpreta · un verificador
   revisa · un humano decide lo importante.
   Solo datos sintéticos o anonimizados.
   ========================================================== */

const FL_LADDER = [
  { xp: 0,     n: "Aprendiz del Taller" },
  { xp: 800,   n: "Armador de Flujos" },
  { xp: 1850,  n: "Orquestador" },
  { xp: 3200,  n: "Ingeniero de Automatización" },
  { xp: 5500,  n: "Arquitecto de Agentes" },
  { xp: 9000,  n: "Estratega de Datos e IA" },
  { xp: 14000, n: "Experto en Flujos" },
  { xp: 21100, n: "👑 MAESTRO DE FLUJOS" }
];

const FL_CHAPTERS = [
  {
    cap: 1, code: "MUNDO 1", title: "Cimientos del Flujo", ico: "🧩", color: "#00ff88",
    xpTarget: 1200, hours: 6.2, req: "Ninguno: empezá por acá.",
    narrative: "6 misiones · 1.200 XP · 6,2 h. Antes de construir hay que saber qué vale la pena automatizar: elegir, medir, diseñar y definir el éxito antes de tocar código."
  },
  {
    cap: 2, code: "MUNDO 2", title: "Conectores: Traé los Datos", ico: "🌐", color: "#00ccff",
    xpTarget: 1500, hours: 10.5, req: "ia2_1 · Python para Datos.",
    narrative: "6 misiones · 1.500 XP · 10,5 h. Un flujo vale lo que valen sus fuentes: APIs, hojas, correos y webhooks con permisos mínimos, reintentos y data contracts formales."
  },
  {
    cap: 3, code: "MUNDO 3", title: "El LLM como Componente", ico: "🧠", color: "#ff00ff",
    xpTarget: 1900, hours: 14, req: "ia5_2 y ia5_3 · prompts y API de LLM.",
    narrative: "8 misiones · 1.900 XP · 14 h. Dejás de chatear con la IA y la convertís en una pieza de software: JSON validado, evals, prompt versioning y costos medidos."
  },
  {
    cap: 4, code: "MUNDO 4", title: "Documentos Inteligentes", ico: "📄", color: "#7c6cff",
    xpTarget: 2150, hours: 16.5, req: "ia5_3 y el Mundo 3 completo.",
    narrative: "8 misiones · 2.150 XP · 16,5 h. PDFs, escaneos y contratos se convierten en datos limpios con confianza por campo, validación y cola de revisión humana."
  },
  {
    cap: 5, code: "MUNDO 5", title: "Reportes que Piensan", ico: "📊", color: "#ffaa00",
    xpTarget: 2200, hours: 17, req: "ia2_3 e ia2_4 · limpieza y EDA.", prod: true,
    narrative: "8 misiones · 2.200 XP · 17 h. El patrón profesional: el código calcula, la IA interpreta, un verificador revisa y el reporte se entrega solo. Desde acá el checklist de producción es obligatorio."
  },
  {
    cap: 6, code: "MUNDO 6", title: "Pregúntale a tus Datos", ico: "💬", color: "#ff6600",
    xpTarget: 2500, hours: 20.5, req: "ia2_2 · SQL e ia5_4 · RAG básico.", prod: true,
    narrative: "8 misiones · 2.500 XP · 20,5 h. Agentes que consultan datos reales con tool calling, límites, evidencia y evaluación de tareas. Sin evidencia no hay respuesta."
  },
  {
    cap: 7, code: "MUNDO 7", title: "Orquestación y Canales", ico: "🔀", color: "#ff3355",
    xpTarget: 2350, hours: 19, req: "fl2_4 · webhooks y el Mundo 3.", prod: true,
    narrative: "8 misiones · 2.350 XP · 19 h. n8n/híbrido, mensajería, aprobación humana, manejo de fallos e idempotencia. Conectar todo sin escribir un monstruo de código."
  },
  {
    cap: 8, code: "MUNDO 8", title: "Calidad, Costos y Seguridad", ico: "🛡️", color: "#ffd700",
    xpTarget: 2800, hours: 22, req: "Un jefe de los Mundos 4–7.", prod: true,
    narrative: "10 misiones · 2.800 XP · 22 h. El núcleo del nivel experto: golden sets, observabilidad, control de costos, privacidad, threat modeling, tests y auditoría antes/después."
  },
  {
    cap: 9, code: "MUNDO 9", title: "Rent-a-Car y Turismo", ico: "🚗", color: "#00e5a0",
    xpTarget: 2400, hours: 20, req: "ia3_2 e ia3_3 · primer modelo y métricas.", prod: true,
    narrative: "7 misiones · 2.400 XP · 20 h. Tu nicho con datos sintéticos: demanda, no-show, RFM, reseñas, tarifas y un copiloto de operaciones listo para demo."
  },
  {
    cap: 10, code: "MUNDO 10", title: "La Maestría", ico: "👑", color: "#ff4f9a",
    xpTarget: 2100, hours: 17, req: "Mundos 1–9 y checklist de producción.", prod: true,
    narrative: "5 misiones · 2.100 XP · 17 h. Dejás de ejecutar y empezás a liderar: librería propia, plantilla, enseñanza y examen final con criterios de aceptación explícitos."
  }
];

const FL_PROD_CHECKLIST = [
  "Idempotencia: re-ejecutar el mismo evento no duplica efectos colaterales.",
  "Observabilidad: trazas de cada llamada LLM, logs estructurados y métricas de acierto, latencia y costo.",
  "Control de costos: tope diario o por ejecución, model routing y cache de respuestas repetidas.",
  "Seguridad: secrets en variables de entorno, permisos mínimos, datos personales anonimizados y threat model básico.",
  "Human override: puntos claros donde un humano puede aprobar, rechazar o corregir.",
  "Runbook: documento de 1–2 páginas con salud, fallos, recuperación y a quién avisar.",
  "Tests: unitarios de validadores/cálculos + golden set o harness de evaluación.",
  "Data contract / quality gates: schema esperado, freshness y reglas que bloquean si los datos de entrada están mal."
];

const FL_MISSIONS = [
  /* MUNDO 1 — cimientos */
  { id: "fl1_1", cap: 1, t: "🧩 Anatomía de un Flujo", d: "Todo flujo tiene 5 piezas: disparador, datos, proceso, salida y monitoreo. Descomponé 3 tareas reales de tu trabajo en una tabla de 5 columnas.", xp: 150, time: 40, v: "3 flujos descompuestos en las 5 piezas" },
  { id: "fl1_2", cap: 1, t: "🕵️ Cazador de Procesos", d: "Durante 5 días anotá cada tarea repetitiva: qué es, cuánto tarda, cada cuánto se repite y qué tan molesta es. Al final tenés tu mina de ideas rentables.", xp: 160, time: 50, v: "Registro de 10+ tareas con tiempo y frecuencia" },
  { id: "fl1_3", cap: 1, t: "📊 Matriz de ROI", d: "Puntuá cada tarea de 1 a 5 en impacto, esfuerzo y riesgo. Calculá horas ahorradas al mes y valor en dinero. Elegí las 3 mejores candidatas.", xp: 180, time: 60, v: "Matriz con las 3 candidatas y su ahorro estimado" },
  { id: "fl1_4", cap: 1, t: "🧠 ¿Código, IA o Ambos?", d: "Regla de oro: reglas exactas → código; interpretar texto o imágenes → IA; lo mixto se combina. Clasificá 10 tareas y justificá cada decisión.", xp: 180, time: 45, v: "10 tareas clasificadas con justificación" },
  { id: "fl1_5", cap: 1, t: "🗺️ Diagrama Profesional", d: "Dibujá uno de tus flujos con Mermaid o draw.io. Marcá en rojo cada punto donde puede fallar y qué pasa si falla.", xp: 180, time: 60, v: "Diagrama exportado con puntos de falla marcados" },
  { id: "fl1_6", cap: 1, t: "👑 JEFE: Blueprint del Flujo", d: "Jefe de mundo. Documento de diseño de 1 página: problema, usuario, entradas, salidas, métrica de éxito, riesgos, plan de prueba y definición de listo. Es lo que un cliente serio pide.", xp: 350, time: 120, v: "Blueprint de 1 página revisado por otra persona" },

  /* MUNDO 2 — conectores */
  { id: "fl2_1", cap: 2, t: "🌐 Consumí una API REST", d: "Con requests/httpx llamá una API pública: parámetros, paginación, límites de tasa y errores HTTP. Guardá resultados en DataFrame e incluí retry con jitter.", xp: 220, time: 80, v: "Script que descarga 3+ páginas y maneja errores + rate limit" },
  { id: "fl2_2", cap: 2, t: "🔐 OAuth y Google Sheets", d: "Autenticá con cuenta de servicio u OAuth. Leé y escribí una hoja. Pedí siempre el permiso mínimo (scopes).", xp: 220, time: 90, v: "Script que lee y escribe en una hoja" },
  { id: "fl2_3", cap: 2, t: "📎 Correos y Adjuntos", d: "Conectate a un correo de prueba (Gmail API o IMAP), filtrá por asunto, descargá adjuntos y guardalos con nombre ordenado por fecha.", xp: 220, time: 90, v: "Adjuntos descargados de 5+ correos" },
  { id: "fl2_4", cap: 2, t: "🪝 Webhooks", d: "Creá un endpoint que reciba un evento (formulario, pago o mensaje) con FastAPI o un nodo webhook de n8n. Validá, guardá y probá con curl/Postman.", xp: 220, time: 90, v: "Webhook recibiendo y guardando eventos" },
  { id: "fl2_5", cap: 2, t: "🕸️ Scraping Responsable + Data Contract", d: "Extraé datos públicos respetando robots.txt y términos. Documentá legitimidad. Definí un data contract formal: schema, freshness, owner y SLA de calidad.", xp: 220, time: 90, v: "Scraper + nota de legitimidad + data contract" },
  { id: "fl2_6", cap: 2, t: "👑 JEFE: Conector Universal", d: "Jefe de mundo. Módulo Python reutilizable que lee 3 fuentes distintas (API, hoja y correo/CSV), las unifica en formato estándar, registra cada ejecución en un log y aplica el data contract.", xp: 400, time: 190, v: "Módulo con 3 conectores, log, data contract y README" },

  /* MUNDO 3 — LLM como componente */
  { id: "fl3_1", cap: 3, t: "🧾 JSON Confiable", d: "Pedí respuestas solo en JSON con esquema claro, parsealas y reintentá si falla. Probalo con 20 entradas y medí la tasa de JSON válido.", xp: 200, time: 75, v: "20 entradas con tasa de JSON válido medida" },
  { id: "fl3_2", cap: 3, t: "✅ Validación con Pydantic", d: "Definí un modelo Pydantic con tipos, rangos y enums. La IA propone, tu código dispone: rechazá todo lo que no cumpla.", xp: 200, time: 75, v: "Modelo Pydantic + 5 casos rechazados correctamente" },
  { id: "fl3_3", cap: 3, t: "🏷️ Clasificador de Mensajes", d: "Clasificá 50 mensajes en categoría, urgencia y sentimiento. Etiquetalos a mano primero para medir el acierto real contra un golden set.", xp: 240, time: 100, v: "Tabla con % de acierto contra tus etiquetas" },
  { id: "fl3_4", cap: 3, t: "🔎 Extracción de Entidades", d: "Sacá nombre, fechas, lugar, monto y número de reserva de textos desordenados. Medí precisión por campo.", xp: 240, time: 100, v: "Extractor con precisión por campo" },
  { id: "fl3_5", cap: 3, t: "🧪 Ejemplos que Enseñan + Prompt Versioning", d: "Agregá 3–5 ejemplos (few-shot) y medí antes/después. Versioná el prompt (v1, v2…). Si no mejora con números, no es mejora.", xp: 220, time: 80, v: "Comparación antes/después + historial de versiones" },
  { id: "fl3_6", cap: 3, t: "🔁 Reintentos, Respaldos y Costos", d: "Manejá timeouts, rate limits y errores con reintentos exponenciales y una respuesta de respaldo. Contá tokens y costo por ejecución.", xp: 240, time: 100, v: "Pruebas de 3 fallos + tabla de costos" },
  { id: "fl3_7", cap: 3, t: "📏 Evaluation Harness Básico", d: "Armá un harness simple: golden set pequeño (15–20 casos), métrica de acierto y reporte automático. Reutilizable en las misiones siguientes.", xp: 260, time: 120, v: "Harness + reporte de evaluación" },
  { id: "fl3_8", cap: 3, t: "👑 JEFE: Motor de Triage", d: "Jefe de mundo. Sistema que recibe correos, clasifica, extrae, valida JSON y deja una tabla por prioridad. Meta: ≥90 % de acierto sobre 50 casos etiquetados + análisis de errores y costos.", xp: 300, time: 190, v: "Motor + informe de acierto (o por qué no llegó al 90 %) + costos" },

  /* MUNDO 4 — documentos */
  { id: "fl4_1", cap: 4, t: "📄 PDF a Texto", d: "Extraé texto y tablas con pdfplumber. Distinguí PDF nativo de escaneado. Probalo con 5 documentos de formato distinto.", xp: 180, time: 60, v: "5 documentos procesados y clasificados por tipo" },
  { id: "fl4_2", cap: 4, t: "🖨️ OCR para Escaneados", d: "Usá Tesseract (pytesseract). Mejorá con escala de grises, umbral y rotación. Medí la tasa de error de palabras.", xp: 220, time: 90, v: "OCR con preprocesado y tasa de error estimada" },
  { id: "fl4_3", cap: 4, t: "👁️ Documentos con Visión", d: "Mandá imagen/PDF a un modelo con visión y pedí los campos en JSON. Comparalo con OCR clásico en 10 documentos: acierto y costo.", xp: 260, time: 110, v: "Tabla comparativa OCR vs visión (acierto + costo)" },
  { id: "fl4_4", cap: 4, t: "📑 Tablas desde PDF", d: "Extraé tablas de varias páginas (Camelot o pdfplumber), unificalas con encabezados consistentes y guardalas en Excel.", xp: 200, time: 80, v: "Excel con tablas unificadas de un PDF multipágina" },
  { id: "fl4_5", cap: 4, t: "🧾 Extractor de Facturas", d: "Campos: proveedor, fecha, número, subtotal, impuesto y total. Validá con código que subtotal + impuesto = total. Calculá confianza por campo.", xp: 280, time: 120, v: "Extractor con validación aritmética + confianza sobre 10 facturas" },
  { id: "fl4_6", cap: 4, t: "🖐️ Cola de Revisión Humana", d: "Marcá como revisar todo lo dudoso (campo vacío, suma que no cuadra o baja confianza) y generá un Excel solo con esos casos.", xp: 220, time: 90, v: "Excel de casos a revisar generado automáticamente" },
  { id: "fl4_7", cap: 4, t: "📜 Contratos y Cláusulas", d: "Con 5 contratos sintéticos de alquiler extraé fechas, deducibles, penalidades y condiciones, citando la frase textual por dato.", xp: 260, time: 120, v: "Tabla de cláusulas con cita textual por dato" },
  { id: "fl4_8", cap: 4, t: "👑 JEFE: Fábrica de Documentos", d: "Jefe de mundo. Carpeta con 50 documentos procesada hasta tabla en Excel/SQLite, con log, cola de revisión y métricas de precisión/recall. Medí acierto contra 20 documentos etiquetados y pasá el checklist de producción.", xp: 530, time: 320, v: "Repositorio con demo, informe de acierto y checklist de producción" },

  /* MUNDO 5 — reportes */
  { id: "fl5_1", cap: 5, t: "📝 Código Calcula, IA Narra", d: "Diseñá el contrato de datos del prompt: diccionario de métricas ya calculadas + instrucción de no inventar cifras. Probá 3 formatos de resumen.", xp: 200, time: 75, v: "Prompt con contrato de datos + 3 salidas comparadas" },
  { id: "fl5_2", cap: 5, t: "📈 Resumen Ejecutivo Semanal", d: "Excel de ventas/reservas → 5 métricas + resumen de 5 líneas con recomendación, guardado y listo para enviar.", xp: 220, time: 90, v: "Resumen generado automáticamente desde un Excel" },
  { id: "fl5_3", cap: 5, t: "🚨 Detector de Anomalías", d: "Detectá días raros con z-score, IQR o media móvil y pedí a la IA posibles causas, siempre marcadas como hipótesis.", xp: 240, time: 100, v: "Lista de anomalías con hipótesis etiquetadas" },
  { id: "fl5_4", cap: 5, t: "⚖️ Comparativas de Periodos", d: "Calculá semana vs semana, mes vs mes y año vs año con variaciones %. Narrá lo importante sin exagerar.", xp: 200, time: 75, v: "Tabla de variaciones + narración de 5 líneas" },
  { id: "fl5_5", cap: 5, t: "📗 Excel de Entrega Profesional", d: "Generá con openpyxl/XlsxWriter un libro con portada, hojas por tema, formato de moneda, formato condicional y gráficos nativos.", xp: 220, time: 90, v: "Libro Excel generado por script" },
  { id: "fl5_6", cap: 5, t: "📄 Reporte PDF o HTML Automático", d: "Plantilla HTML con Jinja2 + gráficos (matplotlib/Plotly) exportada a PDF. Un solo comando genera el reporte del mes.", xp: 260, time: 120, v: "Reporte PDF generado con un comando" },
  { id: "fl5_7", cap: 5, t: "🔍 Verificador Anti-Alucinación", d: "Función que extrae las cifras del texto generado y las compara con las métricas reales. Si no coinciden, el reporte se bloquea y avisa.", xp: 280, time: 120, v: "Verificador probado con un caso de cifra inventada" },
  { id: "fl5_8", cap: 5, t: "👑 JEFE: Reporte Autónomo", d: "Jefe de mundo. De datos crudos a correo enviado con resumen, gráficos y alertas, sin intervención. Debe ejecutarse solo 3 semanas seguidas, dejar registro, quality gates y pasar el checklist de producción.", xp: 580, time: 350, v: "3 ejecuciones consecutivas registradas + checklist de producción" },

  /* MUNDO 6 — agentes sobre datos */
  { id: "fl6_1", cap: 6, t: "🛡️ Text-to-SQL Seguro", d: "Pasá el esquema al modelo, generá la consulta y ejecutala solo si es SELECT, con límite de filas y usuario de solo lectura. Rechazá todo lo demás.", xp: 260, time: 120, v: "10 preguntas respondidas + 3 intentos de ataque bloqueados" },
  { id: "fl6_2", cap: 6, t: "🔧 Function Calling", d: "Definí una herramienta (nombre, descripción y parámetros) en la API y dejá que el modelo decida cuándo llamarla. Tu código ejecuta; el modelo solo pide.", xp: 240, time: 100, v: "Modelo llamando tu función con parámetros correctos" },
  { id: "fl6_3", cap: 6, t: "🚗 Agente de Disponibilidad", d: "Agente que responde «¿hay un SUV el 12 de diciembre?» consultando una tabla sintética de flota y reservas.", xp: 260, time: 120, v: "Agente respondiendo 10 consultas de disponibilidad" },
  { id: "fl6_4", cap: 6, t: "🧰 Agente Multi-Herramienta", d: "Dale 3 herramientas (consultar, calcular y buscar política) y un bucle con máximo de pasos. Registrá qué herramienta usó y por qué.", xp: 300, time: 150, v: "Agente con 3 herramientas + registro de decisiones" },
  { id: "fl6_5", cap: 6, t: "🧵 Memoria de Conversación", d: "Mantené el historial, resumí conversaciones largas para ahorrar tokens y probá que recuerde datos del inicio sin mezclar usuarios.", xp: 220, time: 90, v: "Pruebas con 2 usuarios simultáneos sin mezclar contexto" },
  { id: "fl6_6", cap: 6, t: "📚 RAG con Evaluación", d: "Embeddings + base vectorial (Chroma/FAISS). Con 15 preguntas medí cuántas respuestas citan el fragmento correcto. Profundiza el RAG básico de la Forja.", xp: 320, time: 180, v: "RAG con tabla de aciertos sobre 15 preguntas" },
  { id: "fl6_7", cap: 6, t: "🚧 Guardarraíles + Evaluación de Agente", d: "Probá ataques (prompt injection, «ignorá tus reglas», pedir datos de otro cliente). Agregá defensas y medí éxito de tarea, pasos y costo.", xp: 300, time: 135, v: "5 ataques + defensas + métricas de agente documentadas" },
  { id: "fl6_8", cap: 6, t: "👑 JEFE: Analista Conversacional", d: "Jefe de mundo. Chat que responde 20 preguntas de negocio mostrando la consulta SQL usada y rechazando lo que no puede hacer. Medí aciertos + evidencia y pasá el checklist de producción.", xp: 600, time: 335, v: "Chat con informe de aciertos sobre 20 preguntas + checklist" },

  /* MUNDO 7 — orquestación */
  { id: "fl7_1", cap: 7, t: "🔀 Primer Workflow en n8n", d: "Instalá n8n (local o Docker) y armá un workflow con disparador manual, llamada HTTP y salida a hoja. Exportalo como JSON.", xp: 200, time: 90, v: "Workflow funcionando y exportado" },
  { id: "fl7_2", cap: 7, t: "🧭 Enrutador con IA", d: "Un nodo de IA clasifica mensajes y un nodo Switch los manda a rutas distintas (ventas, soporte, urgente).", xp: 240, time: 100, v: "Workflow que enruta 10 mensajes de prueba" },
  { id: "fl7_3", cap: 7, t: "🧯 Manejo de Errores en Flujos", d: "Workflow de error que avise por Telegram/correo, con reintentos por nodo y registro del fallo. Provocá 3 fallos a propósito.", xp: 240, time: 100, v: "3 fallos provocados, avisados y registrados" },
  { id: "fl7_4", cap: 7, t: "📱 Canal de Mensajería", d: "Conectá Telegram (lo más fácil) o un sandbox de WhatsApp (Twilio/Meta) para recibir y responder mensajes desde tu flujo.", xp: 260, time: 120, v: "Captura de una conversación real con el bot" },
  { id: "fl7_5", cap: 7, t: "🤖 Bot Conectado a Datos", d: "Tu bot responde con información real (disponibilidad, precios o estado de reserva) leyendo una base/hoja, con respuestas cortas y claras.", xp: 320, time: 180, v: "Bot respondiendo 10 consultas con datos sintéticos" },
  { id: "fl7_6", cap: 7, t: "🔔 Alertas Inteligentes de Negocio", d: "Reglas con umbral (ocupación baja, cancelaciones altas) que disparan avisos con contexto redactado por IA. Máximo una alerta por causa por día.", xp: 240, time: 100, v: "Alertas funcionando con límite anti-fatiga" },
  { id: "fl7_7", cap: 7, t: "✋ Human Override + Audit Log", d: "Antes de enviar algo sensible, el flujo pide aprobación humana (human override) y registra quién aprobó, qué cambió y cuándo en un audit log. Incluí timeout y motivo de rechazo.", xp: 260, time: 120, v: "Flujo con human override, audit log y timeout" },
  { id: "fl7_8", cap: 7, t: "👑 JEFE: Flujo de Negocio Completo", d: "Jefe de mundo. Flujo de 6+ nodos con disparador, IA, datos, aprobación humana, manejo de errores, registro e idempotencia. Documentalo con diagrama, README y checklist de producción.", xp: 590, time: 330, v: "Flujo exportado, diagrama, README y checklist" },

  /* MUNDO 8 — calidad, costos y seguridad */
  { id: "fl8_1", cap: 8, t: "🎯 Golden Set", d: "Armá un conjunto de 30–50 casos con la respuesta correcta conocida. Es tu examen oficial: cada cambio se prueba contra él.", xp: 240, time: 120, v: "Archivo golden_set con 30+ casos" },
  { id: "fl8_2", cap: 8, t: "📐 Métricas del Flujo", d: "Medí acierto, cobertura, tasa de revisión humana, latencia y costo por ejecución. Guardalas y graficá la tendencia.", xp: 240, time: 100, v: "Tabla de métricas con gráfico de tendencia" },
  { id: "fl8_3", cap: 8, t: "💸 Control de Costos y Model Routing", d: "Contá tokens, probá un modelo más pequeño para tareas simples, cacheá respuestas repetidas, poné tope diario y routing por complejidad.", xp: 280, time: 120, v: "Comparación de costo antes/después con tope y routing" },
  { id: "fl8_4", cap: 8, t: "🔭 Trazas de LLM y Observabilidad", d: "Registrá en cada llamada: fecha, versión del prompt, entrada, salida, tokens, latencia y error. Introducí trazas simples (Langfuse/Phoenix o tabla propia).", xp: 280, time: 120, v: "Tabla de trazas con 100+ llamadas + dashboard básico" },
  { id: "fl8_5", cap: 8, t: "🔒 Privacidad y Datos Personales", d: "Identificá datos personales, anonimizalos antes de enviarlos a un modelo. Revisá Ley 8968 (Costa Rica) y consultá a un profesional antes de usar datos reales.", xp: 260, time: 120, v: "Mapa de datos personales + política de anonimización" },
  { id: "fl8_6", cap: 8, t: "🛡️ Seguridad Operativa y Threat Modeling", d: "Permisos mínimos, rotación de claves y límites por usuario. Escribí 10 riesgos con mitigación (STRIDE light).", xp: 260, time: 110, v: "Lista de 10 riesgos + mitigación + threat model simple" },
  { id: "fl8_7", cap: 8, t: "🧪 Pruebas Automáticas", d: "Con pytest probá validadores y cálculos. Simulá el modelo con mocks para que las pruebas sean rápidas y gratis.", xp: 260, time: 120, v: "Suite de pruebas pasando sin llamar a la API" },
  { id: "fl8_8", cap: 8, t: "📘 Manual de Operación (Runbook)", d: "Runbook para el cliente: qué hace el flujo, cómo saber si está sano, qué hacer si falla y a quién avisar.", xp: 220, time: 90, v: "Runbook de 2 páginas" },
  { id: "fl8_9", cap: 8, t: "🚦 Data Quality Gates y Lineage", d: "Definí quality gates (completitud, unicidad y rangos) que bloquean el flujo si fallan. Documentá el lineage simple de los datos que toca el flujo.", xp: 260, time: 120, v: "Quality gates implementados + diagrama de lineage" },
  { id: "fl8_10", cap: 8, t: "👑 JEFE: Auditoría Antes y Después", d: "Jefe de mundo. Auditá un flujo tuyo con golden set, costo, trazas, riesgos y quality gates; mejoralo y mostrá la comparación antes/después en un informe de 2–3 páginas + checklist de producción completo.", xp: 500, time: 300, v: "Informe de auditoría + checklist de producción firmado" },

  /* MUNDO 9 — rent-a-car y turismo */
  { id: "fl9_1", cap: 9, t: "📅 Pronóstico de Demanda", d: "Predecí reservas semanales con un método simple (promedio estacional) y uno mejor (statsmodels/Prophet). Comparalos con MAE/MAPE.", xp: 300, time: 150, v: "Comparación de error entre los 2 métodos" },
  { id: "fl9_2", cap: 9, t: "🚫 Predicción de No-Show", d: "Modelo que estima la probabilidad de no-show con datos sintéticos. Explicá qué variables pesan más.", xp: 300, time: 150, v: "Modelo con métricas y explicación de variables" },
  { id: "fl9_3", cap: 9, t: "👥 Segmentos de Clientes (RFM)", d: "Agrupá clientes por recencia, frecuencia y gasto. Pedí a la IA un mensaje distinto por segmento y revisalo vos.", xp: 280, time: 120, v: "Segmentos + 1 mensaje revisado por segmento" },
  { id: "fl9_4", cap: 9, t: "⭐ Minería de Reseñas", d: "Con 100 reseñas sintéticas extraé temas y sentimiento. Generá un informe con las 3 mejoras de mayor impacto.", xp: 260, time: 120, v: "Informe de temas con 3 recomendaciones" },
  { id: "fl9_5", cap: 9, t: "💰 Sugeridor de Precios", d: "Reglas + datos de ocupación para sugerir tarifas. Es una sugerencia que un humano aprueba, nunca un cambio automático. Documentá los límites.", xp: 280, time: 120, v: "Sugeridor con límites documentados" },
  { id: "fl9_6", cap: 9, t: "🛎️ Copiloto de Mostrador", d: "Asistente que propone respuestas a preguntas frecuentes basándose solo en un documento de políticas y dice «no sé» cuando no está.", xp: 300, time: 150, v: "Asistente probado con 15 preguntas (incluidas 3 sin respuesta)" },
  { id: "fl9_7", cap: 9, t: "👑 JEFE: Copiloto de Operaciones", d: "Jefe de mundo. Integrá reporte semanal, alertas y asistente de consultas en un solo producto demostrable, con datos sintéticos, video de 3 minutos, pricing sugerido y checklist de producción.", xp: 680, time: 390, v: "Repositorio, demo, video de 3 min + checklist de producción" },

  /* MUNDO 10 — maestría */
  { id: "fl10_1", cap: 10, t: "🎯 Elegí tu Especialidad", d: "Reportes, documentos o agentes: elegí una para profundizar 30 días y definí qué significa ser el mejor de tu zona en ella.", xp: 200, time: 60, v: "Plan de especialización de 30 días" },
  { id: "fl10_2", cap: 10, t: "📦 Librería Propia", d: "Convertí conectores, validadores y funciones de logging en un paquete instalable con pip, con pruebas, CI, versionado semántico y changelog.", xp: 400, time: 240, v: "Paquete instalable con pruebas y CI" },
  { id: "fl10_3", cap: 10, t: "🧱 Plantilla de Proyecto", d: "Repositorio plantilla (estructura, .env.example, pruebas, CI, Docker, observability hooks y README) para iniciar cualquier flujo nuevo en 10 minutos.", xp: 300, time: 150, v: "Repositorio plantilla publicado" },
  { id: "fl10_4", cap: 10, t: "🎤 Charla o Taller", d: "Presentá en 15 minutos, en vivo o grabado, cómo automatizar un proceso con IA y datos. Enseñar es el último nivel de dominio.", xp: 350, time: 180, v: "Grabación o evidencia de la charla" },
  { id: "fl10_5", cap: 10, t: "👑 JEFE: Examen del Maestro", d: "Jefe final. 4 retos con reloj y criterios de aceptación explícitos: extraer datos de 10 documentos, generar un reporte con verificación, responder 10 preguntas con SQL verificable y armar un flujo orquestado con aprobación. Máximo 6 horas. Autoevaluación con rúbrica.", xp: 850, time: 390, v: "Los 4 retos entregados + rúbrica propia completada" }
];

const FL_OBJ = {};
FL_MISSIONS.forEach(function (m) { FL_OBJ[m.id] = { xp: m.xp, cap: m.cap }; });

/* Totales de control: 10 mundos, 74 misiones, 21.100 XP, 10 jefes. */
const FL_TOTAL_XP = FL_MISSIONS.reduce(function (s, m) { return s + m.xp; }, 0);
const FL_TOTAL_MINUTES = FL_MISSIONS.reduce(function (s, m) { return s + m.time; }, 0);
const FL_BOSS_IDS = FL_CHAPTERS.map(function (ch) {
  const list = FL_MISSIONS.filter(function (m) { return m.cap === ch.cap; });
  return list.length ? list[list.length - 1].id : null;
}).filter(Boolean);
