# Auditoría completa — ODEA (`odea.html`)

**URL:** https://josean03.github.io/plan-analista-datos/odea.html
**Repositorio:** `JoseAn03/plan-analista-datos`
**Versión auditada:** `5.59` · **Versión corregida:** `5.60`
**Fecha:** 19 de octubre de 2026
**Rama de correcciones:** `auditoria/fixes-2026-10-19`

---

## 0. Correcciones a esta misma auditoría

Dos hallazgos de la primera pasada eran **falsos positivos** provocados por la consola de
PowerShell, que destroza los caracteres Unicode al imprimirlos:

| Hallazgo original | Realidad |
|---|---|
| "`tests/smoke.py` siempre imprime lo mismo por concatenación de literales" | **Falso.** La línea es `print(("  ✓ " if ok else "  ✗ ") + name)`: correcta. |
| "El filtro por categoría no discrimina" | **Falso.** No existe filtro por categoría. El planificador filtra por *frente* (`daily`, `campaign`, `weekly`, `jobs`, `b2b`, `cap`, `eng`, `ai`, `vida`). |

Ambos se verificaron leyendo los bytes reales del archivo con Node, no con la consola.
El resto de hallazgos se confirmaron con el mismo método.

---

## 1. Resumen

| Área | Antes | Después |
|---|---|---|
| Coherencia del producto | 4/10 | **9/10** |
| Rendimiento | 5/10 | **8/10** |
| Accesibilidad | 5/10 | **8/10** |
| PWA / seguridad | 6/10 | **8/10** |
| Integridad de datos | 9/10 | 9/10 |
| Mantenibilidad | 6/10 | 6/10 |

**Peso del repositorio: 3.87 MB → 1.24 MB.** Imágenes: **2.50 MB → 536 KB**.
Primera carga estimada: **~1.0–1.2 MB → ~420 KB**.

---

## 2. Correcciones aplicadas

### ✅ 1. El plan vuelve a ser de 56 días

Se eliminaron las 7 referencias residuales al día 60:

| Ubicación | Antes | Ahora |
|---|---|---|
| `CHAPTERS[0].narrative` | "conteo de 60 días" | "conteo de 56 días" |
| `CHAPTERS[7].code` | `DÍAS 46–60` | `DÍAS 46–56` |
| `CHAPTERS[7].narrative` | "decisión al Día 60" | "decisión al Día 56" |
| Misión `d7_8` | "Decisión Final (Día 60)" | "(Día 56)" |
| Jefe `b7` | "Decisión Final del Día 60" | "del Día 56" |
| Logro `rw_auto3` | "Corona del Día 60" | "Corona del Día 56" |
| Entregables | `day60_decision.md` | `day56_decision.md` |

### ✅ 2. Una sola aplicación en el sitio

- Se **eliminó** el plan de 45 días que ocupaba `index.html`.
- `index.html` ahora redirige a `odea.html` (JS + `meta refresh` como respaldo),
  sin romper la URL que ya compartiste.
- Se eliminó `odea.backup-antes-puentes-20261015-174806.html` (578 KB de la v5.50).
- `.gitignore` ahora cubre `*.backup-*.html`, `__pycache__/` y archivos de sistema.

### ✅ 3. Imágenes optimizadas un 78 %

| Imagen | Antes | Después |
|---|---|---|
| `odea-homeworld` (fondo escritorio) | 431 KB | **113 KB** (redimensionado 2848→2200 px) |
| `cyber-city` (fondo móvil) | 437 KB | **65 KB** |
| 6 dioses + 3 titanes | 1.21 MB | **191 KB** |
| 5 mundos + 3 frentes | 205 KB | **47 KB** |
| Avatar + foco | 81 KB | **21 KB** |
| **Total** | **2.50 MB** | **536 KB** |

Todas las referencias se actualizaron en `odea.html` y `sw.js`. Se conservó el canal alfa
(verificado con `magick identify`). Los iconos de la PWA siguen en PNG a propósito.

### ✅ 4. Accesibilidad

- `<h1 class="sr-only">` único y `<main>` como landmark.
- El `<h3>` suelto del perfil pasó a `<h2>` (la jerarquía ya no empieza en h3).
- **10 diálogos** con `role="dialog"` (o `alertdialog`) + `aria-modal` + `aria-labelledby`.
- `Escape` cierra modales; **trampa de foco** al tabular; el foco **vuelve al disparador**
  al cerrar (MutationObserver sobre la clase `.show`).
- Los `role="checkbox"` se activan con **Espacio/Enter** en toda la app.
- `#toast-layer` es `role="status"` con `aria-live="polite"`.
- `#modal-input` tiene `aria-label`.

### ✅ 5. PWA y seguridad

- `manifest.json`: añadido `id`, `orientation` cambiado de `portrait` a `any`.
- `sw.js`: el precache ya **no es atómico** (`addAll` → `Promise.allSettled`); un asset
  caído ya no impide instalar el service worker.
- Fallback offline de assets: `504` en vez de devolver HTML como si fuera una imagen.
- `CACHE_VERSION` subido a `v5.60`, y `APP_VERSION`/badges alineados con él.
- **CSP** vía `<meta>` + `Referrer-Policy`:

```
default-src 'self'; script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:;
connect-src 'self'; media-src 'self'; object-src 'none';
base-uri 'self'; form-action 'none'
```

### ✅ 6. Modelo de datos

- Las 8 misiones semanales ahora tienen `id` (`w1`…`w8`), coherentes con el resto.

### ✅ 7. Tests y CI

- Nuevo `tests/smoke.mjs`: **solo requiere Node** (el `smoke.py` original necesita Python,
  que en esta máquina no está instalado).
- 25 comprobaciones: sintaxis JS, símbolos clave, coherencia de versión HTML↔SW,
  `<h1>` único, `<main>`, IDs duplicados en el DOM, **existencia de todos los assets del
  shell**, 56 días y ausencia de referencias al día 60.
- Workflow `.github/workflows/smoke.yml` que lo ejecuta en cada push a `main` y en cada PR.

```
✓ Smoke test OK
```

---

## 3. Lo que sigue pendiente (y por qué)

### 🟠 Mantenibilidad: 395 KB de JS inline

`odea.html` sigue siendo un monolito de ~577 KB. Dividirlo en módulos es un refactor de días,
no de una sesión, y no aporta nada al usuario final. **No se tocó.**

### 🟡 Google Fonts sigue siendo el único origen externo

Añadir CSP reduce el riesgo, pero las fuentes siguen saliendo de `fonts.googleapis.com`
(~120–180 KB y una IP filtrada a Google). Autohospedarlas es la solución definitiva.

### 🟡 `quiz.html` y `quiz-definitivo.html` siguen huérfanos

Se conservaron los archivos (no se borró contenido sin permiso) pero se **quitaron del
precache** del service worker. No son accesibles desde la app. Decide si los rescatas,
los enlazas o los archivas.

### 🟡 Cabeceras que GitHub Pages no permite

`X-Frame-Options`, `X-Content-Type-Options` y `Content-Security-Policy` como cabecera
requieren un proxy (Cloudflare) o mover el hosting. El `meta` CSP no cubre `frame-ancestors`,
así que **el clickjacking sigue siendo posible**.

---

## 4. Verificación realizada

| Comprobación | Resultado |
|---|---|
| Sintaxis de los 2 bloques inline + `sw.js` | ✅ |
| Etiquetas HTML balanceadas | ✅ |
| IDs duplicados en el DOM real | ✅ 0 |
| Todos los assets locales existen | ✅ 0 faltantes |
| Assets del shell del SW existen | ✅ 30/30 |
| `manifest.json` es JSON válido | ✅ |
| 168 misiones diarias / 56 días / 3 por día | ✅ |
| Semanas 1–8 con id único | ✅ |
| Sin referencias al día 60 | ✅ |
| `node tests/smoke.mjs` | ✅ 25/25 |

### Limitaciones

- **No se pudo ejecutar la app en un navegador.** Chrome y Edge están instalados pero el
  modo headless no produce salida en este entorno (probado `--dump-dom`, `--screenshot`,
  `--headless=new`). Los cambios de accesibilidad y CSP están validados **estáticamente**,
  no en runtime.
- **No se probó en dispositivo real** (instalación PWA, offline, rendimiento móvil).
- El tamaño de las Google Fonts es estimado.

> **Antes de fusionar el PR**, abre `odea.html` en el navegador y comprueba: que la CSP no
> bloquee nada en la consola, que `Escape` cierre los modales y que la app cargue las
> imágenes nuevas.

---

## 5. Historial de la rama

```
fix: alinear el plan a 56 dias (elimina referencias residuales al dia 60)
a11y: h1/main, dialogos accesibles, Escape + trampa de foco, aria-live y teclado en checkboxes
perf: convertir imagenes a WebP (2.5 MB -> 536 KB, -78%)
chore: elimina la app de 45 dias, higiene de repo, CSP, PWA robusta y CI
```
