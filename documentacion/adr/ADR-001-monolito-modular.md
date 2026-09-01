# ADR-001: Adopción de arquitectura de monolito modular

Estado: Aceptado  
Fecha: 2026-08-25

## Contexto

FitZone Sports debe gestionar membresías, acceso por QR, clases grupales y alquiler de canchas en más de 25 sedes, con reglas fuertes de consistencia. Si dos usuarios reservan la misma cancha en el mismo horario, solo uno debe tener éxito (RN-02). Un usuario no puede figurar dentro de dos sedes a la vez (RN-01). Los pagos y comprobantes deben quedar ligados a las reservas (M5).

El equipo son cuatro personas, con dieciséis semanas de trabajo y entregables acumulativos: frameworks backend, patrones de diseño, frontend, CI/CD y app móvil. La cátedra sugiere contenedores backend tipo Spring Boot o NestJS y plantea la tensión entre transacciones ACID locales y arquitecturas distribuidas. El trabajo integrador pide justificar explícitamente por qué no se adoptan microservicios.

## Decisión

Vamos a adoptar un monolito modular: una sola aplicación backend desplegable (API REST), con módulos internos por dominio (usuarios, acceso, clases, canchas, pagos, sedes) y una base de datos compartida (ADR-002). El camino crítico es una aplicación web multi-rol; la app móvil queda diferida a la Unidad VI (ADR-003).

No adoptaremos microservicios ni bases de datos separadas por módulo en este proyecto. La lógica de negocio y los patrones GoF (Repository, Strategy, Observer) vivirán dentro del monolito NestJS, no en un BaaS que reemplace el backend del curso.

## Consecuencias

Positivas: las transacciones ACID locales facilitan reservas y reglas de concurrencia (RN-02); hay un solo deploy de API y un contrato REST/Swagger claro; el enfoque encaja con el tamaño del equipo y el plazo académico; los módulos internos permiten repartir trabajo entre integrantes sin fragmentar el runtime.

Negativas: el despliegue escala la API entera, no un módulo aislado; hace falta disciplina para respetar los límites entre módulos y no acoplar todo; si el sistema creciera mucho en el futuro, podría evaluarse extraer módulos, pero eso queda fuera del alcance actual.

## Alternativas consideradas

(a) Microservicios (reservas, pagos y usuarios como servicios separados): descartada por la complejidad de transacciones distribuidas (sagas, 2PC) para evitar sobreventa, y por el overhead de operaciones (deploy, redes, observabilidad) desproporcionado para cuatro desarrolladores y dieciséis semanas.

(b) Monolito sin módulos (“big ball of mud”): descartado porque dificulta aplicar Repository, Strategy y Observer y escalar el trabajo en paralelo dentro del equipo.

(c) Backend BaaS puro (toda la lógica en Supabase, sin Nest): descartado porque la lógica de negocio y los patrones del curso deben vivir en el backend NestJS (ver también ADR-003 y ADR-005).
