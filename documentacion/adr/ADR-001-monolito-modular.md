# ADR-001 — Monolito modular

| Campo | Valor |
|-------|-------|
| **ID** | ADR-001 |
| **Título** | Adoptar arquitectura de monolito modular |
| **Estado** | Aceptada |
| **Fecha** | 2026-08-25 |
| **Decisores** | Equipo FitZone Sports (P1–P4) |
| **Relacionado** | [C4](../C4_Arquitectura_FitZone.md) · [ADR-002](./ADR-002-postgresql.md) · [ADR-003](./ADR-003-stack-nestjs-react.md) |

---

## Contexto

FitZone Sports debe gestionar membresías, acceso por QR, clases grupales y alquiler de canchas en **25+ sedes**, con reglas fuertes de consistencia:

- **RN-02:** si dos usuarios reservan la misma cancha/horario al mismo tiempo, solo uno debe tener éxito.
- **RN-01:** un usuario no puede figurar dentro de dos sedes a la vez.
- Pagos y comprobantes ligados a reservas (M5).

El equipo es de **4 personas**, con **16 semanas** y entregables acumulativos (frameworks, patrones, frontend, CI/CD, móvil). La cátedra sugiere contenedores backend tipo Spring Boot o NestJS y enfatiza transacciones ACID frente a una arquitectura de microservicios.

## Decisión

Adoptar un **monolito modular**:

- Una sola aplicación **backend** desplegable (API REST).
- Módulos internos por dominio (usuarios, acceso, clases, canchas, pagos, sedes).
- Una base de datos compartida (ver ADR-002).
- Frontends: aplicación **web multi-rol** (camino crítico) y app móvil **diferida** a Unidad VI (ver ADR-003).

No se adoptarán microservicios ni bases de datos por módulo en este proyecto.

## Alternativas consideradas

| Alternativa | Motivo de descarte (ahora) |
|-------------|----------------------------|
| **Microservicios** (reservas, pagos, usuarios como servicios) | Complejidad de transacciones distribuidas (sagas/2PC) para evitar sobreventa; overhead de ops (deploy, redes, observabilidad) desproporcionado para 4 devs y 16 semanas |
| **Monolito sin módulos** (“big ball of mud”) | Dificulta aplicar Repository/Strategy/Observer y escalar el trabajo en paralelo |
| **Backend BaaS puro** (p. ej. toda la lógica en Supabase) | La lógica de negocio y los patrones GoF deben vivir en el backend del curso (NestJS) |

## Consecuencias

### Positivas

- Transacciones **ACID** locales para reservas y reglas de concurrencia.
- Un solo deploy de API (Render) y un contrato REST/Swagger claro.
- Encaja con el tamaño del equipo y el time-to-market académico.
- Los módulos permiten repartir trabajo (P1/P2 backend) sin fragmentar el runtime.

### Negativas / trade-offs

- El despliegue escala la API entera (no un módulo aislado).
- Disciplina requerida: límites entre módulos para no acoplar todo.
- Si en el futuro el sistema creciera mucho, podría evaluarse extraer módulos (no es el alcance actual).

### Impacto en el diseño

- El nivel C4 **Components** modela módulos NestJS, no servicios independientes.
- CI/CD apunta a un pipeline de backend + uno de frontend (Unidad V).

---

## Notas

Esta decisión es la base explícita del trabajo integrador (“¿Por qué no Microservicios?”). Cualquier cambio requeriría un ADR que la supersede.
