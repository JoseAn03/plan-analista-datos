# ODEA UI v8

Esta entrega añade una segunda capa visual segura sobre la aplicación existente.

## Cambios incluidos

- Nueva meta descripción para SEO.
- Tipografía de lectura `Space Grotesk` con fallback del sistema.
- Fondo espacial con nebulosas y estrellas sutiles.
- Superficies, bordes y botones con una jerarquía cyberpunk espacial más limpia.
- Mejoras de contraste, estados `focus-visible` y tamaño mínimo de controles.
- Navegación lateral y móvil con iconos SVG originales.
- Briefing de arranque con foco visual y navegación atenuada mientras el onboarding está abierto.
- Diagnóstico de arranque sin overflow horizontal, con checkboxes SVG/CSS legibles y acciones sticky.
- Mapa de mundos con profundidad orbital, anillos sutiles y planetas más legibles.
- Tarjetas de misión con jerarquía de lectura, estados completados y glifos propios para estudiar/practicar/consolidar.
- Ocultación del botón flotante `Continuar hoy` mientras está abierto el onboarding.
- Service Worker actualizado para cachear los nuevos recursos.

## Garantía de alcance

No se modificaron los datos de misiones, el estado del juego, `localStorage`, las funciones de progreso, las rutas de navegación ni los handlers existentes. Los nuevos recursos se cargan como una hoja CSS y un script de iconos independiente.

## Verificación

```bash
python tests/smoke.py
node --check assets/odea-icons-v7.js
```

Ambas comprobaciones pasan correctamente.
