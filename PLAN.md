# Plan definitivo — ODEA: ecosistema conectado por fases

> **Base:** v5.40 · **Repo:** `JoseAn03/plan-analista-datos` (rama `main`)
> **Archivos:** `odea.html`, `sw.js`, `manifest.json`
> **Fuente:** fusión de la *Auditoría completa de ODEA* + *Prompt maestro Ecosistema por fases*, con correcciones verificadas contra el código real.
> **Fecha:** 2026-10-10

---

## 0. Estado verificado del código (lo que es verdad, no lo que se asume)

- `dailyMissions` tiene **168 misiones en 56 días únicos**. `DAILY_TOTAL` **vale 56**, no 42.
- El dato "56 días" es el correcto. Lo único que dice "42" son vestigios: comentarios `// 42 días`, `// días 1..42`, `/* Ruta 42 días */`, y el logro `ach_d42` (cuyo texto está desactualizado, pero su condición `dailyN >= 42` **sí se cumple**; es un hito válido).
- **No existe `APP_VERSION`**. La versión está hardcodeada: `v5.40` visible (logo/badge/footer) + comentarios sueltos `v4.1`, `v4.8`, `V5.16b`, `v5.8`, `v6.3`.
- `SAVE_KEY = "odea_save_v2"`, `OLD_KEY = "odea_save_v1"`. Respaldo cubre solo esa clave hoy.
- Footer anuncia "557 misiones" — no verificable; el conteo real jugable es ~303 (54 campaña + 9 jefes + 168 diarias + 8 semanales + 46 empleo + 18 B2B). Hay **9 jefes** (6 dioses + 3 titanes), no 4.
- **0 `aria-label`** en ~62 botones. `escapeHtml()` existe y se usa bien con `playerName`.
- **Sin bus de eventos, sin módulos, sin `import()` dinámico.**
- **Sin versionado de esquema** de `localStorage` ni aviso de save corrupto.
- 2 cadenas `requestAnimationFrame` (partículas + monitor FPS) — la del monitor FPS es excepción válida a la regla de "un solo bucle".
- Los archivos del `SHELL` del SW **sí existen** (`index.html`, `quiz.html`, `quiz-definitivo.html`, `manifest.json`): no hay riesgo de `addAll` fallido.
- Seguridad: 100% cliente, sin secretos ni endpoints privados.

---

## Reglas innegociables (corregidas)

1. **No rompas el progreso guardado.** No cambies el formato de lo ya guardado. Todo campo nuevo es opcional, con valor por defecto al cargar. Si algo exige migrar datos, detente y pregunta.
2. **Conserva el respaldo** (botón RESPALDAR) y haz que cubra **todas las claves `odea_*`** (no solo `gameState`).
3. **Un cambio grande = una fase.** Entrega una fase por respuesta y espera el "OK" antes de seguir.
4. **Entrega archivos completos** (no fragmentos), con la sintaxis de todo el JS validada (`node --check`).
5. **Versionado único de verdad:** `const APP_VERSION = "5.40"` y `const CACHE_VERSION = "odea-v" + APP_VERSION`, sincronizado con `sw.js`. Reemplazar los strings hardcodeados y limpiar comentarios de versión vieja. (Esta regla **crea** la constante; no la asume.)
6. **Offline y rendimiento:** máximo un bucle de animación *de contenido* (el monitor FPS es excepción válida), pausa con pestaña oculta, animar solo `transform`/`opacity`, sin blur/sombras pesadas nuevos.
7. **Accesibilidad:** `aria-label` en botones, foco visible, texto escapado con `escapeHtml`. **Aplica también a los ~62 botones existentes** (corrección transversal, no solo "lo nuevo").
8. **Si algo es ambiguo, pregunta.** La inconsistencia 42/56 **ya está resuelta**: es **56**. Solo queda limpiar vestigios.

---

## Hoja de ruta definitiva (paso a paso)

### FASE 0 — Auditoría ✅ (completada)
Verificación del estado real del código contra los documentos. **Resultado:** ver "Estado verificado" arriba. No requiere cambios de código.

---

### FASE 0.5 — Endurecimiento P0 (antes de cualquier feature)
*Objetivo: blindar datos e identidad sobre una base limpia. Est. ~2-3 h.*

1. **Versión única de verdad.**
   - Añadir `const APP_VERSION = "5.40";` en `odea.html`.
   - Derivar `CACHE_VERSION = "odea-v" + APP_VERSION` y sincronizar `sw.js`.
   - Reemplazar los `v5.40` hardcodeados (logo/badge/footer) por `APP_VERSION`.
   - Limpiar comentarios `v4.1`, `v4.8`, `V5.16b`, `v5.8`, `v6.3`.
   - **Verificación:** una sola constante controla la versión; `APP_VERSION === CACHE_VERSION` siempre.

2. **Limpieza 42/56.**
   - Actualizar el **texto** de `ach_d42` ("Completar los 42 días…" → mantener hito de 42, corregir redacción coherente). No borrar el logro.
   - Limpiar comentarios `// 42 días`, `// días 1..42`, `/* Ruta 42 días */`, `// desbloqueo por nivel` obsoleto.
   - **Verificación:** cero referencias residuales a "42" como total; el total es 56 en todas partes.

3. **Respaldo extendido a todas las claves `odea_*`.**
   - `exportSave`/`importSave` iteran `Object.keys(localStorage)` filtrando por prefijo `odea_`.
   - Mantiene retrocompatibilidad con respaldos viejos (solo array `completedMissions` o solo `gameState`).
   - **Verificación:** exportar → borrar → importar → el progreso vuelve íntegro.

4. **Aviso de save corrupto.**
   - Si `loadGame()` falla al parsear, avisar al usuario (toast/diálogo) y ofrecer restaurar desde un respaldo, en vez de "app vacía" silenciosa.
   - **Verificación:** simular JSON corrupto y comprobar el aviso.

5. **Footer dinámico.**
   - Calcular el conteo real de misiones en runtime (suma de arrays) y mostrarlo, en vez de "557".
   - **Verificación:** el número del footer coincide con el conteo real.

*Criterio de salida:* `python3 tests/smoke.py` en verde + pruebas manuales de respaldo/reinicio/importación.

---

### FASE 1 — Núcleo de eventos
- Bus pequeño: `ODEA.bus.emit(tipo, datos)` y `ODEA.bus.on(tipo, fn)`.
- Tipos iniciales: `mission.completed`, `focus.completed`, `coins.spent`, `streak.changed`, `achievement.unlocked`, `boss.defeated`, `capital.updated`, `job.applied`, `minigame.finished`.
- **Inventariar primero todos los puntos de mutación** (`gameState.X =` y `gameState.X.push(`) — requisito añadido para evitar doble contabilización.
- Emitir eventos **sin cambiar comportamiento visible** (reemplazo gradual).
- Registro de últimos 500 eventos en clave `odea_events` con tope.
- Manejadores **idempotentes** (doble procesamiento no duplica XP).
- Entrega: lista de pruebas de regresión manuales.

---

### FASE 2 — Agenda de hoy
- Pantalla de inicio que reúna el día: misiones, hábitos, estudio (universidad/inglés), gimnasio, postulaciones, recordatorios.
- Datos del estado/eventos, sin duplicar. Carga al instante (reusa render diferido).

---

### FASE 2.5 — Planner personal (organizador de misiones) 🗓️
*Objetivo: que el usuario arme su propio plan eligiendo y ordenando varias misiones de cualquier frente.*

- **Selección libre:** el usuario elige misiones de cualquier frente (estudio, capital, empleo, vida, campaña) y las agrega a su plan del día/semana.
- **Orden a gusto:** puede reordenarlas (mover arriba/abajo, quitar) para armar una secuencia de trabajo.
- **Integración total al ecosistema:** al completar una misión del plan, suma **XP/monedas/racha igual que cualquier otra** — el progreso fluye por el bus de eventos (Fase 1), no hay contabilidad aparte.
- **Datos:** lista de misiones seleccionadas + orden, guardada en clave propia `odea_planner` (cubierta por el respaldo extendido de la Fase 0.5). Referencia por `id` de misión, sin duplicar contenido.
- **Conexión con calendario:** botón para exportar el plan del día a `.ics` (se engancha a la Fase 6).
- **Carga al instante:** reusa el render diferido existente.

*Criterio de salida:* elegir 3-4 misiones de frentes distintos → reordenar → completar una → el XP/monedas/racha se actualizan igual que en el flujo normal; exportar/importar conserva el plan.

---

### FASE 3 — Dominios como configuración
- Dominios (Carrera, Estudio, Proyectos, Negocio, Cuerpo, Capital) como datos de config editables: `id`, nombre, icono, color, XP, nivel.
- Agregar dominio = agregar un objeto de config, no lógica nueva.

---

### FASE 4 — Ciclos y funciones nuevas (todo vía bus)
- a) Modo enfoque (Pomodoro 25/5) → XP al dominio + puede completar misión asociada.
- b) Congelador de racha (tienda, protege un día; máx. 2 en inventario).
- c) Tracker de postulaciones (Empleo): empresa, fecha, estado, meta semanal.
- d) Diario de una línea (bonus XP, 1/día).
- e) Mapa de calor de actividad + resumen semanal compartible.
- f) Multiplicador por racha con tope.

---

### FASE 5 — Marco de minijuegos
- Módulos independientes cargados con `import()` dinámico (no entran al archivo principal).
- Contrato: `init(contenedor)`, `destroy()`, emite `minigame.finished` → recompensa **siempre vía bus**.
- Tope diario de XP por minijuegos. Canvas 2D, un bucle, delta de tiempo, pausa con pestaña oculta.
- Puntajes en clave propia. **Primer minijuego:** trivia SQL/Python con tiempo y racha de aciertos.

---

### FASE 6 — Conexiones externas (sin servidor)
- GitHub: commits públicos vía API, cacheado (60 req/h).
- Calendario: exportar `.ics`.
- ODEALAND: enlace + reclamo manual de XP con código. No prometer comunicación automática.

---

### FASE 7 — Base técnica (solo con aprobación explícita)
- Migración a IndexedDB versionada y reversible, módulos separados, misiones/dominios en config.
- **No ejecutar sin aprobación.**

---

## Accesibilidad transversal (se integra a lo largo de las fases)

- **Corrección de los ~62 botones sin `aria-label`** — tarea barata y de alto impacto, se hace en paralelo (idealmente junto a la Fase 0.5 o Fase 1).
- Foco visible (`:focus-visible`) en toda interacción nueva y existente.

---

## Formato de cada entrega

1. Resumen de lo hecho + archivos cambiados.
2. Archivos completos.
3. Pruebas manuales paso a paso (incl. exportar → reiniciar → importar → progreso intacto).
4. Cómo revertir si algo falla.
5. Pregunta de si apruebo seguir con la siguiente fase.

---

## Orden recomendado de arranque

1. **Fase 0.5 (P0)** — deuda crítica, base limpia.
2. **Accesibilidad (62 botones)** — paralela o inmediatamente después.
3. **Fase 1 (bus de eventos)** — sobre hormigón, no arena.
4. **Fase 2 (Agenda de hoy)** — pantalla automática del día.
5. **Fase 2.5 (Planner personal)** — organizar varias misiones a tu gusto, integrado al ecosistema.
6. Fases 3 → 7 en orden, con OK entre cada una.
