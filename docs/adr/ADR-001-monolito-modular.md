# ADR-001 — Monolito modular frente a microservicios, SOA y serverless

- **Estado:** Aceptado
- **Fecha:** 2026-08-25
- **Autor:** Equipo FitZone Sports (P1–P4). Alineación al Anexo B: Patricio Ramos (P1), 2026-11-09
- **Sprint:** 1
- **Lineamientos:** §5.2.1 ADR-001

La decisión no cambió el 2026-11-09. Se completaron los campos del Anexo B y se explicitaron SOA y serverless, que el registro anterior no nombraba. El texto previo está en `historial/ADR-001-monolito-modular.md`.

## Contexto

FitZone Sports tenía que gestionar membresías, acceso por QR, clases y alquiler de canchas en más de 25 sedes. Dos reglas no admitían un resultado intermedio: si dos personas reservan la misma cancha en el mismo horario, solo una reserva vale (RN-02), y un socio no puede figurar dentro de dos sedes a la vez (RN-01). Los pagos tenían que quedar ligados a la reserva.

El equipo eran cuatro personas, con un cuatrimestre y entregables acumulativos de backend, patrones, frontend, integración continua y una app móvil al final. La cátedra pedía justificar el estilo arquitectónico frente a microservicios y dejaba abierta la tensión entre transacciones locales y un sistema distribuido. Sumar una sede tenía que ser configuración, no un deploy nuevo (RNF-04).

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Microservicios (reservas, pagos y usuarios por separado) | Escalar y desplegar un módulo sin tocar el resto | RN-02 pasa a ser una saga o un 2PC; hacen falta varios deploys, red y observabilidad | El costo de operación no cierra con cuatro personas y el plazo del cuatrimestre |
| SOA, con servicios de dominio detrás de un bus | Reutiliza capacidades si ya hay sistemas para integrar | La transacción del turno sigue distribuida, y aparece un bus que nadie más va a consumir | No había legados que integrar. El problema de la sobreventa no se simplifica |
| Serverless y BaaS (funciones sueltas, lógica en el proveedor de la base) | Menos servidores propios y escala a cero | El límite transaccional de RN-02 queda partido entre funciones; el arranque en frío molesta en la demo; los patrones del curso no tienen un proceso donde vivir | Se descartó como estilo del sistema. Supabase queda como base e identidad, no como reemplazo del backend |
| Monolito sin módulos | Un solo deploy y menos carpetas | No hay límite para Repository, Strategy y Observer, ni una forma clara de repartir el trabajo | Se descartó por el riesgo de acoplar todo el dominio en un solo paquete |

## Decisión

Se adopta un monolito modular: una sola API REST desplegable, con módulos internos por dominio (usuarios, acceso, clases, canchas, pagos y sedes) y una base de datos compartida (ADR-002).

El criterio determinante fue poder cerrar RN-02 en una transacción local, con un equipo chico y un solo contrato HTTP.

La app móvil, si entra, es otro cliente de esa API. No es otro estilo arquitectónico.

## Consecuencias

- **Positivas:** las transacciones locales alcanzan para la reserva y para la presencia en sede; hay un solo deploy de API y un Swagger; los módulos permiten repartir el trabajo sin partir el runtime; una sede nueva es una fila, no un servicio (RNF-04).
- **Negativas:** no se escala un módulo aislado; hace falta disciplina para no cruzar dominios por imports oportunos; un fallo grave del proceso afecta a todos los módulos.
- **Deuda asumida:** extraer un módulo a otro proceso, si el sistema creciera, es una decisión nueva y otro ADR. No está previsto en esta entrega.

## Requisitos relacionados

RN-02, RN-01, RNF-04
