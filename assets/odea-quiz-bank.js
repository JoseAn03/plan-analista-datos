/*
 * ODEA Quiz Bank — Fase 3 (preparado por Muse)
 * Banco normalizado extraido de quiz.html (30) y quiz-definitivo.html (54),
 * deduplicado por texto de pregunta: 58 preguntas unicas.
 * Contenido: preparacion de entrevista (puesto de Analista de Soporte:
 * tickets, Jira/ServiceNow, cierre de entrevista). Pensado para el
 * micro-quiz al completar misiones de Empleos/entrevista.
 * Cargado por odea.html desde la Fase 3 (v5.76): lo consume la capa
 * assets/odea-quiz.js (micro-quiz diario de 3 preguntas).
 * v5.94: mazo entrevistaRL (60, entrevista Remote Leverage).
 * v5.97: preguntas y opciones de AMBOS mazos en ingles; las explicaciones
 * quedan en español (andamiaje de estudio, con la frase modelo en ingles).
 */
window.ODEA_QUIZ_BANK = window.ODEA_QUIZ_BANK || {};
window.ODEA_QUIZ_BANK.entrevista = [
 {
  "tema": "The role",
  "pregunta": "What is the main role of the Support Analyst position?",
  "opciones": [
   "Build Power BI dashboards",
   "Be the first point of contact for incoming support requests",
   "Manage the company's social media",
   "Run data audits"
  ],
  "correcta": 1,
  "explicacion": "El puesto es la puerta de entrada de todos los tickets: portal de operaciones, reportes KPI, BI, accesos y nuevas funcionalidades."
 },
 {
  "tema": "The role",
  "pregunta": "Why is it critical to process incidents promptly?",
  "opciones": [
   "Because clients get angry fast",
   "Delays can affect informed decision-making and tool adoption",
   "Because the manager asks for it",
   "To stick to the schedule"
  ],
  "correcta": 1,
  "explicacion": "La descripción lo dice: los retrasos afectan las decisiones informadas y la adopción de herramientas. Esa es la frase que hay que usar."
 },
 {
  "tema": "The role",
  "pregunta": "What types of tickets does this role handle?",
  "opciones": [
   "Only sales reports",
   "Platforms, KPI reports, BI tools, access management, and new feature requests",
   "Only hardware problems",
   "Only vacation requests"
  ],
  "correcta": 1,
  "explicacion": "Los 5 tipos: plataformas, reportes de KPI, herramientas de BI, gestión de acceso y solicitudes de nuevas funcionalidades."
 },
 {
  "tema": "The role",
  "pregunta": "What must you make sure of when you receive a ticket?",
  "opciones": [
   "Reply as fast as possible without asking anything",
   "Collect complete information from the requester",
   "Close it immediately",
   "Forward it to the first available email"
  ],
  "correcta": 1,
  "explicacion": "Información completa (qué, desde cuándo, a quién afecta, capturas) para que el ticket se resuelva sin ir y venir."
 },
 {
  "tema": "Ticket lifecycle",
  "pregunta": "What is the correct order of a ticket's lifecycle?",
  "opciones": [
   "Classification → Intake → Closing → Resolution",
   "Intake → Classification → Prioritization → Assignment → Resolution → Communication → Closing",
   "Prioritization → Intake → Assignment → Classification",
   "Intake → Closing → Documentation → Escalation"
  ],
  "correcta": 1,
  "explicacion": "Los 7 pasos: recepción, clasificación, priorización, asignación, resolución, comunicación y cierre."
 },
 {
  "tema": "Ticket lifecycle",
  "pregunta": "What determines a ticket's priority?",
  "opciones": [
   "The order of arrival",
   "The requester's name",
   "Impact × urgency",
   "How long the user has been at the company"
  ],
  "correcta": 2,
  "explicacion": "Impacto × urgencia → P1/P2/P3/P4. No es por orden de llegada."
 },
 {
  "tema": "Ticket lifecycle",
  "pregunta": "A KPI dashboard is down and a manager needs it for a meeting in 1 hour. What priority do you give it?",
  "opciones": [
   "P4 — schedule it for next week",
   "P3 — handle it during the day",
   "P2 — handle it within 8 hours",
   "P1 — critical, immediate response"
  ],
  "correcta": 3,
  "explicacion": "Bloquea una decisión gerencial: P1, respuesta inmediata. Prioridad por impacto y urgencia."
 },
 {
  "tema": "Ticket lifecycle",
  "pregunta": "How do you prioritize a new feature request ('can a filter by region be added?')?",
  "opciones": [
   "P1 critical",
   "P2 high",
   "P3 medium",
   "P4 low — planned / backlog"
  ],
  "correcta": 3,
  "explicacion": "Las mejoras y solicitudes nuevas son P4: van al backlog con expectativas claras."
 },
 {
  "tema": "Ticket lifecycle",
  "pregunta": "What is the difference between an incident and a request?",
  "opciones": [
   "They are the same thing",
   "Incident = something is broken; request = something new is asked for (access, a feature)",
   "Incident = email; request = phone",
   "Incident = internal; request = external"
  ],
  "correcta": 1,
  "explicacion": "Incidente: servicio no funciona. Solicitud: pedido de algo nuevo. Cada uno tiene su proceso."
 },
 {
  "tema": "Ticket lifecycle",
  "pregunta": "When do you escalate a ticket, and how?",
  "opciones": [
   "When I don't feel like solving it",
   "Tickets are never escalated",
   "When the time runs out, it needs level 2/3, or the impact grows — ALWAYS with context",
   "Only if the user is a manager"
  ],
  "correcta": 2,
  "explicacion": "Escalar con contexto: qué se probó, qué se encontró, qué necesita el siguiente nivel."
 },
 {
  "tema": "Jira",
  "pregunta": "What is Jira?",
  "opciones": [
   "A database",
   "A work and issue tracking tool (by Atlassian)",
   "A programming language",
   "An antivirus"
  ],
  "correcta": 1,
  "explicacion": "Jira gestiona issues/tickets con tableros, prioridades y workflows."
 },
 {
  "tema": "Jira",
  "pregunta": "In Jira, what is a ticket or task called?",
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
  "pregunta": "What is a Kanban board in Jira?",
  "opciones": [
   "A board with columns (To Do → In Progress → Done) and continuous flow",
   "A financial report",
   "A knowledge base",
   "A team chat"
  ],
  "correcta": 0,
  "explicacion": "Kanban visualiza el flujo continuo de trabajo; Scrum usa sprints con ciclos."
 },
 {
  "tema": "Jira",
  "pregunta": "What is ServiceNow?",
  "opciones": [
   "A board game",
   "An ITSM (IT Service Management) platform for the enterprise service desk",
   "A photo editor",
   "A social network"
  ],
  "correcta": 1,
  "explicacion": "ServiceNow gestiona incidentes, solicitudes, cambios y SLAs en empresas grandes."
 },
 {
  "tema": "Jira",
  "pregunta": "In ServiceNow, what measures and alerts on the committed response times?",
  "opciones": [
   "The server's memory",
   "The payroll module",
   "The automatic SLAs",
   "The chat history"
  ],
  "correcta": 2,
  "explicacion": "Los SLAs miden tiempos de respuesta y resolución automáticamente."
 },
 {
  "tema": "Jira",
  "pregunta": "What is the Knowledge Base (KB) for in support?",
  "opciones": [
   "To store passwords",
   "To look up documented solutions and solve faster",
   "To send mass emails",
   "To calculate salaries"
  ],
  "correcta": 1,
  "explicacion": "La KB es la primera parada: si la solución ya existe, no se reinicia el problema."
 },
 {
  "tema": "Power BI",
  "pregunta": "What language do you use to create measures in Power BI?",
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
  "pregunta": "A user says 'the report is out of date.' What do you check first?",
  "opciones": [
   "The network cable",
   "The data refresh (scheduled update)",
   "The dashboard's color",
   "The antivirus"
  ],
  "correcta": 1,
  "explicacion": "Los datos se actualizan en horarios (refresh). Reporte viejo = problema de refresh o del pipeline."
 },
 {
  "tema": "Power BI",
  "pregunta": "How is access to a Power BI dashboard managed?",
  "opciones": [
   "With workspace roles and RLS (Row-Level Security)",
   "With passwords in an Excel file",
   "Nobody can view dashboards",
   "Only the manager decides"
  ],
  "correcta": 0,
  "explicacion": "Roles de workspace (Viewer/Contributor/Admin) + RLS para limitar filas por usuario."
 },
 {
  "tema": "Power BI",
  "pregunta": "What is Power Query in Power BI?",
  "opciones": [
   "A language for creating measures",
   "The tool to extract and transform data before loading it",
   "A printer connector",
   "A color theme"
  ],
  "correcta": 1,
  "explicacion": "Power Query hace el 'E' y 'T' del ETL: extraer y transformar antes de cargar."
 },
 {
  "tema": "Tableau",
  "pregunta": "In Tableau, what is the difference between a dimension and a measure?",
  "opciones": [
   "There is no difference",
   "Dimension = numeric data; measure = text",
   "Dimension = category/text (e.g., region); measure = number (e.g., revenue)",
   "Dimension = table; measure = chart"
  ],
  "correcta": 2,
  "explicacion": "Dimensiones agrupan (texto/categoría), medidas se calculan (números)."
 },
 {
  "tema": "Tableau",
  "pregunta": "Where is Power BI stronger than Tableau?",
  "opciones": [
   "In free-form visualization",
   "In corporate reporting integrated with the Microsoft/Excel ecosystem and DAX",
   "In 3D animations",
   "In video editing"
  ],
  "correcta": 1,
  "explicacion": "Power BI brilla en reporting corporativo e integración Microsoft; Tableau en exploración visual."
 },
 {
  "tema": "Concepts",
  "pregunta": "What is a KPI?",
  "opciones": [
   "A computer virus",
   "A metric tied to a business goal",
   "A type of ticket",
   "A programming language"
  ],
  "correcta": 1,
  "explicacion": "Indicador Clave de Rendimiento: mide si se cumple un objetivo (ej: No-Show rate, satisfacción)."
 },
 {
  "tema": "Concepts",
  "pregunta": "What is an SLA?",
  "opciones": [
   "A service level agreement: committed response and resolution times",
   "A database",
   "A type of chart",
   "A survey"
  ],
  "correcta": 0,
  "explicacion": "El SLA es la promesa medible: responder en X, resolver en Y."
 },
 {
  "tema": "Concepts",
  "pregunta": "What is a workaround?",
  "opciones": [
   "A temporary solution while the root cause is fixed",
   "A weekly report",
   "An access permission",
   "A critical error"
  ],
  "correcta": 0,
  "explicacion": "Se deja un workaround funcionando y se sigue con la causa raíz."
 },
 {
  "tema": "Concepts",
  "pregunta": "What does ETL mean?",
  "opciones": [
   "Extract, Transform, Load — the pipeline that feeds the dashboards",
   "Edit, Translate, Clean",
   "Send, Transfer, Read",
   "Evaluate, Test, Launch"
  ],
  "correcta": 0,
  "explicacion": "Construiste pipelines ETL con Python y n8n: es tu carta para hablar con propiedad de datos."
 },
 {
  "tema": "Scenarios",
  "pregunta": "A user comes in upset because their report doesn't work. What do you do first?",
  "opciones": [
   "Tell them to wait their turn",
   "Listen, acknowledge the frustration, separate the person from the problem, and give a clear plan",
   "Explain that it's not my fault",
   "Close the ticket"
  ],
  "correcta": 1,
  "explicacion": "Escucha activa + reconocer + plan claro con tiempos. El tono resuelve la mitad del conflicto."
 },
 {
  "tema": "Scenarios",
  "pregunta": "You don't know how to solve a ticket. What do you do?",
  "opciones": [
   "Make up a solution",
   "Leave it unanswered",
   "Check the knowledge base and similar tickets; if not, escalate with context and communicate the status",
   "Close it as solved"
  ],
  "correcta": 2,
  "explicacion": "KB primero, escalar con contexto, nunca inventar ni dejar de comunicar."
 },
 {
  "tema": "Scenarios",
  "pregunta": "10 tickets arrive at the same time. How do you prioritize?",
  "opciones": [
   "By order of arrival",
   "By impact and urgency: P1/P2 first, improvements last; and I communicate the status to everyone",
   "Whoever shouts the loudest",
   "At random"
  ],
  "correcta": 1,
  "explicacion": "Impacto y urgencia, no orden de llegada. Comunicación: todos saben que su ticket está recibido."
 },
 {
  "tema": "Scenarios",
  "pregunta": "Why this position if you are a data analyst?",
  "opciones": [
   "Because I couldn't find anything better",
   "It's the contact point between people and data: I understand the reports AND I serve people; whoever understands the ticket understands the business",
   "Because it pays well",
   "I wouldn't know what to say"
  ],
  "correcta": 1,
  "explicacion": "Esa es tu respuesta estrella: puente entre datos y personas, primer filtro del ciclo de datos."
 },
 {
  "tema": "📥 Receiving requests",
  "pregunta": "In your current job (Grupo ANC), how do you really receive requests?",
  "opciones": [
   "Only by WhatsApp",
   "By email and directly in the operation (counter/phone, 24/7)",
   "Only by landline phone",
   "Through a formal ticketing system"
  ],
  "correcta": 1,
  "explicacion": "Correo + directo en la operación. Esa es la verdad y suena genuina: es el 'canal de entrada' del ticket."
 },
 {
  "tema": "📥 Receiving requests",
  "pregunta": "Where do you process and follow up on requests at ANC?",
  "opciones": [
   "In control spreadsheets / Excel with traceability (500+ reservations a day)",
   "In a ticketing CRM",
   "On paper",
   "They are not recorded"
  ],
  "correcta": 0,
  "explicacion": "Hojas de control con trazabilidad: eso es tu 'cola de tickets' de hoy. Registro, seguimiento y cierre en Excel."
 },
 {
  "tema": "📥 Receiving requests",
  "pregunta": "At Grupo Dokka (call center), what tool did you use to log and follow up on cases?",
  "opciones": [
   "Only unstructured Excel",
   "A CRM: case logging, prioritization, and closing",
   "ServiceNow",
   "Jira"
  ],
  "correcta": 1,
  "explicacion": "CRM. Ahí conocés el flujo completo de casos: registro, priorización, seguimiento y cierre."
 },
 {
  "tema": "📥 Receiving requests",
  "pregunta": "How do you connect your current experience with Jira or ServiceNow?",
  "opciones": [
   "They are different tools, there is no relation",
   "The flow is the same: log, classify, prioritize, and close; only the tool changes. I already master that flow",
   "I used them for years at ANC",
   "I wouldn't know how to connect the concepts"
  ],
  "correcta": 1,
  "explicacion": "Esa es tu frase estrella: el concepto es el mismo, cambia la herramienta. Y eso es 100% real."
 },
 {
  "tema": "📥 Receiving requests",
  "pregunta": "What information do you ALWAYS ask for when you receive a request?",
  "opciones": [
   "Only the user's name",
   "What is happening, since when, who is affected, and screenshots / steps to reproduce it",
   "The user's job title",
   "Nothing, I solve it directly"
  ],
  "correcta": 1,
  "explicacion": "Información completa para resolver sin ir y venir. Si falta, el ticket se devuelve al solicitante."
 },
 {
  "tema": "📥 Receiving requests",
  "pregunta": "What is the complete answer to 'how do you receive and log requests?'?",
  "opciones": [
   "I just receive emails, that's it",
   "I receive them by email and directly in the operation, I log them in control spreadsheets with traceability (500+ reservations/day), and at Dokka I used a CRM; the concept is the same as Jira or ServiceNow",
   "I worked with Jira for 5 years",
   "I'd rather not talk about that"
  ],
  "correcta": 1,
  "explicacion": "Esa frase lista conecta todo: recepción real, registro real, CRM real y el puente hacia Jira/ServiceNow."
 },
 {
  "tema": "🔄 Ticket lifecycle",
  "pregunta": "A P2 ticket has significant impact and no workaround. What is its typical target time?",
  "opciones": [
   "Response in ~2 business hours",
   "Response in minutes",
   "Response next week",
   "It has no target time"
  ],
  "correcta": 0,
  "explicacion": "P1 inmediato · P2 ~2h · P3 ~8h/día hábil · P4 backlog. Memorizá la matriz."
 },
 {
  "tema": "🔄 Ticket lifecycle",
  "pregunta": "What is the 'golden rule' when prioritizing tickets?",
  "opciones": [
   "First come, first served",
   "By impact and urgency, not by order of arrival; and I always communicate the status",
   "Whoever shouts the loudest",
   "At random"
  ],
  "correcta": 1,
  "explicacion": "Un P4 puede esperar, un P1 es inmediato. Y un usuario informado es un usuario tranquilo."
 },
 {
  "tema": "🟢 Jira",
  "pregunta": "In Jira, what is a ticket or task called, and what types exist?",
  "opciones": [
   "Post — types: Photo, Video, Text",
   "Issue — types: Bug, Task, Story, Epic",
   "Card — types: Red, Blue, Green",
   "Slide — types: A, B, C"
  ],
  "correcta": 1,
  "explicacion": "El issue es el elemento central. Bug (roto), Task (tarea), Story (funcionalidad), Epic (grupo grande)."
 },
 {
  "tema": "🟢 Jira",
  "pregunta": "What is the difference between a Kanban board and a Scrum board?",
  "opciones": [
   "Kanban = continuous flow with columns (To Do → In Progress → Done); Scrum = sprints in cycles",
   "Kanban = sprints; Scrum = continuous flow",
   "They are the same",
   "Kanban = reports; Scrum = charts"
  ],
  "correcta": 0,
  "explicacion": "Kanban visualiza el flujo continuo; Scrum planifica por ciclos (sprints)."
 },
 {
  "tema": "🟢 Jira",
  "pregunta": "What is the workflow in Jira?",
  "opciones": [
   "The team's schedule",
   "The states and transitions of an issue (Open → In Progress → In Review → Closed)",
   "The company's logo",
   "The system password"
  ],
  "correcta": 1,
  "explicacion": "El workflow define por dónde pasa el ticket y quién lo mueve. Concepto clave de soporte."
 },
 {
  "tema": "🔵 ServiceNow",
  "pregunta": "Which ServiceNow module logs and handles incidents with structured forms?",
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
  "pregunta": "What measures and alerts on committed response times in ServiceNow?",
  "opciones": [
   "The server's memory",
   "The payroll module",
   "The automatic SLAs",
   "The chat history"
  ],
  "correcta": 2,
  "explicacion": "Los SLAs miden respuesta (ej: 30 min) y resolución (ej: 4 h) y alertan automáticamente."
 },
 {
  "tema": "🔵 ServiceNow",
  "pregunta": "They ask you: 'Have you used Jira or ServiceNow?' What is the honest, safe answer?",
  "opciones": [
   "'Yes, I'm an expert' (even if it's not true)",
   "'No, and I know nothing about tickets'",
   "I haven't used them directly, but I work daily with ticketing systems and a CRM and I know the full flow; conceptually I know Jira and ServiceNow (issues, boards, SLAs, KB) and I can adapt within the first week",
   "'Ask someone else'"
  ],
  "correcta": 2,
  "explicacion": "Honestidad + flujo que sí dominás + velocidad de aprendizaje. Nunca un 'sí' falso que se cae en la prueba técnica."
 },
 {
  "tema": "🟠 Power BI",
  "pregunta": "YOUR real dashboard: what numbers must you ALWAYS say?",
  "opciones": [
   "5 measures and a simple model",
   "10 measures with no model",
   "30+ DAX measures, Star Schema model, 4,600+ reservations, used daily by management",
   "100 measures but nobody uses it"
  ],
  "correcta": 2,
  "explicacion": "Tus números: 30+ medidas DAX, Star Schema, 4,600+ reservas. 'Si un ticket de Power BI llega, yo entiendo el DAX, el refresh y los permisos.'"
 },
 {
  "tema": "🟠 Power BI",
  "pregunta": "'Power BI or Tableau, which do you prefer and why?' — your answer:",
  "opciones": [
   "Power BI, because it's my strength: 30+ DAX measures in production, used by management; I know Tableau for visual exploration",
   "Tableau, even though I never used it",
   "Neither, I hate data",
   "Power BI, because it's cheaper"
  ],
  "correcta": 0,
  "explicacion": "Preferencia con argumento real: mi fuerte + producción + complementariedad. Sin inventar experiencia."
 },
 {
  "tema": "📊 Concepts",
  "pregunta": "What is escalation, and what is its rule?",
  "opciones": [
   "Move the ticket to level 2/3 ALWAYS with context: what was tried, what was found, what the next level needs",
   "Return the ticket to the user",
   "Close it without solving it",
   "Wait for it to solve itself"
  ],
  "correcta": 0,
  "explicacion": "Escalar con contexto completo. Sin contexto, el nivel 2 pierde tiempo — y el usuario nota el retraso."
 },
 {
  "tema": "📊 Concepts",
  "pregunta": "How is access to a system or dashboard granted?",
  "opciones": [
   "To everyone, so nobody complains",
   "By role and least privilege, with periodic reviews; a wrongly granted permission is a risk",
   "To whoever asks first",
   "Access is never granted"
  ],
  "correcta": 1,
  "explicacion": "Gestión de acceso: dar/revocar según necesidad del rol y revisar periódicamente."
 },
 {
  "tema": "🎯 Scenarios",
  "pregunta": "'Why this position if you are a data analyst?' — your answer:",
  "opciones": [
   "Because I couldn't find anything better",
   "Because it's the contact point between people and data: I understand the reports AND I serve people; it's the first filter of the data cycle — whoever understands the ticket understands the business",
   "Because it pays well",
   "I hadn't thought about it"
  ],
  "correcta": 1,
  "explicacion": "Tu respuesta estrella: puente entre datos y personas. No es un paso atrás, es la puerta de entrada al ciclo de datos."
 },
 {
  "tema": "🎯 Scenarios",
  "pregunta": "'Where do you see yourself in 2 years?' — your answer:",
  "opciones": [
   "In another country",
   "I haven't thought about it",
   "In the same position with no changes",
   "Mastering support for data tools and growing into a role where I help improve them: automating repetitive work, better reports, a better knowledge base"
  ],
  "correcta": 3,
  "explicacion": "Tu historial dice que automatizás lo repetitivo: eso mismo harías con el soporte. Ambición con dirección."
 },
 {
  "tema": "🎯 Scenarios",
  "pregunta": "'Why are you interested in this company / this position?' — your answer:",
  "opciones": [
   "Because it involves data and service (what motivates me most), the hybrid setup in Heredia works for me (I live in Santa Bárbara), and I want to grow from handling tickets to building tools",
   "Because it pays well",
   "Because I couldn't find anything else",
   "Because someone told me to come"
  ],
  "correcta": 0,
  "explicacion": "Tres razones reales: motivación, logística (híbrido Heredia) y crecimiento. Eso demuestra que ya decidiste."
 },
 {
  "tema": "💪 Your numbers",
  "pregunta": "How many reservations do you process daily at ANC?",
  "opciones": [
   "500+ reservations a day",
   "50 reservations a day",
   "10 reservations a day",
   "I don't track numbers"
  ],
  "correcta": 0,
  "explicacion": "500+ reservas/día. Es tu carta de volumen operativo: 'más tickets que cualquiera, solo que en Excel'."
 },
 {
  "tema": "💪 Your numbers",
  "pregunta": "What was the result of your reporting automation?",
  "opciones": [
   "Nothing changed",
   "From 2 hours to 15 minutes per report (87.5% less) and 10+ hours a week recovered",
   "From 15 minutes to 2 hours",
   "I lost the data"
  ],
  "correcta": 1,
  "explicacion": "2h → 15min y 10+ horas/semana al equipo. El número más poderoso de tu CV."
 },
 {
  "tema": "💪 Your numbers",
  "pregunta": "STAR Story 1 (automation): what was your ACTION?",
  "opciones": [
   "Nothing, I kept things as they were",
   "I asked someone else to do it",
   "I built pipelines in Python (pandas, openpyxl), VBA macros, n8n flows, and a Power BI dashboard with 30+ DAX measures and a Star Schema model",
   "I bought a software"
  ],
  "correcta": 2,
  "explicacion": "S: reportes a mano (2h). T: automatizar 500+ reservas/día. A: Python + VBA + n8n + Power BI. R: 2h→15min, 10+ hrs."
 },
 {
  "tema": "💪 Your numbers",
  "pregunta": "STAR Story 2 (bilingual service): what was your RESULT?",
  "opciones": [
   "I lost clients",
   "Sustained satisfaction above 95% with international clients served in English",
   "I closed the call center",
   "I didn't measure anything"
  ],
  "correcta": 1,
  "explicacion": "Operación 24/7, clientes internacionales, inglés diario. Resultado: satisfacción >95% y clientes que volvían."
 },
 {
  "tema": "💪 Your numbers",
  "pregunta": "STAR Story 3 (Grupo Dokka): what did you analyze to improve conversion?",
  "opciones": [
   "50+ daily interactions and CRM metrics; I identified patterns by time of day and high-performing scripts",
   "Competitors' prices",
   "The team's vacations",
   "Nothing, it was intuition"
  ],
  "correcta": 0,
  "explicacion": "Análisis de 50+ interacciones/día + CRM → patrones → superaste KPIs de conversión, tiempo de gestión y satisfacción."
 },
 {
  "tema": "💪 Your numbers",
  "pregunta": "STAR Story 4 (No-Shows): what did your dashboard achieve?",
  "opciones": [
   "Nobody used it",
   "It was adopted as a daily tool and helped reduce No-Shows by ~3% with data-based decisions",
   "It deleted itself",
   "Only my mom saw it"
  ],
  "correcta": 1,
  "explicacion": "S: gerencia sin visibilidad. A: Star Schema + medidas DAX de No-Show e ingresos. R: herramienta diaria, -3% No-Shows."
 },
 {
  "tema": "💪 Your numbers",
  "pregunta": "Your one-line interview closing:",
  "opciones": [
   "'Well, thanks, bye'",
   "'Thank you for your time. This position combines understanding data and serving people; I can contribute from day one in ticket management and I pick up on incoming issues fast. What are the next steps?'",
   "'How much do you pay?'",
   "'I'm leaving now, OK?'"
  ],
  "correcta": 1,
  "explicacion": "Cierre con valor + pregunta de seguimiento. Terminás vos al mando, no en falso."
 }
];
window.ODEA_QUIZ_BANK.entrevistaRL = [
 {
  "tema": "Your story",
  "pregunta": "The interviewer says: “Tell me about yourself.” What do they really want?",
  "opciones": [
   "Your life story since childhood",
   "A 60-second summary: current role, experience, top skills, and what you are looking for",
   "A list of every tool you know",
   "Your salary history"
  ],
  "correcta": 1,
  "explicacion": "Estructura presente → pasado breve → futuro. Decila en voz alta: “I work as a Data Analyst at ANC Rent a Car. I have two years of experience with SQL, Python and Power BI, and I am looking for a remote role where I can grow in automation and analytics.”"
 },
 {
  "tema": "Your numbers",
  "pregunta": "Which opening line about your current role is strongest?",
  "opciones": [
   "“I work in a car rental company doing reports.”",
   "“I am a Data Analyst at ANC Rent a Car, at the San José airport, and I process more than five hundred reservations every day.”",
   "“I do many things with Excel.”",
   "“I have a job, but I want a remote one.”"
  ],
  "correcta": 1,
  "explicacion": "Rol + empresa + lugar + NÚMERO. Los números son tu credibilidad: 500+ reservaciones al día es tu frase ancla."
 },
 {
  "tema": "Your numbers",
  "pregunta": "“How did you reduce your reporting time?” — your best answer:",
  "opciones": [
   "“I just work faster now.”",
   "“The reports are easier than before.”",
   "“I automated the process with Python and VBA: what took two hours now takes fifteen minutes.”",
   "“My boss gave me less work.”"
  ],
  "correcta": 2,
  "explicacion": "Antes → acción → resultado con números: two hours → fifteen minutes. Sumá: “That eliminated more than ten hours of manual work every week.”"
 },
 {
  "tema": "Your numbers",
  "pregunta": "How do you say this in English? «Nuestros KPIs de satisfacción se mantienen sobre el 95%»",
  "opciones": [
   "“Our satisfaction KPIs stay over ninety-five percent.”",
   "“Our KPIs of satisfaction are up of 95.”",
   "“We have 95 satisfactions.”",
   "“The clients are 95 happy.”"
  ],
  "correcta": 0,
  "explicacion": "“Stay over ninety-five percent.” Practicá los números grandes en inglés: five hundred, ninety-five percent, fifteen minutes."
 },
 {
  "tema": "n8n",
  "pregunta": "What is n8n used for?",
  "opciones": [
   "Editing photos",
   "Workflow automation: connecting apps and APIs to move and transform data on a schedule",
   "Writing video games",
   "Designing dashboards only"
  ],
  "correcta": 1,
  "explicacion": "Definición en una frase, lista para la entrevista: “n8n is a workflow automation tool.” Es tu diferenciador: pocos analistas junior lo dominan."
 },
 {
  "tema": "n8n",
  "pregunta": "Your strongest n8n story — which version wins?",
  "opciones": [
   "“I know n8n, it is a good tool.”",
   "“Once I watched a tutorial about n8n.”",
   "“I built a pipeline in n8n that pulls reservation data automatically, cleans it, and feeds my reports — and when something fails, I check the execution log node by node.”",
   "“n8n is like Excel but online.”"
  ],
  "correcta": 2,
  "explicacion": "Historia completa: qué hace el pipeline + cómo resolvés fallos (execution log, node by node). Eso es exactamente el “pipeline monitoring and troubleshooting” del puesto."
 },
 {
  "tema": "n8n",
  "pregunta": "“The workflow runs on a schedule” means…",
  "opciones": [
   "El flujo se ejecuta automáticamente según un horario programado",
   "El flujo solo corre si alguien lo mira",
   "El flujo es muy rápido",
   "El flujo no tiene errores"
  ],
  "correcta": 0,
  "explicacion": "Vocabulario del puesto: schedule = horario programado. Otras dos que vas a oír: trigger (lo que dispara el flujo) y execution (cada corrida)."
 },
 {
  "tema": "BigQuery",
  "pregunta": "Which query is correct in BigQuery?",
  "opciones": [
   "SELECT TOP 10 * FROM ventas",
   "SELECT * FROM ventas WHERE ROWNUM <= 10",
   "SELECT * FROM ventas LIMIT 10; -- con la tabla como `proyecto.dataset.tabla`",
   "SELECT FIRST 10 * FROM ventas"
  ],
  "correcta": 2,
  "explicacion": "BigQuery usa LIMIT (como tu MySQL) y las tablas se escriben con backticks: `project.dataset.table`. TOP es de SQL Server y ROWNUM de Oracle."
 },
 {
  "tema": "BigQuery",
  "pregunta": "“Have you worked with BigQuery?” — your best honest answer:",
  "opciones": [
   "“Yes, I am an expert.” (aunque no sea cierto)",
   "“No.” (y nada más)",
   "“My daily SQL is MySQL and MariaDB. I have not used BigQuery in production yet, but I have been practicing in the sandbox — the logic transfers, only some syntax changes.”",
   "“BigQuery is the same as Excel.”"
  ],
  "correcta": 2,
  "explicacion": "Honestidad + plan + fortaleza. Nunca afirmés experiencia que no tenés: si te prueban con una consulta, la verdad bien contada gana."
 },
 {
  "tema": "BigQuery",
  "pregunta": "In BigQuery, how do you get the number of days between two dates?",
  "opciones": [
   "DATEDIFF(day, start, end)",
   "DATE_DIFF(end_date, start_date, DAY)",
   "end_date - start_date DAYS",
   "DAYS_BETWEEN(start, end)"
  ],
  "correcta": 1,
  "explicacion": "DATE_DIFF(fin, inicio, DAY): primero la fecha final, y la unidad (DAY, MONTH, YEAR) va al final. En tu MySQL sería DATEDIFF(fin, inicio) a secas."
 },
 {
  "tema": "SQL",
  "pregunta": "Which query finds DUPLICATE reservations (same booking code more than once)?",
  "opciones": [
   "SELECT * FROM reservations WHERE code = code",
   "SELECT code, COUNT(*) FROM reservations GROUP BY code HAVING COUNT(*) > 1",
   "SELECT DISTINCT code FROM reservations",
   "SELECT code FROM reservations ORDER BY code"
  ],
  "correcta": 1,
  "explicacion": "GROUP BY + HAVING COUNT(*) > 1: el patrón clásico de duplicados. Es una validación de calidad de datos que ya hacés en ANC."
 },
 {
  "tema": "Data quality",
  "pregunta": "“How do you make sure your data is correct?” — best answer:",
  "opciones": [
   "“I trust the source system.”",
   "“I check the final dashboard only.”",
   "“I validate row counts, check for duplicates and nulls, and compare the totals against the source before publishing.”",
   "“I ask my boss to check.”"
  ],
  "correcta": 2,
  "explicacion": "Tu rutina real, en orden: conteos, duplicados, nulos, totales contra la fuente. Decila completa y sonás a analista de producción, no de tutoriales."
 },
 {
  "tema": "Troubleshooting",
  "pregunta": "“A dashboard number looks wrong. What do you do first?”",
  "opciones": [
   "Tell the user the number is fine",
   "Rebuild the whole dashboard",
   "Check the source data and the filters first, reproduce the issue, then trace the pipeline step by step",
   "Wait until tomorrow"
  ],
  "correcta": 2,
  "explicacion": "Método, no pánico: fuente → filtros → reproducir → rastrear el pipeline. Es tu historia de Dokka y ANC aplicada: primero se aisla, después se arregla."
 },
 {
  "tema": "Your experience",
  "pregunta": "“Tell me about a high-pressure situation.” Your best real story:",
  "opciones": [
   "“I have never had pressure at work.”",
   "“At Grupo Dokka I handled customer cases under strict KPIs — handle time, service level and wait times — and I learned to prioritize and stay calm under pressure.”",
   "“Pressure is bad, I avoid it.”",
   "“Once I was late to work.”"
  ],
  "correcta": 1,
  "explicacion": "Tu etapa de call center ES experiencia de troubleshooting con clientes y métricas (TMO, nivel de servicio). No la escondás: es oro para un puesto que habla con equipos internos."
 },
 {
  "tema": "Interview English",
  "pregunta": "Complete your sentence: “I am responsible for…”",
  "opciones": [
   "“…do reports and dashboards.”",
   "“…building automated reports and dashboards for the operations team.”",
   "“…the boss tells me.”",
   "“…to work hard.”"
  ],
  "correcta": 1,
  "explicacion": "Después de “responsible for” va verbo en -ing: building, validating, automating. Tu frase completa describe tu trabajo real en ANC."
 },
 {
  "tema": "Interview English",
  "pregunta": "How do you say «Me encargo de validar los datos antes de publicar el reporte»?",
  "opciones": [
   "“I am in charge of validating the data before publishing the report.”",
   "“I charge the data before the report.”",
   "“My charge is the data.”",
   "“I validate responsible of data.”"
  ],
  "correcta": 0,
  "explicacion": "“I am in charge of...” = me encargo de. Cuidado con el falso amigo: charge no es encargo. Frase lista para usar el lunes."
 },
 {
  "tema": "Interview English",
  "pregunta": "You did not understand a question. The best move:",
  "opciones": [
   "Say “What?” and wait",
   "Guess and answer something else",
   "“Sorry, could you repeat that, please?” — it is normal and professional to ask",
   "Pretend you understood"
  ],
  "correcta": 2,
  "explicacion": "Pedir que repitan es profesional; adivinar es el error. También sirve: “Could you say that again, please?” o “Let me make sure I understood…”"
 },
 {
  "tema": "Tools",
  "pregunta": "“What tools do you use in your day-to-day work?” — best structure:",
  "opciones": [
   "Name one tool and stop",
   "“SQL, Python with pandas, Power BI, Excel, n8n and Git.” — then one short line about how you use the most relevant one",
   "List fifteen tools with no context",
   "“Mostly Excel.”"
  ],
  "correcta": 1,
  "explicacion": "Lista corta en orden de relevancia para EL puesto (SQL y n8n primeros para Remote Leverage) + una línea de uso. 45 segundos, no más."
 },
 {
  "tema": "Tools",
  "pregunta": "“What is DAX?”",
  "opciones": [
   "A database server",
   "The formula language used to build measures and calculations in Power BI",
   "A Python library",
   "A type of chart"
  ],
  "correcta": 1,
  "explicacion": "DAX = lenguaje de fórmulas de Power BI (medidas, columnas calculadas). Si te piden un ejemplo: “I use DAX for measures like total reservations and no-show rate.”"
 },
 {
  "tema": "Tools",
  "pregunta": "“What do you use Python for?” — your real answer:",
  "opciones": [
   "“Games and fun.”",
   "“With pandas I clean and transform data, read Excel and CSV files, and prepare datasets for Power BI.”",
   "“I do not really use Python.”",
   "“For hacking.”"
  ],
  "correcta": 1,
  "explicacion": "Tu uso real de pandas en ANC, en una frase. Si sigue la conversación: “I also automate repetitive Excel work with VBA and n8n.”"
 },
 {
  "tema": "Your gap, told well",
  "pregunta": "“What is your biggest gap for this role?” — the winning answer:",
  "opciones": [
   "“I am a perfectionist.”",
   "“I have no weaknesses.”",
   "“BigQuery and GCP are new for me. I am already practicing in the sandbox, and my core SQL is strong, so the ramp-up is about syntax, not concepts.”",
   "“English is very hard for me.”"
  ],
  "correcta": 2,
  "explicacion": "Brecha real + acción en curso + fortaleza que la compensa. El cliché de “perfeccionista” y el “no tengo debilidades” restan credibilidad."
 },
 {
  "tema": "Questions for them",
  "pregunta": "Which is the BEST question to ask them near the end?",
  "opciones": [
   "“How much is the salary?” (as the only question)",
   "“How many hours per week is the contract, and what does a typical week look like for this role?”",
   "“Nothing, I have no questions.”",
   "“Can I start next month?”"
  ],
  "correcta": 1,
  "explicacion": "Las horas por semana son EL dato que falta para valorar la oferta de contratista. También sirven: “What tools does the team use day to day?” y “What are the next steps?”. Tener preguntas = interés real."
 },
 {
  "tema": "Rate",
  "pregunta": "If they bring up the rate again, your line is:",
  "opciones": [
   "“I need twenty dollars or nothing.”",
   "“I put eleven dollars as my expectation; I am flexible within eleven to thirteen, depending on the hours and the scope.”",
   "“Whatever you want to pay is fine.”",
   "“Money is not important, do not worry.”"
  ],
  "correcta": 1,
  "explicacion": "La línea acordada: no renegociás el 11 que ya escribiste, abrís rango 11–13 atado a horas y alcance, y la negociación fuerte queda para la oferta. Decila con calma, sin disculparte."
 },
 {
  "tema": "Closing",
  "pregunta": "The best way to close the interview:",
  "opciones": [
   "“Okay, bye.”",
   "“Thank you for your time. I am very interested in the role, and I believe my experience with SQL and automation with n8n is a strong match. I look forward to the next steps.”",
   "“Please hire me, I really need this.”",
   "“When do I sign?”"
  ],
  "correcta": 1,
  "explicacion": "Cierre completo: gracias + interés + tu match (SQL + n8n) + próximos pasos. Es la última impresión: practícala hasta que salga sola."
 },
 {
  "tema": "n8n deep dive",
  "pregunta": "In n8n, your workflow fails at 2 a.m. and nobody notices until morning. What is the professional fix?",
  "opciones": [
   "Run it manually every day",
   "An Error Workflow that catches failures and sends you an alert (email or Telegram) with the execution details",
   "Delete the failing node",
   "Hope it does not fail again"
  ],
  "correcta": 1,
  "explicacion": "Los pipelines serios se vigilan solos. Decilo: “I always attach an error workflow that notifies me, so failures are visible the moment they happen, not the next day.”"
 },
 {
  "tema": "n8n deep dive",
  "pregunta": "What is the difference between a Webhook trigger and a Schedule trigger in n8n?",
  "opciones": [
   "There is no difference",
   "A webhook reacts to an external event in real time; a schedule runs at fixed times",
   "The webhook is only for emails",
   "The schedule is faster"
  ],
  "correcta": 1,
  "explicacion": "Evento vs reloj. Tu ejemplo real: en ANC tus procesos corren por horario; un webhook sería, por ejemplo, que cada reserva nueva dispare el flujo al instante."
 },
 {
  "tema": "n8n deep dive",
  "pregunta": "A node receives 500 items and you need to call an API for each one. What should you watch out for?",
  "opciones": [
   "Nothing, n8n is infinite",
   "Rate limits and execution time: process in batches or loop with pauses so the API does not block you",
   "Rename the workflow",
   "Use more colors in the canvas"
  ],
  "correcta": 1,
  "explicacion": "Decilo con tus palabras: “I process items in batches and respect the API rate limits, so the workflow is stable instead of fast and fragile.”"
 },
 {
  "tema": "n8n deep dive",
  "pregunta": "Where do API keys and passwords live inside an n8n workflow?",
  "opciones": [
   "Hard-coded in a Set node",
   "In the credentials store, referenced by the node — never written in plain text inside the flow",
   "In the workflow name",
   "In a sticky note"
  ],
  "correcta": 1,
  "explicacion": "Seguridad básica que un entrevistador valora: credenciales cifradas y referenciadas, jamás pegadas en el canvas."
 },
 {
  "tema": "n8n deep dive",
  "pregunta": "How do you debug a workflow that produces wrong data but no error?",
  "opciones": [
   "Rebuild everything",
   "Check the execution history node by node and compare input vs output items until the transformation that breaks the data appears",
   "Turn it off and on",
   "Ask the client to check"
  ],
  "correcta": 1,
  "explicacion": "Método, no magia: ejecuciones pasadas → ítems de entrada y salida por nodo. Es el mismo instinto que usás depurando un pandas raro."
 },
 {
  "tema": "n8n deep dive",
  "pregunta": "Your workflow sometimes processes the same record twice. What concept fixes that?",
  "opciones": [
   "Idempotency: design each run so repeating it does not duplicate the result (unique keys, upserts, checks before insert)",
   "A faster server",
   "More nodes",
   "Luck"
  ],
  "correcta": 0,
  "explicacion": "Palabra de entrevista: idempotency. Si el flujo corre dos veces, el resultado debe ser el mismo. Decila y explicala con un ejemplo simple."
 },
 {
  "tema": "BigQuery",
  "pregunta": "Why do BigQuery tables get partitioned by date?",
  "opciones": [
   "To look organized",
   "Queries that filter by date scan only the needed partitions, so they are faster and cheaper",
   "To change the colors",
   "Partitioning is only visual"
  ],
  "correcta": 1,
  "explicacion": "Costo y velocidad: BigQuery cobra por datos escaneados. Filtrar por la partición = escanear menos = pagar menos."
 },
 {
  "tema": "BigQuery",
  "pregunta": "In BigQuery, what does SELECT * cost you on a huge table?",
  "opciones": [
   "Nothing extra",
   "You pay for every column scanned — selecting only the columns you need is a basic cost habit",
   "Double storage",
   "It deletes data"
  ],
  "correcta": 1,
  "explicacion": "Frase lista: “I avoid SELECT star on big tables; I select only the columns the analysis needs, because BigQuery charges for data scanned.”"
 },
 {
  "tema": "BigQuery",
  "pregunta": "A column contains an ARRAY of values (for example, tags per client). How do you analyze its elements in BigQuery?",
  "opciones": [
   "It is impossible",
   "UNNEST turns each array element into its own row so you can filter and aggregate",
   "With a screenshot",
   "Export to Paint"
  ],
  "correcta": 1,
  "explicacion": "UNNEST es LA diferencia famosa de BigQuery frente a MySQL. Nombrala aunque sea a nivel conceptual: es exactamente lo que un entrevistador quiere oír de alguien que viene de MySQL."
 },
 {
  "tema": "BigQuery",
  "pregunta": "What is the honest, strong way to present your BigQuery level?",
  "opciones": [
   "“I am a BigQuery expert.”",
   "“My SQL is MySQL and MariaDB in production. The logic transfers directly; in BigQuery I already know the key differences — backticks for full table paths, LIMIT, DATE_DIFF with the end date first, and partitioning for cost.”",
   "“SQL is SQL, there are no differences.”",
   "Avoid the topic"
  ],
  "correcta": 1,
  "explicacion": "Honestidad + conocimiento concreto de las diferencias = la respuesta que contrata. Nunca digás experto: decí la verdad con detalle."
 },
 {
  "tema": "BigQuery",
  "pregunta": "BigQuery: what does DATE_DIFF(ending, start, DAY) return?",
  "opciones": [
   "An error",
   "The number of days between the two dates — note the END date goes first, the opposite of MySQL DATEDIFF",
   "A string",
   "The month only"
  ],
  "correcta": 1,
  "explicacion": "Detalle que delata práctica real: DATE_DIFF(end, start, DAY). En MySQL era DATEDIFF(end, start) sin la unidad."
 },
 {
  "tema": "BigQuery",
  "pregunta": "Why would a company keep marketing data in BigQuery instead of spreadsheets?",
  "opciones": [
   "Spreadsheets crash with volume; BigQuery handles millions of rows, connects to dashboards, and many people can query the same source of truth",
   "Spreadsheets are illegal",
   "BigQuery has better colors",
   "No reason"
  ],
  "correcta": 0,
  "explicacion": "Tu puente perfecto: “At ANC I hit the limits of Excel files; that is exactly the problem BigQuery solves — one source of truth at scale.”"
 },
 {
  "tema": "Live SQL",
  "pregunta": "RANK() vs ROW_NUMBER(): what is the difference?",
  "opciones": [
   "No difference",
   "ROW_NUMBER always gives unique consecutive numbers; RANK ties share the same rank and the next rank skips",
   "RANK is slower by law",
   "ROW_NUMBER is only for dates"
  ],
  "correcta": 1,
  "explicacion": "Ejemplo rápido para decir: dos clientes empatados en el puesto 1 → RANK da 1,1,3; ROW_NUMBER da 1,2,3."
 },
 {
  "tema": "Live SQL",
  "pregunta": "How do you compare this month's sales with last month's in one query?",
  "opciones": [
   "Two separate queries and a calculator",
   "Aggregate by month and use LAG() over the monthly column to bring the previous month's value onto the same row",
   "ORDER BY only",
   "A pivot table screenshot"
  ],
  "correcta": 1,
  "explicacion": "LAG() es la ventana estrella para comparaciones de período: “I use LAG to compare each month with the previous one inside the same query.”"
 },
 {
  "tema": "Live SQL",
  "pregunta": "A table has duplicate client rows. How do you keep only the newest one per client?",
  "opciones": [
   "DELETE everything",
   "ROW_NUMBER() OVER (PARTITION BY client ORDER BY date DESC) and keep the rows where it equals 1",
   "GROUP BY and pray",
   "Copy the table"
  ],
  "correcta": 1,
  "explicacion": "La receta de deduplicación que todo analista debe tener de memoria: particionar por cliente, ordenar por fecha, quedarse con el 1."
 },
 {
  "tema": "Live SQL",
  "pregunta": "LEFT JOIN: when do rows from the left table appear with NULLs on the right?",
  "opciones": [
   "Never",
   "When there is no matching row in the right table — that is exactly how you find, for example, clients with no purchases",
   "When the query is wrong",
   "Only on Fridays"
  ],
  "correcta": 1,
  "explicacion": "Truco de entrevista: LEFT JOIN + WHERE right.id IS NULL = encontrar los que faltan (clientes sin compras, reservas sin pago)."
 },
 {
  "tema": "Live SQL",
  "pregunta": "WHERE vs HAVING: what is the rule?",
  "opciones": [
   "They are interchangeable",
   "WHERE filters rows before grouping; HAVING filters groups after aggregation",
   "HAVING is only for dates",
   "WHERE is deprecated"
  ],
  "correcta": 1,
  "explicacion": "Frase corta y correcta: “WHERE filters rows, HAVING filters groups.” Si te piden un ejemplo: HAVING SUM(amount) > 1000."
 },
 {
  "tema": "Live SQL",
  "pregunta": "Why use a CTE (WITH ...) instead of nested subqueries?",
  "opciones": [
   "It runs 10x faster by magic",
   "Readability and maintenance: each step has a name, so the logic reads top to bottom and is easier to debug",
   "CTEs are mandatory",
   "To impress the interviewer only"
  ],
  "correcta": 1,
  "explicacion": "Decilo como hábito profesional: “I write CTEs so each transformation step is named and testable — the next person can read my logic.”"
 },
 {
  "tema": "Dashboards & KPIs",
  "pregunta": "A landing page gets 10,000 visits and 350 people buy. What is the conversion rate?",
  "opciones": [
   "35%",
   "3.5%",
   "0.35%",
   "350%"
  ],
  "correcta": 1,
  "explicacion": "350 / 10,000 = 3.5%. Las cuentas de marketing que te pueden pedir en vivo son así de directas: practicá decir el cálculo en voz alta."
 },
 {
  "tema": "Dashboards & KPIs",
  "pregunta": "What does CTR measure?",
  "opciones": [
   "Total revenue",
   "Click-through rate: clicks divided by impressions — how effective an ad or link is at generating clicks",
   "Cost per client",
   "Time on page"
  ],
  "correcta": 1,
  "explicacion": "CTR = clicks ÷ impressions. Y su pareja: conversion rate = buyers ÷ visitors. Las dos definiciones, de memoria."
 },
 {
  "tema": "Dashboards & KPIs",
  "pregunta": "What makes a metric a vanity metric?",
  "opciones": [
   "It is green",
   "It looks good but does not change any decision — for example, total followers when the goal is sales",
   "It is hard to calculate",
   "It comes from Excel"
  ],
  "correcta": 1,
  "explicacion": "Tu frase: “I focus on metrics that drive decisions: conversion, revenue and retention — not numbers that only look good in a report.”"
 },
 {
  "tema": "Dashboards & KPIs",
  "pregunta": "Who is the audience? Why does that question come BEFORE building a dashboard?",
  "opciones": [
   "It does not matter",
   "A manager needs three headline KPIs; an analyst needs detail to drill down. The audience decides the design",
   "Dashboards are all the same",
   "Design first, always"
  ],
  "correcta": 1,
  "explicacion": "Experiencia real tuya: tus reportes de ANC cambiaron cuando entendiste quién los leía. Contalo así, con ese ejemplo."
 },
 {
  "tema": "Dashboards & KPIs",
  "pregunta": "A funnel shows 1,000 visits → 400 sign-ups → 90 purchases. Where do you investigate first?",
  "opciones": [
   "The colors",
   "The biggest drop: sign-ups to purchases loses 310 — that step is where the money leaks",
   "The visits",
   "Nothing, it is normal"
  ],
  "correcta": 1,
  "explicacion": "Leer un funnel = buscar la caída más grande. 400 → 90 es una pérdida del 77.5% en el último paso: ahí va la investigación."
 },
 {
  "tema": "Data quality",
  "pregunta": "Before loading data into a report, what three checks do you run?",
  "opciones": [
   "Open, look, send",
   "Row counts vs source, nulls in key columns, and duplicates — then spot-check a few values by hand",
   "Trust the file",
   "Check the file name"
  ],
  "correcta": 1,
  "explicacion": "Tu rutina real de ANC, en inglés: “I check row counts, nulls in key fields and duplicates before anything reaches a dashboard.”"
 },
 {
  "tema": "Data quality",
  "pregunta": "A stakeholder says: “your dashboard numbers do not match mine.” What do you do first?",
  "opciones": [
   "Defend your numbers",
   "Compare definitions and filters calmly: same date range? same status filter? Most mismatches are definition differences, not errors",
   "Rebuild the dashboard",
   "Ignore it"
  ],
  "correcta": 1,
  "explicacion": "Respuesta de adulto profesional: primero definiciones, después datos. El 90% de los “errores” son filtros distintos."
 },
 {
  "tema": "Data quality",
  "pregunta": "Why do you reconcile totals against the source system after an automated load?",
  "opciones": [
   "Boredom",
   "Automation can fail silently; reconciling totals (rows and sums) proves the load is complete before anyone makes decisions with it",
   "It is a legal ritual",
   "To fill time"
  ],
  "correcta": 1,
  "explicacion": "Silent failures son el enemigo de los pipelines. Reconciliar = tu red de seguridad, y conecta con tus error workflows de n8n."
 },
 {
  "tema": "Behavioral",
  "pregunta": "“Tell me about a mistake you made.” What makes an answer strong?",
  "opciones": [
   "“I never make mistakes.”",
   "A real, small story with the STAR arc: what happened, what you did to fix it, and what you changed so it does not repeat",
   "Blame a coworker",
   "A joke"
  ],
  "correcta": 1,
  "explicacion": "La estructura que contrata: error honesto → acción inmediata → aprendizaje permanente (un checklist, una validación). Prepará UNA historia real tuya."
 },
 {
  "tema": "Behavioral",
  "pregunta": "“Why do you want to work remotely for a company abroad?” Best angle?",
  "opciones": [
   "“To work less.”",
   "Growth and reach: access to bigger teams and tools, full English environment, and you bring LATAM cost-efficiency with US-hours overlap",
   "“My current job is terrible.”",
   "“For the dollars only.”"
  ],
  "correcta": 1,
  "explicacion": "Nunca hables mal de ANC: hablá de crecimiento. “I want an international environment where English and automation are the center of the role.”"
 },
 {
  "tema": "Behavioral",
  "pregunta": "You do not know a tool the interviewer mentions. What do you say?",
  "opciones": [
   "Invent a project with it",
   "Be direct: you have not used it in production, name the closest thing you HAVE used, and say how fast you learned a similar tool before",
   "Stay silent",
   "Change the topic"
  ],
  "correcta": 1,
  "explicacion": "Tu patrón ya probado en postulaciones: brecha declarada + experiencia adyacente + velocidad de aprendizaje demostrada (Power BI y n8n los aprendiste trabajando)."
 },
 {
  "tema": "Behavioral",
  "pregunta": "“Tell me about a time you automated something.” Your best story?",
  "opciones": [
   "A made-up story",
   "Your real one: ANC reports took 2 hours by hand; you automated them with Python, VBA and templates down to 15 minutes, removing 10+ manual hours every week",
   "A story from a course",
   "Something tiny"
  ],
  "correcta": 1,
  "explicacion": "Es tu historia estrella: números, herramientas y resultado. La decís en STAR: situación (2 horas manuales), tarea, acción (scripts + macros), resultado (15 minutos)."
 },
 {
  "tema": "Closing & logistics",
  "pregunta": "The interviewer asks: “Do you have any questions for us?” You say…",
  "opciones": [
   "“No, all clear.”",
   "Yes: ask about the team, the data stack, what success looks like in the first 90 days, and the working hours",
   "“How much is the salary?” (only)",
   "“When do I start?”"
  ],
  "correcta": 1,
  "explicacion": "Preguntar bien te sube puntos: equipo, stack, éxito a 90 días y horario. El horario además TE importa como contratista: es tu pregunta clave."
 },
 {
  "tema": "Closing & logistics",
  "pregunta": "They ask about your rate expectation. Your line?",
  "opciones": [
   "“Whatever you offer.”",
   "“I put eleven dollars as my expectation, and I am flexible within eleven to thirteen depending on the hours and the scope.”",
   "“Twenty or nothing.”",
   "“Let me think for a week.”"
  ],
  "correcta": 1,
  "explicacion": "Tu línea ya decidida: no renegociás el 11 que escribiste; dejás la banda 11–13 abierta según horas y alcance. La negociación real es en la oferta."
 },
 {
  "tema": "Closing & logistics",
  "pregunta": "“When could you start?” — the professional answer without overcommitting:",
  "opciones": [
   "“Tomorrow, no problem.” (without knowing)",
   "“I want to leave my current role professionally, with a proper handover; once we agree, I can confirm my exact start date.”",
   "“In six months.”",
   "“Whenever.”"
  ],
  "correcta": 1,
  "explicacion": "Salida profesional y segura: compromiso con una transición ordenada y fecha exacta al acordar — no prometés una fecha que no decidiste."
 },
 {
  "tema": "Closing & logistics",
  "pregunta": "What is your greatest weakness? The strong, honest format:",
  "opciones": [
   "“I am a perfectionist.”",
   "A real one with your countermeasure: “BigQuery is new for me in production, so I am actively studying its differences from MySQL and practicing queries before starting.”",
   "“I have none.”",
   "Something dramatic"
  ],
  "correcta": 1,
  "explicacion": "Debilidad real + plan activo = madurez. Tu brecha de BigQuery, dicha así, suma en vez de restar."
 },
 {
  "tema": "English under pressure",
  "pregunta": "You do not understand a question in the interview. The rescue phrase?",
  "opciones": [
   "Silence",
   "“Sorry, could you rephrase that, please?” — or “Just to make sure I understood: are you asking about…?”",
   "“Yes.” (without understanding)",
   "Laugh and move on"
  ],
  "correcta": 1,
  "explicacion": "Pedir que reformulen es profesional, no debilidad. La segunda variante — repetir lo que entendiste — además demuestra escucha activa."
 },
 {
  "tema": "English under pressure",
  "pregunta": "The call freezes mid-answer. What do you do?",
  "opciones": [
   "Keep talking to nobody",
   "Reconnect calmly and say: “Sorry, the call froze — I was saying that…” and continue from your last complete idea",
   "End the interview",
   "Blame the company internet"
  ],
  "correcta": 1,
  "explicacion": "Los fallos técnicos en remoto son normales: lo que evalúan es tu calma. Tené el Zoom probado y esta frase lista."
 }
];
