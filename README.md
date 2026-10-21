# ODEA — Operación Dominio de Datos e IA

Ruta gamificada de **56 días** para convertirte en analista de datos, con misiones diarias,
proyectos por capítulo, jefes, logros, tienda e inventario. Funciona como PWA instalable y
guarda el progreso en `localStorage`.

**App en vivo:** https://josean03.github.io/plan-analista-datos/

---

## Estructura

| Archivo | Qué es |
|---|---|
| `odea.html` | **La aplicación completa** (HTML + CSS + JS en un solo archivo) |
| `index.html` | Redirección a `odea.html` (la raíz del sitio) |
| `assets/` | Imágenes (WebP), CSS y JS de la interfaz v7 |
| `manifest.json` | Manifest de la PWA |
| `sw.js` | Service worker (offline + auto-actualización) |
| `tests/smoke.mjs` | Smoke test Node (sintaxis JS + invariantes + Sagas + curva de niveles/perfil + La Cacería v5.69). Es el que usa el CI |
| `quiz.html`, `quiz-definitivo.html` | Cuestionarios sueltos, no enlazados desde la app |

### Cifras del contenido

- **168 misiones diarias** = 56 días × 3 misiones (slots A/B/C)
- **54 misiones de campaña** + **4 jefes** = 58
- **8 misiones semanales**
- **8 capítulos** (día 0 y días 1–56)
- **2 sagas · 12 capítulos** (5 de video + 7 de Roblox), con XP para Legado y Poder & Imagen
- **La Cacería:** 37 misiones (17 diarias con ráfaga 5–7, 8 semanales con metas 50/80/100, 4 de calidad, 5 de portafolio/LinkedIn y 3 sorpresa), 120 objetivos de disparo rápido, Radar de 5 señales diarias, 30 preguntas de entrevista y 8 insignias propias

---

## Desarrollo

No hay build. Se edita `odea.html` y se recarga el navegador.

```bash
# Servir en local (el service worker necesita http, no file://)
python3 -m http.server 8080
# o
npx serve .
```

Luego abre `http://localhost:8080/odea.html`.

### Tests

```bash
node tests/smoke.mjs
```

Solo requiere Node 18+. Valida la sintaxis del JS inline, la coherencia de versión
HTML/sw.js, los respaldos, los IDs del DOM, el contenido de los 56 días, las Sagas,
el Nivel ODEA, la curva de XP, la racha global, el diario persistente, Mi Plan expandible,
el perfil y el estado/migración de La Cacería.
El workflow `.github/workflows/smoke.yml` lo ejecuta en cada push a `main` y en cada PR.
(`tests/smoke.py` se conserva como variante antigua, pero el CI ya no lo usa).

### Versionado

Al publicar cambios hay que tocar **dos** sitios:

1. `APP_VERSION` y el badge `v…` dentro de `odea.html`
2. `CACHE_VERSION` en `sw.js` (fuerza la actualización en los clientes)

Si cambias `assets/odea-ui-v7.css` o `assets/odea-icons-v7.js`, sube también el
cache-busting `?v=` con el que se referencian en `odea.html` y en `SHELL`.

### Sagas (v5.61+)

Las Sagas son misiones largas (5 y 7 capítulos) para crear videos y un juego de Roblox
con tu hijo. Guardan su progreso en una **clave nueva**, `odea_sagas_v1`, separada de
`odea_save_v2`:

- No se renombra ni se borra ninguna clave existente; `SAVE_KEY` sigue siendo `odea_save_v2`.
- Si la clave no existe (usuario nuevo o respaldo viejo), las Sagas arrancan en 0 y el resto intacto.
- `exportSave` ya incluye todas las claves `odea_*`, así que el respaldo lleva las Sagas.
  Al importar un respaldo viejo la app sigue funcionando y las Sagas empiezan de cero.
- El XP se calcula al vuelo en `vidaCompute()`: 60/40 a Legado/Poder en video y 75/25
  en Roblox. No se guarda XP extra ni se duplica.
- La misión semanal «Grabar 1 video corto con mi hijo» llama a `updateStreak()`
  (con escudo y congeladores) y guarda la partida.
- En v5.63 las Sagas también son un mundo del **Mapa**. Cada capítulo suma **1 moneda**,
  completar una saga suma **+5** y la misión semanal suma **+1**. Las monedas se calculan
  al vuelo en `sagaCoinsEarned()`; el XP sigue entrando una sola vez por `vidaCompute()`.

### Mi Plan desde cualquier frente (v5.64)

Cada tarjeta de misión elegible lleva un botón **＋** que la agrega a *Mi Plan*.
Las misiones de la campaña principal y las de la pestaña *Hoy* no lo llevan.
Reutiliza `gameState.planner.items` con refs `{f, id}`: no hay clave nueva,
no hay migración y el progreso guardado sigue intacto.

- **Frentes con ＋:** Vida (sus 7 zonas), Imperio (`cap`/`eng`/`ai`), Noticias,
  B2B y Sagas. También aparece en los modales del mapa, que reutilizan los
  mismos renders (`vida-zona`, `cap-zona`, `jobs-blk`, `b2b-ch`).
- **Estados:** ＋ = no está en el plan · ✓ = ya está (tocar de nuevo la quita).
  El estado se lee de `gameState.planner`, así que siempre coincide con el
  panel «Agregar misiones».
- **Sin efectos colaterales:** el clic se captura en fase de captura
  (`document`, `capture: true`) y hace `stopPropagation`, así que el ＋ nunca
  abre la misión, no la completa y no otorga XP.
- **Vida completa:** `vidaMissionIndex()` indexa las 18 listas de Vida
  (Equilibrio, Legado, Alianza, Poder, Sabios, Planes y Orden) en diferido.
  `RETOS` queda fuera a propósito: es el reto del día y vive en *Hoy*.
- **Verificación:** `node tests/smoke.mjs` incluye 4 checks del ＋.

### Niveles, racha y perfil (v5.66)

Un solo ecosistema para todo el progreso:

- **Curva de Nivel ODEA:** se calcula con **todo** `gameState.totalXP` mediante
  `ODE_LADDER` y `odeInfo()`. Son 63 niveles con una curva progresiva
  (`120.000 XP` máximo, exponente `1.75`): los primeros niveles suben rápido y
  cada vez cuesta más. Hitos: Nv.2 = 88 XP, Nv.3 = 295, Nv.5 = 991,
  Nv.10 = 4.097, Nv.20 = 15.147, Nv.30 = 31.746, Nv.40 = 53.316,
  Nv.50 = 79.495 y Nv.63 = 120.000. Así 5.000 XP ya no disparan al nivel 35:
  equivalen al Nv.11. Es el nivel que se ve en el HUD, la identidad lateral y el mapa.
- **Día del plan:** `gameState.level` se conserva como día de campaña
  (`campaignLevel()`); los días se desbloquean con `unlockedDay()` y los jefes
  usan ese día. La UI lo llama **DÍA** y el perfil lo muestra como dato aparte.
- **XP completo:** `gameState.totalXP = carrera + logros + vida + capital + enfoque +
  diario + jefes`. Los jefes (`GOD_BOSSES`, `TITAN_BOSSES`, `VIDA_BOSSES`) ya suman
  de verdad, no solo en el toast. El diario guarda un historial `diary.log` y su XP
  ya no se pierde al cambiar de día; los guardados viejos migran solos.
- **Racha global:** sube al completar un día entero de *Hoy* (3/3), al marcar la
  misión semanal de Sagas o al llegar a **5 misiones** del día en cualquier frente.
  Se registra en `gameState.activity[YYYY-MM-DD]` (`activityAdd()` /
  `activityMaybeStreak()`), sin farmear dos veces el mismo día.
- **Mi Plan expandible:** cada misión agregada se puede tocar para ver qué hacer,
  cómo verificarla, tiempo, pasos, por qué y reto. Expandir no completa ni
  desmarca la misión; el área táctil del título mide 48 px.
- **Perfil dentro del inventario:** el modal `#rw-layer` ahora tiene las pestañas
  **PERFIL** y **ARSENAL**. El perfil es el único lugar para las estadísticas:
  Nivel ODEA, XP total, desglose por fuente, ritmo de la curva, racha, día de
  campaña, misiones, logros, monedas, los 8 frentes con atajo directo, dominios
  y rangos internos de cada frente.
- **Barra lateral limpia:** se quitó el panel `#side-stats` (perfil duplicado,
  dominios, Vida, Imperio, XP del ecosistema, radar, tiempo y chips). La barra
  conserva identidad, nivel, navegación y una sección plegable **⚙️ AJUSTES**
  con el salón de logros, respaldar, restaurar y los dos reinicios.
- **CSS corregido:** el `@media (max-width:400px)` de los días se cerraba mucho
  después y se tragaba VIDA, planner, Sagas e inventario. Ahora cierra donde debe,
  así que esos estilos también se aplican en escritorio. En móvil, `.layout` usa
  `align-items:stretch` y `.main-col{width:100%;min-width:0}` para que el plan
  expandido no ensanche el viewport (verificado a 390 px).

No cambian `SAVE_KEY` (`odea_save_v2`) ni `SAGA_KEY` (`odea_sagas_v1`); todos los
campos nuevos son aditivos y `loadGame()` los normaliza.

### La Cacería (v5.69+)

La Cacería reemplaza funcionalmente al antiguo mundo de Empleo con un mundo propio de
postulaciones reales. Es un ítem independiente de la barra lateral (después de **HOY**),
con su propio ícono y cinco zonas:

- **RADAR:** lista de **5 señales diarias** con un check por señal. No pide empresa,
  puesto, enlace, match ni notas. Cada señal paga **+20 XP y +1 🪙** al instante;
  completar las cinco paga un bonus de **+50 XP y +3 🪙** y cierra la misión diaria.
  Las vacantes guardadas en versiones anteriores siguen disponibles en FORJA.
- **FORJA:** adapta el CV con tres chequeos por vacante (palabras clave, proyecto y carta).
  Los tres activan **DAÑO CRÍTICO LISTO**.
- **DISPARO:** el ataque principal es **un solo botón**. Cada toque elige automáticamente
  empresa, puesto, match y nivel de una bolsa de **120 objetivos** (30 empresas × 4 roles),
  registra la postulación y suma XP/monedas/combo sin pedir formulario. El botón cambia a
  **RÁFAGA COMPLETA** o **CUOTA CUMPLIDA** y permite seguir disparando. “Registrar con
  detalle” abre el formulario completo solo para quien quiera seguimiento fino; “Cambiar
  objetivo” salta al siguiente sin registrar nada. La cuota diaria es configurable (5 por
  defecto) y se paga una sola vez al cumplirla.
- **SEGUIMIENTO:** embudo de cuatro etapas, tabla con búsqueda/filtros, estados,
  seguimientos, fechas vencidas y plantillas copiables.
- **JEFE:** Modo Jefe con 30 preguntas, cronómetro, barra de vida, autoevaluación,
  historial, favoritas, preguntas propias y repetición de falladas.

Detalles de implementación:

- **Estado aditivo:** todo vive en `gameState.hunt` dentro de `odea_save_v2`.
  No cambian `SAVE_KEY` ni `SAGA_KEY`; `normalizeHunt()` migra guardados viejos
  sin tocar otros mundos.
- **Una sola fuente de verdad:** el XP y las monedas de La Cacería se calculan desde
  `hunt.log` (`shot`, `mission`, `bonus`, `boss`, `quota`, `radar`). `recomputeState()`
  suma la categoría `hunt` y `coinsEarned()` suma sus monedas, sin duplicar estado.
  Los checks del Radar viven en `hunt.radarChecks` y se reinician cada día.
- **Misiones:** 37 en total (17 diarias con 4 fijas + 6 rotativas, 8 semanales,
  4 de calidad, 5 de portafolio/LinkedIn y 3 sorpresa). La misión fija **Ráfaga** pide
  postular a **5–7 empresas hoy** (el objetivo exacto rota 5/6/7 según el día) y las
  semanales intensivas piden **25, 50, 80 o 100** postulaciones. Hay bonus por calidad,
  racha, combo y cuota; los rangos son Novato, Rastreador, Cazador, Élite y Leyenda.
- **Insignias:** primera postulación, 10, 50, 100, primera entrevista, primera oferta,
  racha 7 y racha 30. También se reflejan en el Salón de Logros global como `ach_hunt_*`.
- **Respaldo:** `exportSave` incluye La Cacería y `importSave` la normaliza; un respaldo
  viejo sin `hunt` carga con el mundo limpio y el resto intacto.
- **Móvil:** las cinco zonas se verificaron a 390 px sin overflow horizontal del body.
  La tabla ancha scrollea dentro de su contenedor, no ensancha la página.
- **Verificación:** `tests/smoke.mjs` comprueba versión, banco de 30 preguntas, 37 misiones,
  120 objetivos, ráfaga 5–7, metas 50/80/100, migración y claves, y que el Radar no tenga
  formulario de empresa. El E2E local recorre disparo rápido sin formulario, avance de
  objetivo, ráfaga, cuota, los 5 checks del Radar con sus recompensas y bonus, forja con
  una vacante heredada, disparo detallado, combo, seguimiento, embudo, tabla, Modo Jefe,
  falladas, jefe errante, favoritas, insignias, efectos/animaciones/vibración, persistencia
  y suma de XP. Una prueba de estrés adicional registra 100 disparos rápidos seguidos,
  completa las metas semanales 50/80/100 y confirma que la bolsa de 120 objetivos sigue
  activa sin errores.

### Verificar que el progreso viejo se conserva

1. Exporta un respaldo con la versión anterior (o conserva el `localStorage` actual).
2. Abre v5.69 y comprueba que mapa, misiones, XP, racha y arsenal siguen igual.
3. Entra en **Sagas** (pestaña o mundo del mapa), marca un capítulo y recarga: debe seguir marcado y sumar 1 moneda.
4. Entra en **LA CACERÍA**: la cuota debe arrancar en 5, el Radar debe mostrar 5 señales sin formulario
   y el banco del jefe con 30 preguntas. Marca las 5 señales: cada una debe pagar XP/monedas al instante,
   la quinta debe pagar el bonus y la misión diaria del Radar debe quedar completa. En **DISPARO**, pulsa
   el botón grande varias veces: debe registrar postulaciones sin formulario, avanzar el objetivo 1/120,
   completar la ráfaga de 5–7 y seguir permitiendo disparos. Si conservas una vacante anterior, forja el CV,
   dispara con detalle, marca un seguimiento y completa un duelo del jefe; recarga y comprueba que todo sigue
   ahí y que el XP/monedas subieron.
5. Exporta, borra los datos del sitio y restaura: el respaldo debe traer las Sagas y La Cacería.
6. Importa un respaldo viejo (sin `odea_sagas_v1`, `diary.log`, `activity` ni `hunt`): debe cargar sin errores,
   con Sagas en 0, La Cacería limpia, el diario migrado y la racha y misiones intactas.
7. Abre **INVENTARIO → PERFIL**, revisa el Nivel ODEA, el ritmo de la curva y el día de campaña; toca un frente: debe cerrar el inventario y llevarte a esa pestaña.
8. En la barra lateral, abre **⚙️ AJUSTES**: deben seguir ahí el salón de logros, respaldar, restaurar y los dos reinicios.

---

## Despliegue

GitHub Pages sirve la rama `main` desde la raíz. No hay paso de compilación; el CI
solo ejecuta el smoke test en push a `main` y en pull requests.
El service worker cachea el shell, así que **un cambio sin subir `CACHE_VERSION` no llega
a los usuarios que ya tienen la app instalada**.

---

## Accesibilidad

- `<h1>` y `<main>` presentes; un solo `<h1>`.
- Modales con `role="dialog"` / `aria-modal` / `aria-labelledby`.
- `Escape` cierra modales, con trampa de foco y restauración del foco al cerrar.
- `role="checkbox"` operable con teclado (Espacio/Enter).
- Toasts anunciados con `aria-live="polite"`.
- Contraste de la paleta: AA o superior en todas las combinaciones.

---

## Seguridad

- Todo el renderizado dinámico pasa por `escapeHtml()` o `textContent`.
- CSP vía `<meta>` (GitHub Pages no permite cabeceras).
- Sin dependencias JavaScript externas; el único origen externo son las Google Fonts.
