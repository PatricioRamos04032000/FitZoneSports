# Architecture Decision Records (ADR) — FitZone Sports

Índice de decisiones arquitectónicas del proyecto.

**Entregable relacionado:** Unidad I — PDF con diagramas C4 + documento ADR  
**Referencias:** [C4](./C4_Arquitectura_FitZone.md) · [Stack](./Stack_Tecnologico_y_Herramientas.md) · [Trabajo Integrador](./Trabajo_Integrador_FitZone_Sports.md)

| ID | Título | Estado |
|----|--------|--------|
| [ADR-001](./adr/ADR-001-monolito-modular.md) | Adopción de arquitectura de monolito modular | Aceptado |
| [ADR-002](./adr/ADR-002-postgresql.md) | Uso de PostgreSQL como base de datos relacional | Aceptado |
| [ADR-003](./adr/ADR-003-stack-nestjs-react.md) | Adopción de NestJS y React web multi-rol con TypeScript | Aceptado |
| [ADR-004](./adr/ADR-004-hosting-vercel-render-supabase.md) | Despliegue en Vercel, Render y Supabase | Aceptado |
| [ADR-005](./adr/ADR-005-bff-supabase-auth.md) | Uso de Supabase Auth con NestJS como pasarela (BFF) | Aceptado |
| [ADR-006](./adr/ADR-006-supabase-api-sin-orm.md) | Acceso a datos vía API de Supabase sin ORM | Aceptado |

---

## Plantilla

Cada ADR del proyecto sigue esta estructura:

```
ADR-XXX: [Título corto de la decisión]
Estado: [Propuesto | Aceptado | Rechazado | Reemplazado por ADR-YYY]
Fecha: [AAAA-MM-DD]

Contexto
[¿Cuál es el problema? ¿Qué restricciones técnicas, de negocio, de tiempo o de equipo influyen?
Describilo de forma neutral, sin adelantar la solución.]

Decisión
[¿Qué se decidió hacer? Redactado en modo activo: "Vamos a..."]

Consecuencias
Positivas: [beneficios de esta decisión]
Negativas: [costos, riesgos o trabajo futuro que introduce]

Alternativas consideradas
[Qué otras opciones se evaluaron y por qué se descartaron.]
```

**Convenciones del repo**

- Archivo: `documentacion/adr/ADR-00N-slug.md`
- Nuevas decisiones se agregan al índice de arriba.
- Detalle de implementación pendiente → `Decisiones_Pendientes_y_Cosas_a_Definir.md`, no en el ADR.

---

## Ejemplo (cátedra — TiendaYa)

Referencia de redacción; no forma parte de FitZone Sports.

**ADR-001: Uso de una pasarela de pago externa para procesar tarjetas**

Estado: Aceptado  
Fecha: 2026-03-10

**Contexto**

TiendaYa necesita cobrar pagos con tarjeta de crédito/débito en el checkout del marketplace. Procesar y almacenar los datos de tarjeta directamente en nuestros servidores implicaría cumplir con el estándar PCI DSS (Payment Card Industry Data Security Standard), lo cual exige controles de seguridad costosos — cifrado de datos en reposo y en tránsito, segmentación de red, gestión de claves y auditorías anuales — y un equipo dedicado a mantenerlos. El equipo de TiendaYa es chico y la prioridad del negocio es salir al mercado rápido, sin comprometer la seguridad de los datos de pago de los usuarios.

**Decisión**

Vamos a integrar una pasarela de pago externa (por ejemplo, un proveedor del estilo de Mercado Pago o Stripe) a través de su API/SDK, en lugar de capturar y almacenar los números de tarjeta en nuestros propios servidores. El formulario de pago queda delegado al checkout del proveedor, que nos devuelve un token de la transacción; el backend de TiendaYa nunca recibe ni persiste el número de tarjeta completo.

**Consecuencias**

Positivas: reducimos drásticamente el alcance de cumplimiento PCI DSS que nos corresponde; no necesitamos mantener infraestructura de seguridad propia para datos de tarjetas; heredamos las validaciones antifraude del proveedor.

Negativas: dependemos de la disponibilidad y de las comisiones del proveedor externo; una caída de la pasarela bloquea todo el checkout; cambiar de proveedor en el futuro va a requerir trabajo de reintegración.

**Alternativas consideradas**

(a) Procesar tarjetas internamente con certificación PCI DSS propia: descartada por el costo y la complejidad que implica para el tamaño actual del equipo.

(b) Ofrecer solo pago por transferencia bancaria manual: descartada porque afecta negativamente la conversión y la experiencia de compra.

---

*ADR · FitZone Sports · Programación V · UNER*
