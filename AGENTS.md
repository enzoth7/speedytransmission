# AGENTS.md — Speedy's Financial Command Center

## Propósito

Este repositorio contiene el dashboard financiero ejecutivo de Speedy's Transmission and Auto Repair. Toda decisión debe favorecer una lectura rápida para el dueño: dinero que entra, dinero que sale, rentabilidad, caja y acciones pendientes.

No describas al cliente con calificativos personales. Traducí las necesidades de protagonismo y control a una experiencia directa, jerárquica y centrada en resultados.

## Stack y comandos

- Next.js App Router, React, TypeScript estricto.
- Tailwind CSS y componentes locales con patrón shadcn/ui.
- Lucide para iconografía; nunca emojis como iconos. Motion para microinteracciones sutiles y respetuosas de `prefers-reduced-motion`.
- Recharts para visualizaciones.
- Vitest + Testing Library; Playwright para recorridos completos.
- `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.

## Identidad visual

- Azul principal: `#00307B`.
- Rojo de marca/alerta: `#C90301`.
- Amarillo de énfasis: `#FFC834`; no usar como texto pequeño sobre blanco.
- Fondo: `#F8FAFC`; tarjetas: `#FFFFFF`; texto: `#0F172A`.
- Positivo: `#15803D`; borde: `#DCE4EE`; texto secundario: `#5B677A`.
- Títulos: Oswald 700. Texto, controles y cifras: Poppins 400–700, con números tabulares.
- Estética clara, contable e industrial. Sin gradientes decorativos, glassmorphism ni animaciones teatrales.

## Reglas de experiencia

- Están prohibidos los eyebrows y los elementos JSX `<span>` y `<p>`. Usar encabezados, `div`, `strong`, `small`, `output`, `dt`/`dd` u otra semántica adecuada. ESLint debe impedir su reintroducción.
- Prioridad desktop 1440 px, pero funcionamiento completo a 375, 768 y 1024 px.
- Controles táctiles de al menos 44×44 px, foco visible y navegación por teclado.
- Transiciones entre 150 y 250 ms; respetar `prefers-reduced-motion`.
- Los gráficos siempre incluyen leyenda, valores o resumen textual; el color nunca es la única señal.
- Usar esqueletos con altura reservada para evitar saltos de layout.
- Mantener navegación, filtros y KPIs consistentes en todas las secciones.
- Reutilizar `components/dashboard/finance-ui.tsx` para métricas, insights y superficies bento; no duplicar estos patrones dentro de cada página.
- La interfaz visible se escribe en español, los importes son USD y la zona horaria es `America/New_York`.

## Datos y cálculos

- Los componentes no importan datos crudos: consumen `FinancialDataProvider` y funciones de agregación.
- Mantener tipos de dominio en `lib/types.ts`, categorías en `lib/categories.ts`, datos simulados en `lib/mock-data.ts` y cálculos en `lib/finance.ts`.
- Toda compra de repuestos debe poder trazarse a proveedor, pieza, orden y vehículo; la suma de sus líneas debe reconciliar con `RepairOrder.partsCost`.
- Los autos en depósito son inventario operativo a una fecha de corte. Separar arreglo, cargos de almacenamiento, total pendiente y valor potencial de recuperación; no presentar la valuación como autorización legal de venta.
- No duplicar fórmulas financieras en componentes.
- Ingresos devengados incluyen trabajos terminados aunque estén pendientes de cobro.
- Caja incluye únicamente movimientos efectivamente cobrados o pagados.
- Inversiones afectan caja, pero se separan del resultado operativo.
- Toda nueva cifra agregada debe incluir una prueba de reconciliación.

## Integraciones futuras

- Implementar nuevos orígenes como proveedores que satisfagan `FinancialDataProvider`.
- Normalizar datos externos al modelo interno antes de exponerlos a la UI.
- Mantener credenciales y conectores en el servidor.
- No incorporar autenticación, sucursales, base de datos, alertas o MCP hasta contar con requisitos y fuentes reales.

## Criterios de entrega

Antes de cerrar un cambio ejecutá lint, TypeScript, pruebas unitarias y build. Para cambios de navegación, filtros o responsive, ejecutá también Playwright. Verificá contraste, foco, estados vacíos, carga y ausencia de scroll horizontal.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
