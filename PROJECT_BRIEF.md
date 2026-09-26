# Speedy's Financial Command Center

## Objetivo

Construir un dashboard financiero y operativo para el dueño de Speedy's Transmission and Auto Repair. La prioridad es controlar las compras de repuestos —qué se compró, a quién, por cuánto y en qué auto se instaló— y cuantificar el dinero inmovilizado en vehículos que permanecen dentro del depósito. La vista también debe responder, sin exigir conocimiento contable, cuánto ingresó, cuánto salió y cuánto quedó.

## Información pública verificada

Fuentes consultadas el 26 de septiembre de 2026:

- [Sitio oficial](https://www.speedystransmission.com/)
- [Historia y servicios](https://www.speedystransmission.com/about)
- [Contacto, horarios y pagos](https://www.speedystransmission.com/contact)

| Dato | Información |
| --- | --- |
| Empresa | Speedy's Transmission and Auto Repair |
| Dirección | 5300 Midlothian Tpke, Richmond, VA 23225, Estados Unidos |
| Actividad desde | 2006 |
| Horario | Lunes a viernes 8:00–17:00; sábado 9:00–16:00; domingo cerrado |
| Servicios principales | Diagnóstico, reparación, reconstrucción, reemplazo y programación de transmisiones; CVT, diésel, 4x4, AWD/FWD; motor, frenos, suspensión, electricidad, aire acondicionado y mantenimiento general |
| Propuesta comercial | Diagnóstico y cotización gratuitos, financiación, grúa 24/7 incluida en reparaciones mayores elegibles, vehículos de préstamo/alquiler y garantías disponibles |
| Formas de pago | American Express, efectivo, Discover, financiación, Mastercard, Visa, Zelle, Cash App, cheques de caja y Square |
| Financiación publicada | QuickFix, Snap Finance y Koalafi |
| Idiomas de atención | Inglés y español |

## Alcance del prototipo

- Un único local y una única vista ejecutiva para el dueño.
- Interfaz completa en español; importes en USD y horario de Virginia (`America/New_York`).
- Secciones: Resumen, Compras, Autos en depósito, Ingresos, Gastos, Flujo de caja, Inversiones y Trabajos.
- Datos determinísticos de abril de 2025 a septiembre de 2026.
- Sin autenticación, persistencia, múltiples sucursales, alertas ni integración con IA/MCP.

## Supuestos internos del prototipo

Las cifras financieras, clientes, vehículos, proveedores, órdenes de reparación, compras de repuestos, inversiones, unidades almacenadas y estados de cobro son simulados. Se diseñaron para ser plausibles y mantener consistencia matemática entre resultados, cuentas por cobrar y caja. La interfaz no muestra una leyenda de datos de muestra por decisión de presentación; esta documentación es el registro técnico que evita confundirlos con registros contables reales.

El resultado operativo se calcula como ingresos devengados menos repuestos, mano de obra y gastos operativos. Las inversiones se presentan por separado y sí afectan caja. Los trabajos pendientes de cobro forman cuentas por cobrar y no ingresan a caja hasta su cobro.

Cada línea simulada de compra de repuestos reconcilia con el costo de repuestos de su orden y queda vinculada a proveedor, pieza, cliente y vehículo. La valuación de autos en depósito es operativa: suma reparación y cargos estimados de almacenamiento, y compara ese importe con un valor potencial de venta. No determina por sí sola propiedad, gravamen ni autorización legal para disponer de un vehículo.

## Información pendiente del cliente

Antes de integrar datos reales se debe confirmar:

1. Sistema contable y plan de cuentas actual.
2. Bancos, tarjetas y pasarelas de pago utilizadas.
3. Sistema de órdenes de trabajo y formato de identificación de cada reparación.
4. Método contable esperado: caja, devengado o ambos.
5. Tratamiento de repuestos, inventario, garantías y devoluciones.
6. Flujo real de compras: órdenes de compra, facturas, proveedores, aprobadores, recepciones y vínculo con cada orden de taller.
7. Inventario físico del depósito: capacidad, VIN, fecha de ingreso, ubicación, último contacto, deuda y estado de cada unidad.
8. Política contractual y proceso legal de Virginia para almacenamiento, gravámenes, notificaciones, abandono y eventual disposición o venta.
9. Nómina, contratistas y distribución real de horas de mano de obra.
10. Proveedores, préstamos, leasing y obligaciones recurrentes.
11. Cuentas por cobrar, cuentas por pagar y antigüedad de saldos.
12. Metas mensuales, presupuesto y margen objetivo.
13. Frecuencia de actualización y responsable de reconciliación.

## Arquitectura de integración

La UI consume la interfaz `FinancialDataProvider`. El proveedor actual filtra un conjunto local simulado; uno futuro podrá consultar QuickBooks, bancos, CSV o la API del software del taller. Las categorías contables están centralizadas para adaptar nombres o mapeos sin reescribir gráficos.

## Roadmap

1. **Prototipo:** experiencia ejecutiva y modelo de datos simulados.
2. **Auditoría:** inventario de sistemas, credenciales, campos y calidad de datos.
3. **Integración:** conectores reales, normalización y actualización programada.
4. **Validación contable:** reconciliación con banco, libros y cierres mensuales.
5. **Inteligencia operativa:** alertas, anomalías, resúmenes y conexión MCP con el asistente elegido.

## Despliegue

La aplicación no necesita variables de entorno para el prototipo. Puede desplegarse importando el repositorio en Vercel con la configuración automática de Next.js. Las futuras credenciales deben residir únicamente en variables server-only y nunca llegar al navegador.
