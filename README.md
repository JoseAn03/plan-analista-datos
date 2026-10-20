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
| `tests/smoke.py` | Smoke test (sintaxis JS + invariantes) |
| `quiz.html`, `quiz-definitivo.html` | Cuestionarios sueltos, no enlazados desde la app |

### Cifras del contenido

- **168 misiones diarias** = 56 días × 3 misiones (slots A/B/C)
- **54 misiones de campaña** + **4 jefes** = 58
- **8 misiones semanales**
- **8 capítulos** (día 0 y días 1–56)

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
python3 tests/smoke.py
```

Requiere Python 3 y Node. Valida la sintaxis del JS inline y algunos invariantes
(símbolos clave, coherencia de versión HTML/sw.js, respaldos).

### Versionado

Al publicar cambios hay que tocar **dos** sitios:

1. `APP_VERSION` y el badge `v…` dentro de `odea.html`
2. `CACHE_VERSION` en `sw.js` (fuerza la actualización en los clientes)

Si cambias `assets/odea-ui-v7.css` o `assets/odea-icons-v7.js`, sube también el
cache-busting `?v=` con el que se referencian en `odea.html` y en `SHELL`.

---

## Despliegue

GitHub Pages sirve la rama `main` desde la raíz. No hay paso de compilación ni CI.
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
