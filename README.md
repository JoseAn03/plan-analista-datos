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
| `tests/smoke.mjs` | Smoke test Node (sintaxis JS + invariantes + Sagas). Es el que usa el CI |
| `quiz.html`, `quiz-definitivo.html` | Cuestionarios sueltos, no enlazados desde la app |

### Cifras del contenido

- **168 misiones diarias** = 56 días × 3 misiones (slots A/B/C)
- **54 misiones de campaña** + **4 jefes** = 58
- **8 misiones semanales**
- **8 capítulos** (día 0 y días 1–56)
- **2 sagas · 12 capítulos** (5 de video + 7 de Roblox), con XP para Legado y Poder & Imagen

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
HTML/sw.js, los respaldos, los IDs del DOM, el contenido de los 56 días y las Sagas.
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

### Verificar que el progreso viejo se conserva

1. Exporta un respaldo con la versión anterior (o conserva el `localStorage` actual).
2. Abre v5.63 y comprueba que mapa, misiones, XP, racha y arsenal siguen igual.
3. Entra en **Sagas** (pestaña o mundo del mapa), marca un capítulo y recarga: debe seguir marcado y sumar 1 moneda.
4. Exporta, borra los datos del sitio y restaura: el respaldo debe traer las Sagas.
5. Importa un respaldo viejo (sin `odea_sagas_v1`): debe cargar sin errores y con Sagas en 0.

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
