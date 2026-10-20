# Auditoría completa — ODEA (`odea.html`)

**URL auditada:** https://josean03.github.io/plan-analista-datos/odea.html
**Repositorio:** `JoseAn03/plan-analista-datos`
**Versión:** `APP_VERSION 5.59` / `CACHE_VERSION odea-v5.59-20261019-racha`
**Fecha:** 19 de octubre de 2026
**Commit auditado:** `0adff0d` (143 commits)

---

## 1. Resumen ejecutivo

ODEA es una aplicación web de una sola página (SPA) de **572 KB** en un único archivo HTML, con
un plan de 56 días gamificado, PWA instalable y persistencia en `localStorage`.

**Veredicto: el proyecto está por encima de la media en calidad de datos, seguridad anti-XSS y
accesibilidad visual. Sus debilidades están en la consistencia del producto, el peso de la
primera carga y la accesibilidad por teclado.**

| Área | Nota | Comentario |
|---|---|---|
| Integridad de datos | 9/10 | 56 días × 3 misiones, sin huecos, sin duplicados |
| Seguridad | 8/10 | `escapeHtml` correcto, sin `eval`, sin dependencias JS externas |
| Persistencia | 9/10 | Validación campo por campo; no borra datos corruptos |
| Rendimiento | 5/10 | ~1 MB de primera carga; fondo de 431 KB |
| Accesibilidad | 5/10 | Contraste excelente, pero semántica y teclado flojos |
| PWA | 7/10 | Funciona, con detalles de manifest y caché atómica |
| Coherencia del producto | 4/10 | Dos apps distintas (45 y 56 días) y referencias al "Día 60" |
| Mantenibilidad | 6/10 | 263 funciones en un archivo de 395 KB de JS |

**No se encontraron errores de sintaxis, enlaces roto ni XSS explotable.**

---

## 2. Qué está bien (y conviene no romper)

1. **Los datos del plan están completos.** Las 168 misiones diarias cubren los días 1–56
   exactamente, 3 por día, con IDs únicos y sin títulos repetidos. Las 8 semanas tienen sus
   8 misiones semanales. Los 58 elementos de campaña (54 misiones + 4 jefes) tienen todos sus
   campos completos.
2. **Protección anti-XSS correcta.** `escapeHtml()` escapa `& < > " '`, se usa en 46 puntos,
   y el nombre del jugador se renderiza con `textContent`. No hay `eval`, `new Function` ni
   `document.write`. Los enlaces externos llevan `rel="noopener"`.
3. **Persistencia ejemplar.** `loadGame()` valida y filtra **cada campo** contra los catálogos
   reales (IDs inexistentes se descartan). Si el guardado está corrupto, **no lo borra**: marca
   `corruptSave` y avisa al usuario que restaure un respaldo.
4. **Contraste WCAG sobresaliente.** Toda la paleta pasa AA; 8 de 10 combinaciones llegan a AAA.
   `--tx2` sobre `--bg2` da 6.73:1.
5. **`prefers-reduced-motion` bien resuelto**, con regla global que anula animaciones y
   transiciones, más excepciones explícitas.
6. **PWA funcional** con service worker versionado, `skipWaiting`, auto-actualización y
   estrategia *network-first* para HTML / *cache-first* para estáticos.
7. **Accesibilidad visual cuidada:** 88 `aria-label`, `alt` en todas las imágenes, `lang="es"`,
   viewport que permite zoom.
8. **Sintaxis JS válida** (`node --check` sobre los 3 bloques + el archivo externo).
9. **Cero recursos 404**: todos los assets referenciados existen y responden 200.
10. **Modo de rendimiento adaptativo** que detecta FPS bajos y degrada efectos.

---

## 3. Hallazgos por severidad

### 🔴 ALTA — 1. El plan dice 56 días, pero media app dice 60

El plan diario real son **56 días** (días 1–56, verificado en los datos). Sin embargo:

| Ubicación | Texto |
|---|---|
| Capítulo 7 (`CAPS`) | `code:"DÍAS 46-60"` |
| Misión `d7_8` | `"Decisión Final (Día 60)"` |
| Jefe `b7` | `"Decisión Final del Día 60"` |
| Logro `rw_auto3` | `"Corona del Día 60"` |

Además el capítulo 7 cubre 46–60 (15 días) pero solo existen misiones diarias hasta el 56
(11 días). Es un resto de una versión anterior de 60 días.

**Impacto:** el usuario llega al día 56 y la app le habla del día 60. Rompe la promesa del
producto y la confianza en el progreso.

**Arreglo:** decidir el número canónico (56) y corregir las 4 cadenas. Si el plan pasa a 60,
faltan 4 días × 3 misiones = 12 misiones por crear.

---

### 🔴 ALTA — 2. El sitio sirve dos aplicaciones distintas y no se enlazan

| Archivo | Qué es | Peso |
|---|---|---|
| `index.html` | **"Plan Ejecutivo Completo – Analista de Datos - 45 Días"** | 125 KB |
| `odea.html` | ODEA, plan de **56 días** | 572 KB |

- La **raíz del sitio** (`/`) sirve `index.html`, que es otra app de **45 días**.
- `odea.html` **no enlaza** a `index.html` ni al revés (0 referencias cruzadas).
- El `manifest.json` tiene `start_url: "./odea.html"`, así que la PWA instalada abre una cosa
  distinta de la que ve quien entra por el dominio.
- El service worker cachea **ambas** (`.index.html` + `./odea.html`), descargando ~700 KB de HTML.

**Arreglo:** decidir cuál es la entrada. Si ODEA es el producto, moverla a `index.html` (o
redirigir) y archivar el plan de 45 días. Si conviven, enlazarlas y aclarar cuál es cuál.

---

### 🔴 ALTA — 3. Primera carga de ~1 MB (más fuentes)

| Recurso | Tamaño |
|---|---|
| `odea.html` | 564 KB (148 KB gzip) |
| `odea-homeworld.webp` (fondo escritorio) | **431 KB** |
| `cyber-city.png` (fondo móvil) | **437 KB** |
| `assets/odea-ui-v7.css` | 22 KB (5 KB gzip) |
| `assets/odea-icons-v7.js` | 6 KB (2 KB gzip) |
| Google Fonts (3 familias, ~9 pesos) | ~120–180 KB estimados |
| **Total** | **≈ 1.0–1.2 MB** |

En 3G lento (~400 kbps) eso son **20–25 segundos** hasta la primera pantalla útil. El fondo es
el 43 % del peso y es **decorativo**.

**Arreglo rápido (1–2 h):**
- Recomprimir los dos fondos a WebP calidad 75 (≈ 60–80 KB cada uno) → ahorro ~700 KB.
- Añadir `loading="eager"` solo al fondo crítico y `fetchpriority="low"` al resto.
- Autohospedar las fuentes o reducir a 2 familias / 4 pesos.
- Convertir los PNG de dioses y titanes (118–145 KB cada uno, 10 archivos) a WebP: ahorro
  estimado del 70–85 %.

---

### 🔴 ALTA — 4. Accesibilidad por teclado y semántica de diálogos

| Problema | Evidencia |
|---|---|
| Checkboxes inoperables por teclado | `role="checkbox" tabindex="0"` sin handler de teclado, salvo dentro de `#chapters-root`. Solo existen **3** listeners `keydown` en toda la app. |
| Sin cierre con `Esc` | **0** ocurrencias de `Escape` en el código. |
| Sin trampa de foco | **0** `trapFocus` / `inert`. El foco se escapa de los modales al tabular. |
| 6 modales sin semántica | `node-modal`, `god-modal`, `rw-modal`, `planner-modal`, `shop-modal`, `focus-modal`: **0** `role="dialog"`, **0** `aria-modal`, **0** `aria-labelledby`. |
| Toasts invisibles para lectores de pantalla | `#toast-layer` sin `aria-live` (0 en todo el documento). |
| Sin `<h1>` y orden roto | **0** `<h1>`; un `<h3>` ("Perfil del Recluta") aparece antes que el primer `<h2>`. |
| Sin landmark principal | **0** `<main>`. |
| Campo de nombre sin etiqueta | `#modal-input` solo tiene `placeholder`, sin `<label>` ni `aria-label`. |

**Arreglo:** añadir `role="dialog"` + `aria-modal="true"` + `aria-labelledby` a los 6 modales,
manejar `Escape` globalmente, mover el foco al abrir y devolverlo al cerrar, `aria-live="polite"`
en `#toast-layer`, y un `<h1>` + `<main>` en el shell.

---

### 🟠 MEDIA — 5. El test automático tiene un bug que lo hace inútil visualmente

`tests/smoke.py`, línea 16:

```python
print(("  ✓" " if ok else "  ✗ ") + name)
```

Python **concatena literales adyacentes**: se evalúa como
`"  ✓ if ok else   ✗ "` y **siempre imprime el mismo texto**, pase o falle el check.
La lista `fails` y el código de salida sí funcionan, así que el test "pasa" correctamente,
pero su salida no informa nada.

**Arreglo:** `print(("  ✓" if ok else "  ✗ ") + name)`

**Además:** no hay CI (`.github/` no existe), Python no está instalado en la máquina y no hay
ningún runner configurado. El test es manual y hoy no se ejecuta.

---

### 🟠 MEDIA — 6. Basura y archivos huérfanos en el repositorio

| Archivo | Problema |
|---|---|
| `odea.backup-antes-puentes-20261015-174806.html` | 578 KB versionados, versión **5.50** (9 versiones atrás). El `.gitignore` cubre `*.bak`, no `*.backup-*.html`. |
| `quiz.html` (19 KB) | Huérfano: **0** referencias desde `odea.html`, pero el SW lo cachea. |
| `quiz-definitivo.html` (29 KB) | Igual. |
| `index.html` (125 KB) | App distinta (ver hallazgo 2). |

No hay `README.md` ni `LICENSE`.

**Arreglo:** `git rm` del backup (o moverlo a `.gitignore` + historial limpio), decidir el futuro
de los quiz y documentarlos.

---

### 🟠 MEDIA — 7. Imágenes sin optimizar: 2.5 MB en 27 archivos

Los 10 PNG de dioses y titanes suman ~1.3 MB (118–145 KB cada uno). Son ilustraciones con
transparencia: **WebP/AVIF las reduce un 70–85 %** sin pérdida visible. Los dos fondos suman
868 KB y se sirven uno u otro según el ancho de pantalla, pero **nunca se sirven versiones
responsive** (`srcset`/`sizes`).

---

### 🟠 MEDIA — 8. Sin CSP ni cabeceras de endurecimiento

GitHub Pages no permite cabeceras personalizadas. Estado actual:

```
Content-Security-Policy      : AUSENTE
X-Content-Type-Options       : AUSENTE
X-Frame-Options              : AUSENTE
Referrer-Policy              : AUSENTE
Permissions-Policy           : AUSENTE
Strict-Transport-Security    : max-age=31556952   ✅
```

El riesgo real es bajo (no hay datos de terceros, no hay backend, no hay cookies), pero:

- **Clickjacking:** cualquiera puede embeber la app en un iframe.
- **Google Fonts** es el único origen externo: filtra la IP del usuario a Google (privacidad).

**Arreglo:** `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline'">`
y `<meta name="referrer" content="no-referrer">`. Alternativa: poner Cloudflare delante.

---

### 🟡 BAJA — 9. El filtro por categoría no discrimina

Las **168 misiones diarias tienen `category: "employability"`**. Solo las 54 misiones de campaña
tienen variedad (`analyst` 37, `employability` 215 en total). Si el planificador permite filtrar
por categoría, en la vista diaria no sirve de nada: todo es la misma.

*Nota:* parece intencional desde la v5.54 ("misiones semanales 100 % empleo"). Si es así,
conviene **eliminar el filtro** en esa vista para no prometer una función que no filtra.

---

### 🟡 BAJA — 10. `weeklyMissions` sin `id`

Las 8 misiones semanales se identifican por `week`, no por `id`, a diferencia de todo el resto
del modelo. Funciona (se guardan en `completedWeekly` como números 1–8), pero rompe la
uniformidad y complica cualquier refactor o exportación.

---

### 🟡 BAJA — 11. Manifest y service worker

| Detalle | Estado |
|---|---|
| `id` del manifest | Ausente (recomendado desde Chrome 96) |
| `screenshots` | Ausentes (mejora la ficha de instalación) |
| `orientation: "portrait"` | **Bloquea el horizontal** en tablet y escritorio. Cuestionable en una app de estudio. |
| `addAll(SHELL)` | Atómico: si **un** asset falla, el SW **no se instala** y no hay offline. |
| Página offline | No hay fallback propio; cae a `odea.html`. |
| `index.html` en caché | 125 KB que probablemente nadie visita. |

---

### 🟡 BAJA — 12. Detalles de código

- **395 KB de JavaScript inline** en un solo bloque (263 funciones, 418 arrow functions).
  Sin módulos, sin bundler, sin tree-shaking. Mantener esto a mano es frágil.
- **Importación sin validación de esquema:** `importSave()` solo comprueba
  `Array.isArray(save.completedMissions)` y luego escribe **cualquier** clave `odea_*` en
  `localStorage`. Es auto-XSS (el usuario importa su propio archivo), pero un JSON malformado
  puede dejar el estado inconsistente.
- **`outline: none`** en un input (1 caso) sin sustituto de foco.
- **Sin `srcset`** en ninguna imagen.
- **`innerHTML` en 57 puntos** (correcto porque casi todo pasa por `escapeHtml` o `textContent`,
  pero es un patrón que envejece mal).
- **Google Fonts bloqueante** en `<head>` (render-blocking) y contradice el comentario
  "funciona 100 % offline".

---

## 4. Métricas objetivas

| Métrica | Valor |
|---|---|
| `odea.html` | 572 345 bytes · 8 205 líneas |
| HTML gzip | 147 958 bytes (26 % del original) |
| JS inline | 395 544 caracteres en 1 bloque |
| IDs en el DOM | 184 · **0 duplicados** |
| `<h1>` / `<main>` | 0 / 0 |
| Botones en DOM | 56 (7 con `type`) |
| `innerHTML` | 57 usos |
| `escapeHtml` | 46 usos |
| `localStorage` | 23 usos, 26 `try` / 27 `catch` |
| Animaciones CSS | 105 |
| Imágenes | 27 archivos · 2 497 321 bytes |
| Repositorio | 41 archivos · 3 874 239 bytes |
| Historial Git | 143 commits · pack 4.75 MiB |
| Servidor | GitHub Pages · HTTP con HSTS · `cache-control: max-age=600` |

---

## 5. Plan de acción priorizado

### Hoy (2–3 horas) — máximo impacto
1. Corregir "Día 60" → 56 en las 4 cadenas (10 min).
2. Arreglar `tests/smoke.py` línea 16 (1 min).
3. Recomprimir los 2 fondos a WebP (ahorro ~700 KB).
4. Añadir `<h1>`, `<main>` y `aria-live` en `#toast-layer`.

### Esta semana
5. Decidir la entrada del sitio: ODEA en `/` o enlace cruzado explícito.
6. `role="dialog"` + `aria-modal` + `Escape` + trampa de foco en los 6 modales.
7. Eliminar el backup de 578 KB del repo y actualizar `.gitignore`.
8. Convertir dioses/titanes a WebP y añadir `srcset` a los fondos.
9. `<label>` o `aria-label` en `#modal-input`.

### Este mes
10. Añadir CI mínimo (GitHub Actions: `node --check` + smoke test).
11. Meta CSP + `referrer`.
12. Dividir el JS en módulos o al menos en archivos separados.
13. Revisar si los quiz siguen vivos o se archivan.
14. Añadir README con arquitectura, cómo correr los tests y qué versión es la canónica.

---

## 6. Limitaciones de esta auditoría

- **No se pudo ejecutar en navegador headless**: Chrome y Edge están instalados pero el modo
  headless no produce salida en este entorno (probado con `--dump-dom`, `--screenshot` y
  `--headless=new`). Por tanto **no hay Lighthouse, ni axe-core, ni captura de errores de
  consola en runtime**. Todo el análisis es estático + ejecución aislada de los datos en Node.
- **No se probó en dispositivo real** (rendimiento móvil, instalación PWA, offline).
- Los tamaños de Google Fonts son estimados, no medidos.
- El contraste se calculó sobre la paleta declarada, no sobre píxeles renderizados (los
  degradados y overlays pueden alterarlo localmente).
- No se auditó la seguridad del backend porque **no hay backend**.

---

*Auditoría generada el 19/10/2026 sobre el commit `0adff0d`.*
