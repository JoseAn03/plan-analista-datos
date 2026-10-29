# Auditoría ODEA — 27 de octubre de 2026

**Aplicación:** ODEA (`odea.html`)
**URL publicada:** https://josean03.github.io/plan-analista-datos/odea.html
**Versión auditada:** 5.72 (`odea-v5.72-20261025-campana-taller`)
**Alcance:** flujo completo, persistencia, PWA, responsive, accesibilidad y revisión estática.
**Modo:** solo lectura. No se modificó `odea.html` ni se hizo commit de la auditoría.

> **Revalidación 28/10/2026 — v5.83:** los hallazgos H-01, H-02 y M/L están resueltos en el código actual. Ver §8. Los detalles menores de §3 siguen como observaciones opcionales.

---

## 1. Resumen ejecutivo

La aplicación está **funcional y estable** en los flujos principales. No se observaron
excepciones, errores de consola, errores HTTP ni imágenes rotas durante la auditoría.
El smoke test pasa completo y la PWA funciona sin conexión.

Sin embargo, hay **dos hallazgos de alta prioridad**:

1. **Pérdida de progreso diario en el primer reload de un usuario nuevo** (también puede
   afectar guardados antiguos o respaldos sin la marca de migración).
2. **Mi Plan permite completar misiones del Imperio que todavía están bloqueadas**, con
   XP y progreso, saltándose el desbloqueo por capítulos.

Además hay un botón destructivo con etiqueta contradictoria, dos fallos claros de
accesibilidad por teclado (Imperio y Vida) y varios detalles menores.

### Conteo de hallazgos

| Severidad | Cantidad | Hallazgos |
|---|---:|---|
| Alta | 2 | H-01, H-02 |
| Media | 4 | M-01 a M-04 |
| Baja | 8 | L-01 a L-08 |

---

## 2. Hallazgos

### H-01 — Alta — El primer reload borra diario, semanal y racha

**Estado:** confirmado en navegador.

**Evidencia**

Partiendo de `localStorage.clear()`:

| Momento | `completedDaily` | XP | `odea_empleo_v2` |
|---|---:|---:|---|
| Después de completar `1A` | 1 | 110 | `null` |
| Después de recargar | **0** | **50** | `"1"` |
| Después de volver a completar `1A` y recargar | 1 | 110 | `"1"` |

La primera recarga borra `completedDaily`, `completedWeekly`, `lastDailyDate` y
`streak`. La segunda recarga ya conserva el progreso: el fallo es de una sola vez, pero
ocurre justo después de la primera sesión real del usuario.

**Reproducción**

1. Limpiar `localStorage` y abrir la app.
2. Completar una misión diaria.
3. Recargar.
4. La misión desaparece y el XP diario se pierde.

**Causa**

En `odea.html`, líneas 12108–12116:

```js
const hadSave = loadGame();
if (hadSave && !localStorage.getItem("odea_empleo_v2")) {
  gameState.completedDaily = [];
  gameState.completedWeekly = [];
  gameState.lastDailyDate = null;
  gameState.streak = 0;
  localStorage.setItem("odea_empleo_v2", "1");
  saveGame();
}
```

La marca `odea_empleo_v2` solo se crea dentro de esa migración. Un usuario nuevo:

- no tiene la marca;
- su primera acción crea `odea_save_v2`;
- la siguiente recarga entra en la migración y borra el progreso diario.

El mismo camino se puede activar con un guardado antiguo o con un respaldo importado
que no incluya `odea_empleo_v2`.

**Recomendación**

- Marcar el estado nuevo como migrado desde la primera creación del guardado, no en la
  recarga siguiente.
- Versionar el esquema del guardado y migrar solo cuando la versión sea realmente antigua.
- Añadir un test de regresión: usuario nuevo → completar diaria → recargar → progreso intacto.

**Archivos de evidencia**

- `C:\Users\Andres\AppData\Local\Temp\opencode\audit-corrupt2.json`

---

### H-02 — Alta — Mi Plan salta el bloqueo del Imperio

**Estado:** confirmado en navegador.

**Evidencia**

Con el Imperio recién iniciado:

- Capítulo 1: `0/4`.
- `unlockMap[2] = false`.
- El selector de Mi Plan ofrece `ca2_1` (“10 Conceptos del Tablero”, +180 XP)
  **sin indicar que está bloqueada**.
- Al agregarla y completarla desde Mi Plan:
  - `gameState.capital.done = ["ca2_1"]`;
  - `totalXP = 180`;
  - el capítulo 2 sigue bloqueado (`unlockMap[2] = false`).

Es decir: se obtiene XP y progreso de una misión que la vista Imperio no permite abrir.

**Causa**

- `plannerCatalog()` agrega **todas** las misiones de `CAP_FRONTS`, sin filtrar por
  `unlockMap` ni por capítulo desbloqueado.
- `plannerToggle()` llama directamente a `capToggleMission()`.
- `capToggleMission()` no valida si el capítulo de la misión está desbloqueado.
- La UI del Imperio oculta el cuerpo de los capítulos bloqueados, pero Mi Plan los expone.

**Observación adicional:** también se pudo completar `b1_1` de B2B sin completar la
Fase 0. Si B2B debe ser secuencial, el mismo tipo de guard falta ahí.

**Recomendación**

- Añadir en `capToggleMission()` una comprobación de `capFrontCompute(front).unlockMap`
  antes de modificar el estado.
- Filtrar el catálogo de Mi Plan por desbloqueo, o mostrar el candado y bloquear el botón.
- Repetir la validación en B2B, Sagas y cualquier frente con progresión secuencial.
- Test: con capítulo 1 incompleto, `ca2_1` no debe poder completarse desde Mi Plan.

**Archivo de evidencia**

- `C:\Users\Andres\AppData\Local\Temp\opencode\audit-planner-lock.json`

---

### M-01 — Media — El botón “REINICIAR CAMPAÑA DE EMPLEO” reinicia La Cacería

**Estado:** confirmado.

El botón visible en Ajustes dice:

```text
REINICIAR CAMPAÑA DE EMPLEO
```

Pero:

- `aria-label`: “Reiniciar solo La Cacería”.
- `title`: “Reinicia solo los disparos, rango, combo, cadena y jefe de La Cacería”.
- El `confirm()` nativo dice: “¿Reiniciar SOLO La Cacería? Se borran disparos,
  postulaciones viejas, jefe semanal, rango, combo, cadena y su XP/monedas.”
- El handler llama a `huntReset()`.

**Prueba:** con 2 diarias, 20 misiones de campaña y una entrada de La Cacería, al
aceptar el diálogo:

- diario siguió en 2;
- campaña siguió en 20;
- `hunt.log` pasó a 0.

El `confirm()` evita el desastre silencioso, pero la etiqueta visible sigue siendo
peligrosa: un usuario que quiere reiniciar la campaña de empleo termina reiniciando
La Cacería.

**Recomendación:** cambiar el texto visible a “REINICIAR LA CACERÍA” o volver a conectar
el botón con `resetDailyCampaign()`, que existe pero quedó sin uso.

**Archivo de evidencia**

- `C:\Users\Andres\AppData\Local\Temp\opencode\audit-shop-reset.json`

---

### M-02 — Media — Los capítulos del Imperio no se pueden abrir con teclado

**Estado:** confirmado.

Los `.chapter-head` del Imperio tienen `role="button"`, `tabindex="0"` y
`aria-expanded`, pero:

- `Enter` no hace nada;
- `Espacio` no hace nada;
- al hacer clic para cerrar, la clase `.open` desaparece pero `aria-expanded` sigue en
  `"true"`;
- no hay listener `keydown` en `#view-capital`.

**Evidencia**

| Estado | `.open` | `aria-expanded` |
|---|---|---|
| Inicial | `true` | `"true"` |
| Después de `Enter` | `true` | `"true"` |
| Después de clic para cerrar | `false` | **`"true"`** |

**Impacto:** un usuario solo-teclado puede completar misiones del capítulo que ya esté
abierto, pero no puede abrir los demás capítulos; el lector de pantalla anuncia un estado
incorrecto.

**Recomendación:** manejar `Enter`/`Espacio` como en Campaña y actualizar
`aria-expanded` en cada apertura/cierre. Valorar usar `<button>` nativo.

**Archivo de evidencia**

- `C:\Users\Andres\AppData\Local\Temp\opencode\audit-a11y.json`

---

### M-03 — Media — Las misiones de Vida no son accesibles por teclado

**Estado:** confirmado.

En `#view-vida`:

- `.mission[data-mid]` no tiene `role` ni `tabindex`;
- `.m-check` no tiene `role="checkbox"`, `tabindex` ni `aria-checked`;
- `Enter` sobre la tarjeta no cambia el estado (`vida.log` pasó de 0 a 0).

Otros frentes usan `role="checkbox"` y el handler global de teclado; Vida quedó fuera de
ese patrón.

**Recomendación:** convertir la tarjeta o el check en un control enfocable con
`role="checkbox"`, `aria-checked`, `Enter`/`Espacio` y estado visual sincronizado.

**Archivo de evidencia**

- `C:\Users\Andres\AppData\Local\Temp\opencode\audit-a11y.json`

---

### M-04 — Media — Los modales de bienvenida/diagnóstico no atrapan el foco

**Estado:** confirmado.

`#modal-layer` y `#diag-layer` tienen `role="dialog"` y `aria-modal="true"`, pero no
están incluidos en el array `LAYERS` de la trampa de foco.

**Prueba con Tab en el modal de bienvenida:**

1. Foco inicial: `#modal-input`.
2. Tab → `#modal-btn`.
3. Tab → `BODY`.
4. Tab → `#side-inv`.
5. Tab → `#side-shop`.
6. Tab → un botón de la navegación inferior.

El foco sale del modal y llega al fondo, aunque `aria-modal` dice lo contrario.

Además, hacer clic en el fondo del modal de bienvenida lo cierra dejando:

- `playerName = "Recluta"`;
- `startDate = null`;
- el diagnóstico no se abre.

El modal reaparece en la siguiente recarga, pero el usuario ya pudo quedar en un estado
de onboarding incompleto.

**Recomendación:** incluir `modal-layer` y `diag-layer` en la trampa de foco, y no cerrar
la bienvenida por click de fondo (o completar `startDate` antes de cerrarla). El modal de
subida de nivel usa la misma capa y también se beneficia.

---

### L-01 — Baja — Las tarjetas de la ruta diaria son solo clic

`dayCard()` genera `<div class="day-card" data-day="...">`; el listener de `#roadmap`
escucha `click`, pero el div no tiene `role`, `tabindex` ni manejo de teclado.

**Impacto:** un usuario de teclado no puede seleccionar otro día desbloqueado desde la
ruta de 56 días.

**Recomendación:** usar `<button>` o añadir `role="button"`, `tabindex="0"` y
`Enter`/`Espacio`.

---

### L-02 — Baja — Controles clicables sin teclado y título engañoso del logo

Confirmado en el DOM:

- `#logo`: `<div>` sin `role` ni `tabindex`; su `title` dice “Ir al Mapa de Mundos”,
  pero el clic ejecuta `openAchievements()` **y** `goTab("map")`; abre Logros encima del
  mapa.
- `#side-holo`: `<div>` sin `role` ni `tabindex`; abre el inventario, pero no es
  enfocable.
- Las `.aldea-zone` del mapa son `<div>` sin `role` ni `tabindex`; abren zonas de Vida o
  Imperio solo con puntero.

Los mundos y nodos del mapa sí son `<button>`, así que el problema está limitado a esos
accesos secundarios.

**Recomendación:** convertirlos en botones o darles rol, foco y activación por teclado;
corregir el `title` del logo o separar las dos acciones.

---

### L-03 — Baja — El diario no tiene etiqueta accesible

`#diary-input` es un `<textarea>` con `placeholder`, pero sin `<label for>`, `aria-label`
ni `aria-labelledby`.

El placeholder no sustituye una etiqueta persistente, especialmente cuando el usuario
empieza a escribir.

**Recomendación:** añadir una etiqueta visible u oculta (`sr-only`) y asociarla con `for`/`id`.

---

### L-04 — Baja — Jefes bloqueados sin `aria-disabled`

Los jefes bloqueados de Campaña y los checks bloqueados del Imperio tienen clases
`.locked`, pero no exponen `aria-disabled="true"` ni un estado equivalente.

**Evidencia:** `.mission.boss.locked` y `.m-check.locked` devolvieron
`aria-disabled = null`.

**Recomendación:** añadir `aria-disabled="true"` y evitar que los controles se anuncien
como disponibles; el clic ya muestra el aviso correspondiente.

---

### L-05 — Baja — Una pestaña de Vida borra la pestaña activa del Imperio

El handler de las subpestañas de Vida usa `document.querySelectorAll(".sub-tab")` global,
por lo que también quita `.active` a la pestaña activa del Imperio.

**Prueba:**

1. Imperio → “LENGUA DEL IMPERIO” (activa `eng`).
2. Vida → “LEGADO”.
3. Volver a Imperio.

Resultado: el panel `cap-eng` sigue visible, pero no hay ninguna subpestaña activa
(`active = []`). El usuario ve el contenido sin saber qué pestaña está seleccionada.

**Recomendación:** limitar el selector a `#view-vida .sub-tab` y sincronizar el estado
del Imperio al entrar.

---

### L-06 — Baja — “Reiniciar todo” deja un temporizador de enfoque pausado

`resetGame()` reinicia el estado del juego, pero no elimina `focus_timer_v1`. En la
prueba, tras iniciar un temporizador, cerrarlo para pausarlo y confirmar “SÍ, BORRAR
TODO”, el guardado quedó vacío y el modal de bienvenida apareció, pero
`focus_timer_v1` seguía existiendo con `running: false` y `remaining: 300`.

También quedan claves auxiliares como `odea_events`. No se observó corrupción del juego,
pero el reinicio no es completamente limpio.

**Recomendación:** limpiar explícitamente las claves auxiliares que formen parte del
estado del usuario (al menos el temporizador de enfoque).

---

### L-07 — Baja — El contador “misiones” no cuenta todo el contenido

`totalMissionCount()` devuelve **344**, pero el contenido actual suma:

| Fuente | Cantidad |
|---|---:|
| Campaña | 74 |
| Diario | 168 |
| Semanal | 8 |
| Empleo | 30 |
| B2B | 18 |
| Imperio (3 frentes) | 101 |
| Vida | 192 |
| Sagas | 12 |
| La Cacería | 37 |
| Jefes de dioses/titanes | 9 |

El contenido inventariado suma **649** misiones. El contador de 344 incluye campaña,
diario, semanal, empleo, B2B, Cacería y los 9 jefes de dioses/titanes, pero excluye las
305 misiones de Imperio, Vida y Sagas.

No es un fallo de ejecución; es una etiqueta ambigua. Si el pie quiere decir “misiones de
la ruta principal”, conviene aclararlo; si quiere decir “todo el contenido”, el número
está incompleto.

---

### L-08 — Baja — La navegación inferior queda muy comprimida a 320 px

A 320 px hay 9 botones en la barra inferior:

- ancho mínimo: **31.9 px**;
- ancho máximo: 49.9 px;
- altura: 56 px;
- sin desbordamiento horizontal.

No hay recorte ni overflow y los objetivos superan el mínimo de 24 × 24 px de WCAG 2.2,
pero están por debajo de la recomendación táctil de 44 px y los textos quedan muy
apretados. Es una mejora de UX, no un bloqueo funcional.

**Recomendación:** considerar un menú “más” o dos filas en anchos muy pequeños.

---

## 3. Otros detalles menores

- `#btn-extra` cambia su texto entre “Ver reto semanal…” y “Ocultar…”, pero no expone
  `aria-expanded` ni `aria-controls`.
- Si el usuario pulsa “COMENZAR MISIÓN” sin escribir nombre, el nombre queda como
  “Recluta” y `showWelcome()` vuelve a mostrarse en cada recarga por la condición
  `playerName === "Recluta"`.
- El botón de reinicio de La Cacería usa `confirm()` nativo mientras el resto de reinicios
  usa el diálogo propio; no es un fallo, pero es inconsistente.
- `resetDailyCampaign()` existe pero ya no se usa; puede eliminarse o volver a conectarse
  al botón correspondiente.

---

## 4. Comprobaciones correctas

Estas áreas se probaron y **no mostraron fallos**:

| Área | Resultado |
|---|---|
| Carga inicial | Sin errores de consola, sin errores HTTP, sin imágenes rotas |
| Layout | Sin overflow horizontal a 320, 390 y 768 px |
| PWA | Cache `odea-v5.72-20261025-campana-taller` con 34 entradas; reload offline correcto; restaurar online correcto |
| Diario | Completar, desmarcar, desbloquear día, racha y persistencia (salvo H-01 en el primer reload) |
| Semanal | Completar +350 XP y desmarcar -350 XP; sin errores |
| Campaña | Capítulos, misiones regulares y desbloqueo de jefe tras 5 misiones |
| Jefes | Desbloqueo de Campaña correcto; el bloqueo de misión se respeta desde la UI |
| Empleo / B2B | Completar, desmarcar y persistir; B2B +150 XP |
| Imperio | Toggle de misión y pestañas; el fallo es de teclado en capítulos, no de ratón |
| Vida | Toggle de misiones y persistencia; el fallo es de teclado/roles |
| Sagas | Toggle de capítulos y persistencia |
| La Cacería | Disparar, deshacer y actualizar XP/monedas |
| Mi Plan | Agregar campaña, Vida e Imperio desbloqueado; completar/deshacer; persistencia |
| Mi Plan / ICS | El archivo contiene `BEGIN:VCALENDAR` y el plan persiste |
| Tienda | Compra de “Espada de Madera” por 20 monedas, equipar `mano: "sw_wood"` y persistir |
| Exportar/importar | Bundle `odea_bundle_v2`, `appVersion: "5.72"`, restauración correcta |
| Guardado corrupto | Muestra “Progreso no legible / Tu guardado se dañó…” y no bloquea la app |
| Reset | Diálogo propio de “borrar todo”; cancelar y confirmar funcionan |
| Accesibilidad base | Sin botones/enlaces sin nombre accesible; imágenes con `alt`; `toast-layer` con `role="status"` |
| Smoke test | `node tests/smoke.mjs` → **Smoke test OK** |

---

## 5. Prioridad recomendada

### Antes de la próxima publicación

1. **H-01:** impedir la migración destructiva en usuarios nuevos.
2. **H-02:** bloquear en Mi Plan las misiones de Imperio no desbloqueadas.

### En el siguiente lote

3. **M-01:** corregir la etiqueta del reinicio.
4. **M-02:** teclado y `aria-expanded` en capítulos del Imperio.
5. **M-03:** rol, foco y teclado en misiones de Vida.
6. **M-04:** trampa de foco en bienvenida/diagnóstico.

### Mejoras de accesibilidad y pulido

7. Convertir tarjetas de ruta, zona de aldea, logo y holotipo en controles accesibles.
8. Etiquetar el diario.
9. Añadir `aria-disabled` a jefes bloqueados.
10. Corregir el selector global de subpestañas de Vida.
11. Limpiar el temporizador de enfoque al reiniciar todo.
12. Aclarar el contador de misiones y revisar la barra inferior a 320 px.

---

## 6. Evidencia y método

- Servidor local: `python -m http.server 8099 --bind 127.0.0.1`.
- Chrome/CDP: puerto `9230`.
- Pruebas móviles: 320, 390 y 768 px.
- Prueba offline: `Network.emulateNetworkConditions`.
- Limpieza de estado entre pruebas de persistencia: `localStorage.clear()` + reload.
- Lectura de archivos y JSON con Node/UTF-8 para evitar falsos positivos de Unicode en
  PowerShell.

Archivos de evidencia en `C:\Users\Andres\AppData\Local\Temp\opencode\`:

| Archivo | Contenido |
|---|---|
| `audit-corrupt2.json` | H-01 y guardado corrupto |
| `audit-planner-lock.json` | H-02, bloqueo saltado desde Mi Plan |
| `audit-shop-reset.json` | M-01, tienda, reinicio y temporizador |
| `audit-a11y.json` | M-02, M-03 y controles accesibles |
| `audit-layout.json` | Layout 320/390/768 |
| `audit-sw.json` | PWA y offline |
| `audit-planner.json` | Mi Plan, ICS y persistencia |
| `audit-weekly.json` | Misión semanal |
| `audit-b2b-shop.json` | B2B y tienda |
| `audit-core-output.json` | Flujos base y estado general |

---

## 7. Conclusión

ODEA v5.72 está bien encaminada: el contenido, la persistencia normal, la PWA y la
mayoría de los flujos interactivos funcionan. No obstante, **H-01 es una pérdida de datos
real en el primer uso** y **H-02 rompe la progresión del Imperio**. Ambos deberían
corregirse antes de dar la versión por cerrada. Los problemas de teclado del Imperio y
Vida son los siguientes en prioridad porque excluyen a usuarios que no usan puntero.

---

## 8. Revalidación sobre v5.83 — 28/10/2026

**Versión revalidada:** 5.83 (`odea-v5.83-20261029-academia`)
**Método:** revisión estática, smoke tests y E2E de navegador con Chrome/CDP.
**Resultado:** no quedan hallazgos altos ni medios abiertos.

| Hallazgo | Estado | Evidencia |
|---|---|---|
| H-01 | Resuelto | `saveGame()` marca `odea_empleo_v2`; la migración solo resetea guardados `saveVersion === 0` con `legacyFl`. Prueba: usuario nuevo → `1A` completada → reload → `completedDaily=["1A"]`, XP 110. |
| H-02 | Resuelto | `capToggleMission()` valida `before.unlockMap[o.cap]`. Prueba: `ca2_1` desde Mi Plan deja `capital.done=[]` y XP sin cambios. |
| M-01 | Resuelto | El botón visible dice “REINICIAR LA CACERÍA”. |
| M-02 | Resuelto | Capítulos del Imperio con teclado y `aria-expanded` sincronizado; smoke test M-02. |
| M-03 | Resuelto | Misiones de Vida con `role="checkbox"`, `tabindex` y `aria-checked`; smoke test M-03. |
| M-04 | Resuelto | `modal-layer` y `diag-layer` incluidos en la trampa de foco; smoke test M-04. |
| L-01 | Resuelto | Tarjetas de ruta con `role="button"`, `tabindex` y teclado. |
| L-02 | Resuelto | Logo, holograma y zonas de aldea con rol/foco/teclado; smoke test L-01/L-02. |
| L-03 | Resuelto | `diary-input` con `<label class="sr-only">`. |
| L-04 | Resuelto | Jefes/checks bloqueados con `aria-disabled="true"`; smoke test L-04. |
| L-05 | Resuelto | Subpestañas de Vida limitadas a `#view-vida`; smoke test L-05. |
| L-06 | Resuelto | `resetGame()` elimina `focus_timer_v1` y `odea_events`; smoke test L-06. |
| L-07 | Resuelto | `totalMissionCount()` suma Campaña, Diario, Semanal, Empleo, B2B, Imperio, Vida, Sagas, jefes y Cacería; smoke test L-07. |
| L-08 | Resuelto | Navegación inferior de dos filas en anchos pequeños; smoke test L-08. |

### Detalles menores que siguen abiertos (no bloqueantes)

- `#btn-extra` no expone `aria-expanded`/`aria-controls`.
- Si se pulsa “COMENZAR MISIÓN” sin escribir nombre, `playerName` queda como “Recluta” y la bienvenida puede reaparecer en cada recarga.
- `resetDailyCampaign()` sigue sin uso.
- El reinicio de La Cacería usa `confirm()` nativo, a diferencia del resto de reinicios.

### Verificación ejecutada

- `node --check` en los assets de la fase.
- `node tests/smoke.mjs` → OK.
- `python tests/smoke.py` → OK.
- E2E de Academia y revalidación H-01/H-02 → OK.
- Publicación: commit `cb5242b010b3139916fc53a3ec51ffcb9eff9c8d`, GitHub Pages sirviendo v5.83.
