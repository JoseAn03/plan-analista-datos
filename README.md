# ODEA — Operación Dominio de Datos e IA

Ruta gamificada de **56 días** para convertirte en analista de datos, con misiones diarias,
una **Campaña de Datos** de 10 mundos, jefes, logros, tienda e inventario. Funciona como
PWA instalable y guarda el progreso en `localStorage`.

**App en vivo:** https://josean03.github.io/plan-analista-datos/

---

## Estructura

| Archivo | Qué es |
|---|---|
| `odea.html` | **La aplicación completa** (HTML + CSS + JS en un solo archivo) |
| `flujos_odea.js` | Fuente de la **Campaña de Datos**: El Taller de Flujos v2, con 10 mundos, 74 misiones, jefes, rangos y checklist de producción |
| `index.html` | Redirección a `odea.html` (la raíz del sitio) |
| `assets/` | Imágenes (WebP/SVG), CSS y JS de la interfaz v7 |
| `manifest.json` | Manifest de la PWA |
| `sw.js` | Service worker (offline + auto-actualización) |
| `tests/smoke.mjs` | Smoke test Node (sintaxis JS + invariantes + Sagas + curva de niveles/perfil + La Cacería v5.70 + Campaña de Datos v5.72 + correcciones de auditoría v5.73 + capa de jugo v5.74). Es el que usa el CI |
| `quiz.html`, `quiz-definitivo.html` | Cuestionarios sueltos, no enlazados desde la app |

### Cifras del contenido

- **168 misiones diarias** = 56 días × 3 misiones (slots A/B/C)
- **Campaña de Datos:** 10 mundos, **74 misiones** (64 regulares + 10 jefes), **21.100 XP** y **162,75 h** (~163 h). Checklist de producción obligatorio desde el Mundo 5.
- **8 misiones semanales**
- **8 semanas** de plan diario (56 días)
- **2 sagas · 12 capítulos** (5 de video + 7 de Roblox), con XP para Legado y Poder & Imagen
- **La Cacería v2:** 4 misiones base repetibles, 3 diarias automáticas, 6 plataformas, jefe semanal de 30 HP, crítico 12%, combo de 30 min, cadena de días, anti-spam desde el disparo 13 y 5 rangos. Las postulaciones viejas se migran como disparos legacy.
- **649 misiones y retos** en el contador del ecosistema: 168 diarias + 8 semanales + 74 de Campaña + 30 de Noticias + 18 de B2B + 101 de Imperio + 192 de Vida (170 misiones + 22 retos) + 12 de Sagas + 9 jefes + 37 de La Cacería.

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

Solo requiere Node 18+. Valida la sintaxis del JS inline y de `flujos_odea.js`, la
coherencia de versión HTML/sw.js, los respaldos, los IDs del DOM, el contenido de los
56 días, las Sagas, el Nivel ODEA, la curva de XP, la racha global, el diario persistente,
Mi Plan expandible, el perfil, el estado/migración de La Cacería y la Campaña de Datos:
10 mundos, 64 misiones regulares + 10 jefes = 74, 21.100 XP, 9.765 minutos, categorías,
desbloqueo de jefes por mundo, checklist de producción, migración desde `capital.fl` y
la ausencia del Taller duplicado en Capital.
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
La pestaña *Hoy* y las misiones diarias del **Campamento Base** no lo llevan.
Reutiliza `gameState.planner.items` con refs `{f, id}`: no hay clave nueva,
no hay migración y el progreso guardado sigue intacto.

- **Frentes con ＋:** Campaña de Datos (misiones y jefes de mundo), Vida (sus 7 zonas),
  Imperio (`cap`/`eng`/`ai`), Noticias, B2B y Sagas. También aparece en los modales
  del mapa, que reutilizan los mismos renders (`vida-zona`, `cap-zona`, `jobs-blk`, `b2b-ch`).
- **Estados:** ＋ = no está en el plan · ✓ = ya está (tocar de nuevo la quita).
  El estado se lee de `gameState.planner`, así que siempre coincide con el
  panel «Agregar misiones».
- **Sin efectos colaterales:** el clic se captura en fase de captura
  (`document`, `capture: true`) y hace `stopPropagation`, así que el ＋ nunca
  abre la misión, no la completa y no otorga XP.
- **Vida completa:** `vidaMissionIndex()` indexa las 18 listas de Vida
  (Equilibrio, Legado, Alianza, Poder, Sabios, Planes y Orden) en diferido.
  `RETOS` queda fuera a propósito: es el reto del día y vive en *Hoy*.
- **Verificación:** `node tests/smoke.mjs` comprueba el ＋ en Campaña (misión y jefe),
  Vida, Imperio, Noticias, B2B y Sagas, y que quede fuera de *Hoy* y Campamento Base.

### Correcciones de auditoría (v5.73)

La auditoría del 27/10/2026 dejó estos arreglos, todos cubiertos por `tests/smoke.mjs`:

- **H-01 · guardado nuevo:** `SAVE_SCHEMA = 3` versiona el guardado y `saveGame()`
  marca `odea_empleo_v2` en cada guardado. La migración destructiva del Taller solo
  corre en guardados realmente antiguos con `capital.fl`; un guardado de v5.72 sin
  marca conserva su día, semana y racha. Así un usuario nuevo tampoco pierde su
  primera sesión al recargar.
- **H-02 · progresión:** `capMissionUnlocked()` valida el mundo anterior antes de
  completar una misión de Imperio; Mi Plan muestra las misiones bloqueadas con 🔒
  y no las completa. B2B (`b2bUnlocked()`) y Sagas (`sagaChapterUnlocked()`) tienen
  la misma defensa secuencial.
- **M-01 · Ajustes:** el botón visible dice **⟲ REINICIAR LA CACERÍA** y sigue
  llamando a `huntReset()`; no reinicia toda la Campaña de Empleo.
- **M-02 · Imperio:** los encabezados de mundo se abren con Enter/Espacio y
  sincronizan `aria-expanded`.
- **M-03 · Vida:** las tarjetas usan `role="checkbox"`, `tabindex="0"`,
  `aria-checked` y una etiqueta accesible.
- **M-04 · modales:** `modal-layer` y `diag-layer` entran en la trampa de foco.
  La bienvenida no se cierra por fondo ni con Escape antes de completar el onboarding.
- **L-01/L-02 · teclado:** las tarjetas de día, el logo, el logo lateral, el
  holograma y las zonas de Aldea/Imperio se activan con Enter/Espacio. El logo
  vuelve a hacer solo lo que dice su título: ir al Mapa de Mundos.
- **L-03 · diario:** el campo tiene un `<label for="diary-input">` oculto.
- **L-04 · estados bloqueados:** los jefes de Campaña y los encabezados de mundo
  bloqueados exponen `aria-disabled="true"`.
- **L-05 · pestañas:** las subpestañas de Vida se buscan dentro de `#view-vida`;
  entrar a Vida ya no borra la pestaña activa de Imperio.
- **L-06 · reinicio total:** `resetGame()` borra también `focus_timer_v1`,
  `odea_events`, el estado de enfoque y `hunt`.
- **L-07 · contador:** `totalMissionCount()` suma Imperio, Vida (incluidos los 22
  retos) y Sagas. El pie muestra **649 misiones y retos**.
- **L-08 · móvil pequeño:** a 320–380 px la navegación inferior usa dos filas con
  áreas táctiles de al menos 44 px y el contenido reserva espacio para ambas.
- **Versión:** app **v5.74** y caché `odea-v5.74-20261028-jugo`.

### Capa de celebración (v5.74)

- **Archivos nuevos:** `assets/odea-juice.js` y `assets/odea-juice.css`.
- **Qué agrega:** confeti chico al completar una misión, confeti grande al subir de nivel o derrotar al jefe semanal, flotantes `+N XP` / `¡Nivel N!`, sonidos WebAudio y un botón de silencio dentro de Ajustes.
- **Sin tocar el núcleo:** solo envuelve funciones globales y lee `gameState.totalXP` / `odeLevelNow()`. No modifica `saveGame`, `sumXP`, las claves del juego ni la estructura del guardado.
- **Único dato persistido:** `odea_juice_v1` (sonido activado/silenciado).
- **Accesibilidad:** respeta `prefers-reduced-motion` (sin confeti, flotantes ni pulsos) y no crea el `AudioContext` hasta la primera interacción.
- **Verificación:** `node tests/smoke.mjs` y `python tests/smoke.py`; prueba manual en navegador con misión diaria, desmarcado, subida de nivel, jefe, Vida, silencio y movimiento reducido.

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
  (`campaignLevel()`); los días se desbloquean con `unlockedDay()`. El **DÍA** es
  independiente de la Campaña de Datos: sus jefes se desbloquean al completar las
  misiones regulares de cada mundo, no por días del plan diario.
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

### Campaña de Datos = El Taller de Flujos v2 (v5.72)

La Campaña de Datos reemplazó su recorrido anterior de 55 misiones + 4 jefes por
El Taller de Flujos v2 completo. Ya no hay dos lugares con el mismo contenido: las
74 misiones viven únicamente en **DATOS → Campaña de Datos** y el Taller dejó de ser
un frente de Capital.

- **Fuente única:** `flujos_odea.js` define `FL_CHAPTERS`, `FL_MISSIONS`,
  `FL_LADDER`, `FL_OBJ`, `FL_BOSS_IDS` y `FL_PROD_CHECKLIST`. En `odea.html`,
  `CHAPTERS`, `flCampaignMissions`, `campaignMissions`, `bossMissions` y
  `campaignAll` se derivan de esos datos. No hay una segunda copia de las misiones.
- **10 mundos · 74 misiones · 10 jefes · 21.100 XP · 162,75 h:**

  | Mundo | Misiones | XP | Horas |
  |---|---:|---:|---:|
  | 1. Cimientos del Flujo | 6 | 1.200 | 6,25 |
  | 2. Conectores: Traé los Datos | 6 | 1.500 | 10,5 |
  | 3. El LLM como Componente | 8 | 1.900 | 14 |
  | 4. Documentos Inteligentes | 8 | 2.150 | 16,5 |
  | 5. Reportes que Piensan | 8 | 2.200 | 17 |
  | 6. Pregúntale a tus Datos | 8 | 2.500 | 20,5 |
  | 7. Orquestación y Canales | 8 | 2.350 | 19 |
  | 8. Calidad, Costos y Seguridad | 10 | 2.800 | 22 |
  | 9. Rent-a-Car y Turismo | 7 | 2.400 | 20 |
  | 10. La Maestría | 5 | 2.100 | 17 |
- **Rangos:** Aprendiz (0) → Armador de Flujos (800) → Orquestador (1.850) →
  Ingeniero de Automatización (3.200) → Arquitecto de Agentes (5.500) →
  Estratega de Datos e IA (9.000) → Experto en Flujos (14.000) →
  **Maestro de Flujos (21.100)**.
- **Jefes:** `fl1_6`, `fl2_6`, `fl3_8`, `fl4_8`, `fl5_8`, `fl6_8`,
  `fl7_8`, `fl8_10`, `fl9_7` y `fl10_5`. Se desbloquean cuando todas las
  misiones regulares de su mundo están completas; no dependen de `campaignLevel()`
  ni de los días del plan diario. Se renderizan con corona, borde dorado y la
  etiqueta **PROYECTO FINAL**.
- **Checklist de producción desde el Mundo 5:** idempotencia, observabilidad,
  control de costos, seguridad, human override, runbook, tests y data
  contract/quality gates. `renderChapters` lo muestra con
  `capChapterExtrasHTML(ch)` dentro de cada mundo.
- **Progreso:** `gameState.completedMissions` guarda los IDs `fl…`;
  `CAMP_TOTAL = 74` y `campaignAll` conserva el orden del Taller. Las tarjetas
  usan `m.time`/`b.time` para mostrar los minutos reales.
- **Migración:** `loadGame()` mantiene los IDs nuevos y migra a
  `completedMissions` el progreso que estaba en el viejo `data.capital.fl`.
  Los IDs de la campaña vieja (`d0_1`…`d7_8`, `b2`, `b4`, `b6`, `b7`,
  `d5_6`) ya no existen y se descartan. `capital` queda en
  `{ done, eng, ai }` y `resetGame()` no crea `fl`.
- **Capital:** 3 frentes (`cap`, `eng`, `ai`) y 3 pestañas. Se eliminaron
  `data-csub="fl"`, `cap-fl`, `vm-fl`, `fronts.fl` y
  `assets/fronts/fl.svg`. El perfil y el mapa muestran 3 frentes; el mapa de la
  Campaña muestra 10 nodos con espaciado dinámico.
- **Logros:** `ach_ch0`…`ach_ch9` cubren los 10 mundos; se añadieron
  `ach_ch8` y `ach_ch9`. `ach_ai` usa las misiones de categoría `ai`
  (Mundos 3–8). `rw_cat_an` conserva la Lupa de Datos y `rw_cat_emp` se
  reutilizó como Núcleo de Agentes.
- **UI:** el modal del mapa busca el mundo por `id`, no por índice. El mapa
  calcula el espaciado vertical para 10 nodos y el perfil ya no muestra Flujos.
- **Tests:** `node tests/smoke.mjs` comprueba la fuente, los 10 mundos,
  64+10=74, XP/minutos, jefes exactos, categorías, desbloqueo, checklist,
  migración, ausencia de `fl` en Capital, la versión v5.74 y las correcciones
  de auditoría (Mi Plan bloqueado, guardado nuevo, teclado y contador).
- **Sin cambios de claves:** `SAVE_KEY` sigue en `odea_save_v2` y
  `SAGA_KEY` en `odea_sagas_v1`.

### La Cacería v2 (v5.70)

La Cacería dejó de ser un formulario de postulaciones y ahora es un tablero de
**disparos**: un toque = una postulación real. No se escribe empresa, puesto, enlace,
fecha ni notas.

- **Pantalla:** anillo diario con meta 5, racha de cacería, combo, jefe semanal,
  plataforma, 3 misiones diarias automáticas, 4 misiones base repetibles y pie con
  rango, totales y **Deshacer último disparo**.
- **Misiones base:** 🐇 Presa fácil (+10 XP, 1 daño), 🎯 Tiro de precisión (+25 XP, 2),
  ✉️ Disparo certero (+40 XP, 3) y 🏢 Asalto directo (+30 XP, 2).
- **Diarias:** 🌅 Cazador del alba (3 disparos antes de las 10:00, +50 XP),
  ⚡ Ráfaga (5 disparos, +100 XP) y 🗺️ Rastreador (3 plataformas, +60 XP).
  Se cobran solas; sus tarjetas no tienen botón.
- **Plataformas:** LinkedIn, Indeed, Computrabajo, Encuentra24, Correo directo y Otra.
  La última elección se recuerda.
- **Combo:** el 2.º disparo dentro de 30 min paga ×1.2, el 3.º ×1.5 y el 4.º o más ×2.
- **Cadena:** +20 XP por día consecutivo, con tope ×10. Si se pierde un día y hay
  congelador, se consume uno para mantener la cadena.
- **Jefe semanal:** lunes a domingo, 30 HP. Cada disparo resta 1–3 HP. Al llegar a 0:
  +300 XP, +100 monedas, logro **Cazador de Jefes** y animación de victoria.
- **Crítico:** 12% de probabilidad, XP ×2, +10 monedas, destello dorado y texto
  **¡CRÍTICO!**.
- **Anti-spam:** desde el disparo 13 del día el XP baja al 50%, con aviso discreto.
- **Rangos:** Aprendiz (0) → Rastreador (25) → Cazador (75) → Francotirador (150) →
  Leyenda (300). Cada ascenso da bonus de XP y un logro.
- **Deshacer:** revierte el último disparo y todo lo que activó: XP, monedas, total,
  diarias, jefe, cadena, congelador, racha general y logros desbloqueados por ese disparo.

Detalles de implementación:

- **Estado aditivo:** los datos nuevos viven en `gameState.hunt.v2` dentro de
  `odea_save_v2`. No cambian `SAVE_KEY` ni `SAGA_KEY`. `normalizeHunt()` migra
  `applications` viejas a `v2.legacyShots`; cuentan para total/rango, no para las
  diarias, combo o jefe nuevos.
- **Una sola fuente de verdad:** el XP y las monedas se siguen calculando desde
  `hunt.log`. Cada disparo agrega entradas con `shotId`; deshacer elimina esas entradas.
  `recomputeState()` suma la categoría `hunt` y `coinsEarned()` sus monedas.
- **Racha general:** cada disparo usa `activityAdd("hunt", 1)` y puede completar la
  racha global como cualquier otra misión.
- **Logros:** primer disparo, 10, 50, 100, rangos 25/75/150/300, Ráfaga, Cazador de Jefes,
  cadena 7/30. Se reutilizan los IDs globales `ach_hunt_*`.
- **Respaldo:** `exportSave` incluye `hunt.v2`; `importSave` lo normaliza. Un respaldo
  viejo sin `v2` carga con `legacyShots = applications.length` y el resto intacto.
- **Reinicio:** **AJUSTES → REINICIAR LA CACERÍA** llama a `huntReset()` y
  borra solo La Cacería, con confirmación. No toca otros mundos.
- **Móvil:** pantalla verificada a 390 px sin overflow horizontal (`docScroll=390`).
- **Verificación:** `tests/smoke.mjs` comprueba versión, estado `hunt.v2`, migración,
  4 misiones base, diarias, plataformas, jefe, crítico, combo, anti-spam, rangos,
  logros, reset y respaldo. El E2E local recorre disparo, ascenso, deshacer, combo,
  Ráfaga, Rastreador, jefe, crítico, anti-spam, persistencia y deshacer tras recargar.

### Verificar que el progreso viejo se conserva

1. Exporta un respaldo con la versión anterior (o conserva el `localStorage` actual).
2. Abre v5.74 y comprueba que mapa, misiones diarias, XP, racha y arsenal siguen igual.
   La Campaña de Datos debe mostrar los 10 mundos nuevos y ya no las misiones `d0_1`…`d7_8`/`b2`…`b7`.
3. Entra en **Sagas** (pestaña o mundo del mapa), marca un capítulo y recarga: debe seguir marcado y sumar 1 moneda.
4. Entra en **LA CACERÍA**: no debe haber formularios. Elige una plataforma y pulsa **DISPARAR** varias veces.
   Debe subir el anillo, el total, el XP/monedas, la barra del jefe y aparecer combo/cadena cuando corresponda.
   Comprueba que las tarjetas diarias se cobran solas y que **Deshacer último disparo** revierte todo.
   Si había postulaciones viejas, deben aparecer como disparos totales y el rango debe reflejarlas.
5. Entra en **DATOS → CAMPAÑA DE DATOS**: verifica los 10 mundos, las 74 misiones, los 10 jefes con corona
   y el checklist de producción desde el Mundo 5. Marca una misión, recarga y comprueba que sigue marcada
   y que suma XP. El jefe de un mundo debe seguir bloqueado hasta completar las misiones regulares de ese mundo.
6. Entra en **CAPITAL**: debe haber solo 3 pestañas (capital, inglés e IA), sin Taller de Flujos duplicado.
   El perfil y el mapa deben hablar de 3 frentes.
7. Exporta, borra los datos del sitio y restaura: el respaldo debe traer las Sagas, `hunt.v2` y las misiones nuevas
   de la Campaña (`completedMissions`).
8. Importa un respaldo viejo con `capital.fl`: ese progreso del Taller debe migrar a la Campaña. Los IDs de la
   campaña vieja (`d…`, `b2`, `b4`, `b6`, `b7`) se descartan porque ya no existen. También debe cargar sin errores
   un respaldo sin `odea_sagas_v1`, `diary.log`, `activity` ni `hunt.v2`.
9. Abre **INVENTARIO → PERFIL**, revisa el Nivel ODEA, el ritmo de la curva y el día de campaña; toca un frente: debe cerrar el inventario y llevarte a esa pestaña.
10. En la barra lateral, abre **⚙️ AJUSTES**: deben seguir ahí el salón de logros, respaldar, restaurar y los dos reinicios.

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
  La bienvenida y el diagnóstico inicial también están dentro de la trampa.
- `role="checkbox"` operable con teclado (Espacio/Enter), con `aria-checked` y
  etiqueta accesible en Vida.
- Tarjetas de día, encabezados de mundo, logo, holograma y zonas del mapa se
  activan con Enter/Espacio.
- Estados bloqueados con `aria-disabled="true"`; el diario tiene etiqueta asociada.
- Toasts anunciados con `aria-live="polite"`.
- Contraste de la paleta: AA o superior en todas las combinaciones.
- Navegación inferior de dos filas y objetivos táctiles de 44 px a 320–380 px.

---

## Seguridad

- Todo el renderizado dinámico pasa por `escapeHtml()` o `textContent`.
- CSP vía `<meta>` (GitHub Pages no permite cabeceras).
- Sin dependencias JavaScript externas; el único origen externo son las Google Fonts.
