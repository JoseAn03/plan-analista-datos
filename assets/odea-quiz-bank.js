/*
 * ODEA Quiz Bank — Fase 3 (preparado por Muse)
 * Banco normalizado extraido de quiz.html (30) y quiz-definitivo.html (54),
 * deduplicado por texto de pregunta: 58 preguntas unicas.
 * Contenido: preparacion de entrevista (puesto de Analista de Soporte:
 * tickets, Jira/ServiceNow, cierre de entrevista). Pensado para el
 * micro-quiz al completar misiones de Empleos/entrevista.
 * Cargado por odea.html desde la Fase 3 (v5.76): lo consume la capa
 * assets/odea-quiz.js (micro-quiz diario de 3 preguntas).
 */
window.ODEA_QUIZ_BANK = window.ODEA_QUIZ_BANK || {};
window.ODEA_QUIZ_BANK.entrevista = [
 {
  "tema": "El puesto",
  "pregunta": "¿Cuál es el rol principal del puesto de Analista de Soporte?",
  "opciones": [
   "Construir dashboards de Power BI",
   "Ser el primer punto de contacto de las solicitudes de soporte entrantes",
   "Gestionar las redes sociales de la empresa",
   "Hacer auditorías de datos"
  ],
  "correcta": 1,
  "explicacion": "El puesto es la puerta de entrada de todos los tickets: portal de operaciones, reportes KPI, BI, accesos y nuevas funcionalidades."
 },
 {
  "tema": "El puesto",
  "pregunta": "¿Por qué es crítico procesar los incidentes con prontitud?",
  "opciones": [
   "Porque los clientes se enojan rápido",
   "Los retrasos pueden afectar la toma de decisiones informada y la adopción de herramientas",
   "Porque el gerente lo pide",
   "Para cumplir con el horario"
  ],
  "correcta": 1,
  "explicacion": "La descripción lo dice: los retrasos afectan las decisiones informadas y la adopción de herramientas. Esa es la frase que hay que usar."
 },
 {
  "tema": "El puesto",
  "pregunta": "¿Cuáles son los tipos de tickets que atiende este puesto?",
  "opciones": [
   "Solo reportes de ventas",
   "Plataformas, informes de KPI, herramientas de BI, gestión de acceso y nuevas funcionalidades",
   "Solo problemas de hardware",
   "Únicamente solicitudes de vacaciones"
  ],
  "correcta": 1,
  "explicacion": "Los 5 tipos: plataformas, reportes de KPI, herramientas de BI, gestión de acceso y solicitudes de nuevas funcionalidades."
 },
 {
  "tema": "El puesto",
  "pregunta": "¿Qué hay que asegurar al recibir un ticket?",
  "opciones": [
   "Responder lo más rápido posible sin preguntar",
   "Recopilar información completa del solicitante",
   "Cerrarlo de inmediato",
   "Reenviarlo al primer correo disponible"
  ],
  "correcta": 1,
  "explicacion": "Información completa (qué, desde cuándo, a quién afecta, capturas) para que el ticket se resuelva sin ir y venir."
 },
 {
  "tema": "Ciclo del ticket",
  "pregunta": "¿Cuál es el orden correcto del ciclo de vida de un ticket?",
  "opciones": [
   "Clasificación → Recepción → Cierre → Resolución",
   "Recepción → Clasificación → Priorización → Asignación → Resolución → Comunicación → Cierre",
   "Priorización → Recepción → Asignación → Clasificación",
   "Recepción → Cierre → Documentación → Escalamiento"
  ],
  "correcta": 1,
  "explicacion": "Los 7 pasos: recepción, clasificación, priorización, asignación, resolución, comunicación y cierre."
 },
 {
  "tema": "Ciclo del ticket",
  "pregunta": "¿Qué determina la prioridad de un ticket?",
  "opciones": [
   "El orden de llegada",
   "El nombre del solicitante",
   "El impacto × la urgencia",
   "La antigüedad del usuario"
  ],
  "correcta": 2,
  "explicacion": "Impacto × urgencia → P1/P2/P3/P4. No es por orden de llegada."
 },
 {
  "tema": "Ciclo del ticket",
  "pregunta": "Un dashboard de KPI está caído y un gerente lo necesita para una reunión en 1 hora. ¿Qué prioridad le das?",
  "opciones": [
   "P4 — se agenda para la próxima semana",
   "P3 — se atiende en el día",
   "P2 — se atiende en 8 horas",
   "P1 — crítica, respuesta inmediata"
  ],
  "correcta": 3,
  "explicacion": "Bloquea una decisión gerencial: P1, respuesta inmediata. Prioridad por impacto y urgencia."
 },
 {
  "tema": "Ciclo del ticket",
  "pregunta": "Una solicitud de nueva funcionalidad ('¿se puede agregar un filtro por región?') ¿cómo se prioriza?",
  "opciones": [
   "P1 crítica",
   "P2 alta",
   "P3 media",
   "P4 baja — planificada / backlog"
  ],
  "correcta": 3,
  "explicacion": "Las mejoras y solicitudes nuevas son P4: van al backlog con expectativas claras."
 },
 {
  "tema": "Ciclo del ticket",
  "pregunta": "¿Cuál es la diferencia entre un incidente y una solicitud?",
  "opciones": [
   "Son lo mismo",
   "Incidente = algo está roto; solicitud = se pide algo nuevo (acceso, funcionalidad)",
   "Incidente = correo; solicitud = teléfono",
   "Incidente = interno; solicitud = externo"
  ],
  "correcta": 1,
  "explicacion": "Incidente: servicio no funciona. Solicitud: pedido de algo nuevo. Cada uno tiene su proceso."
 },
 {
  "tema": "Ciclo del ticket",
  "pregunta": "¿Cuándo se escala un ticket y cómo se hace?",
  "opciones": [
   "Cuando me da pereza resolverlo",
   "Nunca se escala",
   "Cuando vence el tiempo, requiere nivel 2/3 o crece el impacto — SIEMPRE con contexto",
   "Solo si el usuario es gerente"
  ],
  "correcta": 2,
  "explicacion": "Escalar con contexto: qué se probó, qué se encontró, qué necesita el siguiente nivel."
 },
 {
  "tema": "Jira",
  "pregunta": "¿Qué es Jira?",
  "opciones": [
   "Una base de datos",
   "Una herramienta de seguimiento de trabajo e incidencias (de Atlassian)",
   "Un lenguaje de programación",
   "Un antivirus"
  ],
  "correcta": 1,
  "explicacion": "Jira gestiona issues/tickets con tableros, prioridades y workflows."
 },
 {
  "tema": "Jira",
  "pregunta": "En Jira, ¿cómo se llama un ticket o tarea?",
  "opciones": [
   "Post",
   "Issue",
   "Card",
   "Slide"
  ],
  "correcta": 1,
  "explicacion": "El elemento central de Jira es el 'issue'. Tipos: Bug, Task, Story, Epic."
 },
 {
  "tema": "Jira",
  "pregunta": "¿Qué es un tablero Kanban en Jira?",
  "opciones": [
   "Un tablero con columnas (To Do → In Progress → Done) de flujo continuo",
   "Un informe financiero",
   "Una base de conocimiento",
   "Un chat de equipo"
  ],
  "correcta": 0,
  "explicacion": "Kanban visualiza el flujo continuo de trabajo; Scrum usa sprints con ciclos."
 },
 {
  "tema": "Jira",
  "pregunta": "¿Qué es ServiceNow?",
  "opciones": [
   "Un juego de mesa",
   "Una plataforma de ITSM (IT Service Management) para la mesa de servicio empresarial",
   "Un editor de fotos",
   "Una red social"
  ],
  "correcta": 1,
  "explicacion": "ServiceNow gestiona incidentes, solicitudes, cambios y SLAs en empresas grandes."
 },
 {
  "tema": "Jira",
  "pregunta": "En ServiceNow, ¿qué mide y alerta los tiempos comprometidos de atención?",
  "opciones": [
   "La memoria del servidor",
   "El módulo de nómina",
   "Los SLAs automáticos",
   "El historial de chat"
  ],
  "correcta": 2,
  "explicacion": "Los SLAs miden tiempos de respuesta y resolución automáticamente."
 },
 {
  "tema": "Jira",
  "pregunta": "¿Para qué sirve la Knowledge Base (KB) en soporte?",
  "opciones": [
   "Para guardar contraseñas",
   "Para consultar soluciones ya documentadas y resolver más rápido",
   "Para enviar correos masivos",
   "Para calcular salarios"
  ],
  "correcta": 1,
  "explicacion": "La KB es la primera parada: si la solución ya existe, no se reinicia el problema."
 },
 {
  "tema": "Power BI",
  "pregunta": "¿Con qué lenguaje se crean las medidas en Power BI?",
  "opciones": [
   "SQL",
   "Python",
   "DAX",
   "Java"
  ],
  "correcta": 2,
  "explicacion": "DAX (SUM, CALCULATE, TOTALYTD...). Las medidas son los cálculos del dashboard."
 },
 {
  "tema": "Power BI",
  "pregunta": "Un usuario dice 'el reporte está desactualizado'. ¿Qué revisás primero?",
  "opciones": [
   "El cable de red",
   "El refresh (actualización programada) de los datos",
   "El color del dashboard",
   "El antivirus"
  ],
  "correcta": 1,
  "explicacion": "Los datos se actualizan en horarios (refresh). Reporte viejo = problema de refresh o del pipeline."
 },
 {
  "tema": "Power BI",
  "pregunta": "¿Cómo se gestiona el acceso a un dashboard en Power BI?",
  "opciones": [
   "Con roles de workspace y RLS (Row-Level Security)",
   "Con contraseñas en un Excel",
   "Nadie puede ver dashboards",
   "Solo el gerente decide"
  ],
  "correcta": 0,
  "explicacion": "Roles de workspace (Viewer/Contributor/Admin) + RLS para limitar filas por usuario."
 },
 {
  "tema": "Power BI",
  "pregunta": "¿Qué es Power Query en Power BI?",
  "opciones": [
   "Un lenguaje para crear medidas",
   "La herramienta para extraer y transformar datos antes de cargarlos",
   "Un conector de impresoras",
   "Un tema de color"
  ],
  "correcta": 1,
  "explicacion": "Power Query hace el 'E' y 'T' del ETL: extraer y transformar antes de cargar."
 },
 {
  "tema": "Tableau",
  "pregunta": "En Tableau, ¿cuál es la diferencia entre una dimensión y una medida?",
  "opciones": [
   "No hay diferencia",
   "Dimensión = dato numérico; medida = texto",
   "Dimensión = categoría/texto (ej: región); medida = número (ej: ingresos)",
   "Dimensión = tabla; medida = gráfico"
  ],
  "correcta": 2,
  "explicacion": "Dimensiones agrupan (texto/categoría), medidas se calculan (números)."
 },
 {
  "tema": "Tableau",
  "pregunta": "¿En qué es más fuerte Power BI que Tableau?",
  "opciones": [
   "En visualización libre",
   "En reporting corporativo integrado con el ecosistema Microsoft/Excel y DAX",
   "En animaciones 3D",
   "En edición de video"
  ],
  "correcta": 1,
  "explicacion": "Power BI brilla en reporting corporativo e integración Microsoft; Tableau en exploración visual."
 },
 {
  "tema": "Conceptos",
  "pregunta": "¿Qué es un KPI?",
  "opciones": [
   "Un virus informático",
   "Una métrica ligada a un objetivo de negocio",
   "Un tipo de ticket",
   "Un lenguaje de programación"
  ],
  "correcta": 1,
  "explicacion": "Indicador Clave de Rendimiento: mide si se cumple un objetivo (ej: No-Show rate, satisfacción)."
 },
 {
  "tema": "Conceptos",
  "pregunta": "¿Qué es un SLA?",
  "opciones": [
   "Un acuerdo de nivel de servicio: tiempos comprometidos de respuesta y resolución",
   "Una base de datos",
   "Un tipo de gráfico",
   "Una encuesta"
  ],
  "correcta": 0,
  "explicacion": "El SLA es la promesa medible: responder en X, resolver en Y."
 },
 {
  "tema": "Conceptos",
  "pregunta": "¿Qué es un workaround?",
  "opciones": [
   "Una solución temporal mientras se corrige la causa raíz",
   "Un reporte semanal",
   "Un permiso de acceso",
   "Un error crítico"
  ],
  "correcta": 0,
  "explicacion": "Se deja un workaround funcionando y se sigue con la causa raíz."
 },
 {
  "tema": "Conceptos",
  "pregunta": "¿Qué significa ETL?",
  "opciones": [
   "Extraer, Transformar, Cargar — el pipeline que alimenta los dashboards",
   "Editar, Traducir, Limpiar",
   "Enviar, Transferir, Leer",
   "Evaluar, Testear, Lanzar"
  ],
  "correcta": 0,
  "explicacion": "Construiste pipelines ETL con Python y n8n: es tu carta para hablar con propiedad de datos."
 },
 {
  "tema": "Escenarios",
  "pregunta": "Un usuario llega molesto porque su reporte no funciona. ¿Qué hacés primero?",
  "opciones": [
   "Le digo que espere su turno",
   "Escucho, reconozco la frustración, separo la persona del problema y doy un plan claro",
   "Le explico que no es mi culpa",
   "Cierro el ticket"
  ],
  "correcta": 1,
  "explicacion": "Escucha activa + reconocer + plan claro con tiempos. El tono resuelve la mitad del conflicto."
 },
 {
  "tema": "Escenarios",
  "pregunta": "No sabés cómo resolver un ticket. ¿Qué hacés?",
  "opciones": [
   "Invento una solución",
   "Lo dejo sin responder",
   "Reviso la knowledge base y tickets similares; si no, escalo con contexto y comunico el estatus",
   "Lo cierro como resuelto"
  ],
  "correcta": 2,
  "explicacion": "KB primero, escalar con contexto, nunca inventar ni dejar de comunicar."
 },
 {
  "tema": "Escenarios",
  "pregunta": "Llegan 10 tickets a la vez. ¿Cómo priorizás?",
  "opciones": [
   "Por orden de llegada",
   "Por impacto y urgencia: P1/P2 primero, mejoras al final; y comunico estatus a todos",
   "Por el que grite más fuerte",
   "Al azar"
  ],
  "correcta": 1,
  "explicacion": "Impacto y urgencia, no orden de llegada. Comunicación: todos saben que su ticket está recibido."
 },
 {
  "tema": "Escenarios",
  "pregunta": "¿Por qué este puesto si sos analista de datos?",
  "opciones": [
   "Porque no encontré nada mejor",
   "Es el punto de contacto entre las personas y los datos: entiendo los reportes Y atiendo gente; quien entiende el ticket, entiende el negocio",
   "Porque paga bien",
   "No sabría decir"
  ],
  "correcta": 1,
  "explicacion": "Esa es tu respuesta estrella: puente entre datos y personas, primer filtro del ciclo de datos."
 },
 {
  "tema": "📥 Recepción de solicitudes",
  "pregunta": "En tu trabajo actual (Grupo ANC), ¿cómo recibís las solicitudes de verdad?",
  "opciones": [
   "Solo por WhatsApp",
   "Por correo electrónico y de forma directa en la operación (mostrador/teléfono, 24/7)",
   "Solo por teléfono fijo",
   "Por un sistema formal de tickets"
  ],
  "correcta": 1,
  "explicacion": "Correo + directo en la operación. Esa es la verdad y suena genuina: es el 'canal de entrada' del ticket."
 },
 {
  "tema": "📥 Recepción de solicitudes",
  "pregunta": "¿Dónde procesás y das seguimiento a las solicitudes en ANC?",
  "opciones": [
   "En hojas de control / Excel con trazabilidad (500+ reservas diarias)",
   "En un CRM de tickets",
   "En papel",
   "No se registran"
  ],
  "correcta": 0,
  "explicacion": "Hojas de control con trazabilidad: eso es tu 'cola de tickets' de hoy. Registro, seguimiento y cierre en Excel."
 },
 {
  "tema": "📥 Recepción de solicitudes",
  "pregunta": "En Grupo Dokka (call center), ¿qué herramienta usabas para registrar y dar seguimiento a los casos?",
  "opciones": [
   "Solo Excel sin estructura",
   "Un CRM: registro, priorización y cierre de casos",
   "ServiceNow",
   "Jira"
  ],
  "correcta": 1,
  "explicacion": "CRM. Ahí conocés el flujo completo de casos: registro, priorización, seguimiento y cierre."
 },
 {
  "tema": "📥 Recepción de solicitudes",
  "pregunta": "¿Cómo conectás tu experiencia de hoy con Jira o ServiceNow?",
  "opciones": [
   "Son herramientas distintas, no tienen relación",
   "El flujo es el mismo: registro, clasificación, priorización y cierre; solo cambia la herramienta. Yo ya domino ese flujo",
   "Las usé por años en ANC",
   "No sabría conectar los conceptos"
  ],
  "correcta": 1,
  "explicacion": "Esa es tu frase estrella: el concepto es el mismo, cambia la herramienta. Y eso es 100% real."
 },
 {
  "tema": "📥 Recepción de solicitudes",
  "pregunta": "¿Qué información pedís SIEMPRE al recibir una solicitud?",
  "opciones": [
   "Solo el nombre del usuario",
   "Qué pasa, desde cuándo, a quién afecta y capturas / pasos para reproducir",
   "El cargo del usuario",
   "Nada, resuelvo directo"
  ],
  "correcta": 1,
  "explicacion": "Información completa para resolver sin ir y venir. Si falta, el ticket se devuelve al solicitante."
 },
 {
  "tema": "📥 Recepción de solicitudes",
  "pregunta": "¿Cuál es la respuesta completa para '¿cómo recibís y registrás las solicitudes?'",
  "opciones": [
   "Solo recibo correos y ya",
   "Recibo por correo y directo en la operación, registro en hojas de control con trazabilidad (500+ reservas/día), y en Dokka usaba CRM; el concepto es el mismo que Jira o ServiceNow",
   "Trabajé con Jira 5 años",
   "Prefiero no hablar de eso"
  ],
  "correcta": 1,
  "explicacion": "Esa frase lista conecta todo: recepción real, registro real, CRM real y el puente hacia Jira/ServiceNow."
 },
 {
  "tema": "🔄 Ciclo del ticket",
  "pregunta": "Un ticket P2 tiene impacto significativo sin workaround. ¿Cuál es su tiempo objetivo típico?",
  "opciones": [
   "Respuesta en ~2 horas hábiles",
   "Respuesta en minutos",
   "Respuesta la próxima semana",
   "No tiene tiempo"
  ],
  "correcta": 0,
  "explicacion": "P1 inmediato · P2 ~2h · P3 ~8h/día hábil · P4 backlog. Memorizá la matriz."
 },
 {
  "tema": "🔄 Ciclo del ticket",
  "pregunta": "¿Cuál es la 'regla de oro' al priorizar tickets?",
  "opciones": [
   "Primero el que llegó primero",
   "Por impacto y urgencia, no por orden de llegada; y siempre comunico el estatus",
   "El que grite más fuerte",
   "Al azar"
  ],
  "correcta": 1,
  "explicacion": "Un P4 puede esperar, un P1 es inmediato. Y un usuario informado es un usuario tranquilo."
 },
 {
  "tema": "🟢 Jira",
  "pregunta": "En Jira, ¿cómo se llama un ticket o tarea y qué tipos existen?",
  "opciones": [
   "Post — tipos: Foto, Video, Texto",
   "Issue — tipos: Bug, Task, Story, Epic",
   "Card — tipos: Roja, Azul, Verde",
   "Slide — tipos: A, B, C"
  ],
  "correcta": 1,
  "explicacion": "El issue es el elemento central. Bug (roto), Task (tarea), Story (funcionalidad), Epic (grupo grande)."
 },
 {
  "tema": "🟢 Jira",
  "pregunta": "¿Cuál es la diferencia entre un tablero Kanban y uno Scrum?",
  "opciones": [
   "Kanban = flujo continuo con columnas (To Do → In Progress → Done); Scrum = sprints por ciclos",
   "Kanban = sprints; Scrum = flujo continuo",
   "Son lo mismo",
   "Kanban = reportes; Scrum = gráficos"
  ],
  "correcta": 0,
  "explicacion": "Kanban visualiza el flujo continuo; Scrum planifica por ciclos (sprints)."
 },
 {
  "tema": "🟢 Jira",
  "pregunta": "¿Qué es el workflow en Jira?",
  "opciones": [
   "El horario del equipo",
   "Los estados y las transiciones de un issue (Abierto → En progreso → En revisión → Cerrado)",
   "El logo de la empresa",
   "La contraseña del sistema"
  ],
  "correcta": 1,
  "explicacion": "El workflow define por dónde pasa el ticket y quién lo mueve. Concepto clave de soporte."
 },
 {
  "tema": "🔵 ServiceNow",
  "pregunta": "¿Qué módulo de ServiceNow registra y atiende incidentes con formularios estructurados?",
  "opciones": [
   "Incident Management",
   "Service Catalog",
   "CMDB",
   "Knowledge Base"
  ],
  "correcta": 0,
  "explicacion": "Incident Management: categoría, impacto y urgencia → prioridad automática. Service Catalog es para solicitudes estandarizadas."
 },
 {
  "tema": "🔵 ServiceNow",
  "pregunta": "¿Qué mide y alerta los tiempos comprometidos de atención en ServiceNow?",
  "opciones": [
   "La memoria del servidor",
   "El módulo de nómina",
   "Los SLAs automáticos",
   "El historial de chat"
  ],
  "correcta": 2,
  "explicacion": "Los SLAs miden respuesta (ej: 30 min) y resolución (ej: 4 h) y alertan automáticamente."
 },
 {
  "tema": "🔵 ServiceNow",
  "pregunta": "Te preguntan '¿Has usado Jira o ServiceNow?'. ¿Cuál es la respuesta honesta y segura?",
  "opciones": [
   "'Sí, soy experto' (aunque no sea cierto)",
   "'No, y no sé nada de tickets'",
   "No los he usado directamente, pero trabajo a diario con sistemas de tickets y CRM y conozco el flujo completo; a nivel conceptual conozco Jira y ServiceNow (issues, tableros, SLAs, KB) y me adapto en la primera semana",
   "'Pregúntele a otro'"
  ],
  "correcta": 2,
  "explicacion": "Honestidad + flujo que sí dominás + velocidad de aprendizaje. Nunca un 'sí' falso que se cae en la prueba técnica."
 },
 {
  "tema": "🟠 Power BI",
  "pregunta": "TU dashboard real: ¿qué números tenés que decir SIEMPRE?",
  "opciones": [
   "5 medidas y un modelo simple",
   "10 medidas sin modelo",
   "30+ medidas DAX, modelo Star Schema, 4,600+ reservas, usado a diario por la gerencia",
   "100 medidas pero nadie lo usa"
  ],
  "correcta": 2,
  "explicacion": "Tus números: 30+ medidas DAX, Star Schema, 4,600+ reservas. 'Si un ticket de Power BI llega, yo entiendo el DAX, el refresh y los permisos.'"
 },
 {
  "tema": "🟠 Power BI",
  "pregunta": "'Power BI o Tableau, ¿cuál preferís y por qué?' — tu respuesta:",
  "opciones": [
   "Power BI, porque es mi fuerte: 30+ medidas DAX en producción, usado por gerencia; Tableau lo conozco para exploración visual",
   "Tableau, aunque nunca lo usé",
   "Ninguno, odio los datos",
   "Power BI, porque es más barato"
  ],
  "correcta": 0,
  "explicacion": "Preferencia con argumento real: mi fuerte + producción + complementariedad. Sin inventar experiencia."
 },
 {
  "tema": "📊 Conceptos",
  "pregunta": "¿Qué es el escalamiento y cuál es su regla?",
  "opciones": [
   "Subir el ticket a nivel 2/3 SIEMPRE con contexto: qué se probó, qué se encontró, qué necesita el siguiente nivel",
   "Devolver el ticket al usuario",
   "Cerrarlo sin resolver",
   "Esperar a que se resuelva solo"
  ],
  "correcta": 0,
  "explicacion": "Escalar con contexto completo. Sin contexto, el nivel 2 pierde tiempo — y el usuario nota el retraso."
 },
 {
  "tema": "📊 Conceptos",
  "pregunta": "¿Cómo se da el acceso a un sistema o dashboard?",
  "opciones": [
   "A todo el mundo, para que no reclamen",
   "Según el rol y mínimo privilegio, con revisión periódica; un permiso mal dado es un riesgo",
   "Según quien lo pida primero",
   "Nunca se da acceso"
  ],
  "correcta": 1,
  "explicacion": "Gestión de acceso: dar/revocar según necesidad del rol y revisar periódicamente."
 },
 {
  "tema": "🎯 Escenarios",
  "pregunta": "'¿Por qué este puesto si vos sos analista de datos?' — tu respuesta:",
  "opciones": [
   "Porque no encontré nada mejor",
   "Porque es el punto de contacto entre las personas y los datos: entiendo los reportes Y atiendo gente; es el primer filtro del ciclo de datos — quien entiende el ticket, entiende el negocio",
   "Porque paga bien",
   "No lo había pensado"
  ],
  "correcta": 1,
  "explicacion": "Tu respuesta estrella: puente entre datos y personas. No es un paso atrás, es la puerta de entrada al ciclo de datos."
 },
 {
  "tema": "🎯 Escenarios",
  "pregunta": "'¿Dónde te ves en 2 años?' — tu respuesta:",
  "opciones": [
   "En otro país",
   "No lo he pensado",
   "En el mismo puesto sin cambios",
   "Dominando el soporte de las herramientas de datos y creciendo hacia un rol donde ayude a mejorarlas: automatizar lo repetitivo, mejores reportes, mejor knowledge base"
  ],
  "correcta": 3,
  "explicacion": "Tu historial dice que automatizás lo repetitivo: eso mismo harías con el soporte. Ambición con dirección."
 },
 {
  "tema": "🎯 Escenarios",
  "pregunta": "'¿Por qué te interesa esta empresa / este puesto?' — tu respuesta:",
  "opciones": [
   "Porque toca datos y servicio (lo que más me motiva), la modalidad híbrida en Heredia me queda (vivo en Santa Bárbara) y quiero crecer de atender tickets a construir herramientas",
   "Porque paga bien",
   "Porque no encontré otra cosa",
   "Porque me dijeron que viniera"
  ],
  "correcta": 0,
  "explicacion": "Tres razones reales: motivación, logística (híbrido Heredia) y crecimiento. Eso demuestra que ya decidiste."
 },
 {
  "tema": "💪 Tus números",
  "pregunta": "¿Cuántas reservas procesás a diario en ANC?",
  "opciones": [
   "500+ reservas diarias",
   "50 reservas diarias",
   "10 reservas diarias",
   "No llevo números"
  ],
  "correcta": 0,
  "explicacion": "500+ reservas/día. Es tu carta de volumen operativo: 'más tickets que cualquiera, solo que en Excel'."
 },
 {
  "tema": "💪 Tus números",
  "pregunta": "¿Cuál fue el resultado de tu automatización de reportes?",
  "opciones": [
   "Nada cambió",
   "De 2 horas a 15 minutos por reporte (87.5% menos) y 10+ horas semanales recuperadas",
   "De 15 minutos a 2 horas",
   "Perdí los datos"
  ],
  "correcta": 1,
  "explicacion": "2h → 15min y 10+ horas/semana al equipo. El número más poderoso de tu CV."
 },
 {
  "tema": "💪 Tus números",
  "pregunta": "Historia STAR 1 (automatización): ¿cuál fue tu ACCIÓN?",
  "opciones": [
   "Nada, seguí como estaba",
   "Le pedí a otro que lo hiciera",
   "Construí pipelines en Python (pandas, openpyxl), macros VBA, flujos n8n y un dashboard Power BI con 30+ medidas DAX y modelo Star Schema",
   "Compré un software"
  ],
  "correcta": 2,
  "explicacion": "S: reportes a mano (2h). T: automatizar 500+ reservas/día. A: Python + VBA + n8n + Power BI. R: 2h→15min, 10+ hrs."
 },
 {
  "tema": "💪 Tus números",
  "pregunta": "Historia STAR 2 (servicio bilingüe): ¿cuál fue tu RESULTADO?",
  "opciones": [
   "Perdí clientes",
   "Satisfacción sostenida por encima del 95% con clientes internacionales atendidos en inglés",
   "Cerré el call center",
   "No medí nada"
  ],
  "correcta": 1,
  "explicacion": "Operación 24/7, clientes internacionales, inglés diario. Resultado: satisfacción >95% y clientes que volvían."
 },
 {
  "tema": "💪 Tus números",
  "pregunta": "Historia STAR 3 (Grupo Dokka): ¿qué analizaste para mejorar la conversión?",
  "opciones": [
   "50+ interacciones diarias y métricas de CRM; identifiqué patrones por horario y guiones de alto rendimiento",
   "Los precios de la competencia",
   "Las vacaciones del equipo",
   "Nada, fue intuición"
  ],
  "correcta": 0,
  "explicacion": "Análisis de 50+ interacciones/día + CRM → patrones → superaste KPIs de conversión, tiempo de gestión y satisfacción."
 },
 {
  "tema": "💪 Tus números",
  "pregunta": "Historia STAR 4 (No-Shows): ¿qué logró tu dashboard?",
  "opciones": [
   "Nadie lo usó",
   "Fue adoptado como herramienta diaria y ayudó a reducir No-Shows ~3% con decisiones basadas en datos",
   "Se borró solo",
   "Solo lo vio mi mamá"
  ],
  "correcta": 1,
  "explicacion": "S: gerencia sin visibilidad. A: Star Schema + medidas DAX de No-Show e ingresos. R: herramienta diaria, -3% No-Shows."
 },
 {
  "tema": "💪 Tus números",
  "pregunta": "Tu cierre de entrevista en una frase:",
  "opciones": [
   "'Bueno, gracias, adiós'",
   "'Agradezco el tiempo. Este puesto combina entender los datos y atender personas; puedo aportar desde el primer día en gestión de tickets y entiendo rápido las incidencias que lleguen. ¿Cuáles son los siguientes pasos?'",
   "'¿Cuánto pagan?'",
   "'Ya me voy, ¿sí?'"
  ],
  "correcta": 1,
  "explicacion": "Cierre con valor + pregunta de seguimiento. Terminás vos al mando, no en falso."
 }
];
