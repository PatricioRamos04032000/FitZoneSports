# Funcionalidades por actor — FitZone Sports

Documento de alcance funcional: qué puede y qué no puede hacer cada actor del sistema.

**Referencia:** Caso "FitZone Sports" · Programación V · UNER  
**Actores:** A1 Socio Activo · A2 Cliente Externo · A3 Recepcionista / Admin. de Sede · A4 Gerente Central

---

## Checklist de cobertura

- [x] Funcionalidades de Socio Activo (reservas, descuento 15%, QR dinámico)
- [x] Funcionalidades de Cliente Externo (pago tarifa plena por uso)
- [x] Funcionalidades de Recepcionista (validación QR, aforo en tiempo real)
- [x] Funcionalidades de Gerente Central (gestión de sedes, precios, reportes)
- [x] Comportamiento con cuota vencida (RN-03)

---

## A1 — Socio Activo

Usuario con membresía vigente (estado **Activo**). Puede operar en todas las sedes (RF-03).

### Permitido

| Área | Funcionalidad |
|------|----------------|
| Perfil | Consultar y mantener su perfil (DNI, contacto, foto) |
| Membresía | Ver plan (Mensual / Trimestral / Anual), estado y renovar (automática simulada o manual vía pasarela) |
| Acceso multi-sede | Ingresar a cualquier sede de la cadena con la misma membresía |
| QR dinámico | Generar/mostrar QR de ingreso que rota cada minuto (RF-04) |
| Gimnasio | Validar ingreso a sede mediante QR (membresía activa) |
| Clases grupales | Reservar clases hasta 48 hs antes; cancelar sin penalidad hasta 2 hs antes (RF-07) |
| Lista de espera | Enlistarse si la clase está llena y recibir notificación al liberarse un cupo (RF-08) |
| Canchas | Consultar grilla de disponibilidad y reservar turnos (RF-10) |
| Descuento 15% | Pagar canchas con precio de socio (`MemberDiscountPricing`) (RF-11) |
| Horario pico | Aplicar el recargo 19:00–21:00 sobre el precio de socio (si corresponde) |
| Pagos | Pagar membresía y reservas vía pasarela simulada; obtener comprobante PDF (RF-13, RF-14) |

### Restringido

| Área | Restricción |
|------|-------------|
| Administración | No gestiona sedes, precios globales, alta de canchas ni agenda de clases |
| Acceso concurrente | No puede figurar “dentro” de dos sedes a la vez (RN-01) |
| Concurrencia de cancha | Si otro usuario confirma la misma cancha/horario en el mismo instante, solo uno tiene éxito (RN-02) |
| Datos de pago | No se almacenan datos de tarjeta; solo token de pasarela (RNF-02) |
| Cancha en mantenimiento | No puede reservar turnos futuros de una cancha inhabilitada (RF-12) |
| Mora | Si la cuota vence, pierde beneficios de socio (ver sección RN-03) |

---

## A2 — Cliente Externo

Usuario **sin membresía**. Usa la plataforma solo para alquiler de canchas, pagando por uso a **tarifa plena**.

### Permitido

| Área | Funcionalidad |
|------|----------------|
| Perfil | Alta/consulta de usuario como Cliente Externo (RF-01) |
| Canchas | Consultar disponibilidad y reservar turnos (RF-10) |
| Precio | Pagar tarifa estándar / plena (`StandardPricing`), más recargo de horario pico si aplica (RF-11) |
| Pagos | Pagar la reserva vía pasarela simulada y recibir comprobante PDF (RF-13, RF-14) |

### Restringido

| Área | Restricción |
|------|-------------|
| Membresía | No tiene plan de socio ni estados de membresía como beneficio |
| Descuento 15% | No aplica precio de socio |
| Gimnasio / QR | No usa QR de socio ni control de acceso a gimnasio por membresía |
| Clases grupales | No reserva clases ni usa lista de espera |
| Acceso multi-sede como socio | No tiene el derecho de ingreso a sedes por membresía vigente |
| Administración | No gestiona sedes, precios, clases, aforo ni reportes |

---

## A3 — Recepcionista / Admin. de Sede

Opera el día a día de **su sucursal**: valida accesos y resuelve incidencias locales.

### Permitido

| Área | Funcionalidad |
|------|----------------|
| Validación QR | Escanear/validar el QR dinámico del socio contra membresía activa (RF-04) |
| Aforo en tiempo real | Ver aforo actual y aforo máximo permitido de su sede (RF-05) |
| Operación local | Gestionar incidencias del día a día en su sucursal (ingresos, consultas operativas) |
| Alcance | Acciones acotadas a la sede asignada |

### Restringido

| Área | Restricción |
|------|-------------|
| Sedes | No crea ni configura otras sedes |
| Precios globales | No define precios de canchas ni políticas de descuento a nivel cadena |
| Reportes consolidados | No visualiza reportes globales entre todas las sedes (rol de Gerente Central) |
| Membresías globales | No redefine planes ni política comercial central |
| QR ajeno / offline de negocio | No puede ignorar RN-01 (un usuario en dos sedes) ni RN-03 (mora) al validar beneficios |

---

## A4 — Gerente Central

Administrador global de la cadena: configuración comercial, sedes y visión consolidada.

### Permitido

| Área | Funcionalidad |
|------|----------------|
| Sedes | Crear y administrar sedes (alta/configuración) |
| Precios | Definir costos por hora y tipo de cancha; políticas de precio (estándar, descuento socio, pico) (RF-09, RF-11) |
| Recursos | Alta de canchas por sede; inhabilitar canchas por mantenimiento (RF-09, RF-12) |
| Clases | Crear/gestionar agenda de clases: tipo, instructor, horario, capacidad (RF-06) |
| Reportes | Visualizar reportes consolidados entre sedes |
| Alcance | Operación multi-sede a nivel cadena |

### Restringido

| Área | Restricción |
|------|-------------|
| Como usuario final “socio” | No es el rol destinado a reservar para beneficio personal vía app de socio |
| Datos de tarjeta | No almacena ni consulta PAN/CVV; solo tokens de pasarela (RNF-02) |
| Sobreventa | No puede forzar doble reserva de la misma cancha/horario (RN-02 / ACID) |
| Disponibilidad offline de tornos | La disponibilidad 99.5% del control de acceso (RNF-01) es requisito del sistema, no una “excepción” de negocio del gerente |

---

## RN-03 — Socio con cuota vencida (mora)

Aplica cuando el socio pasa de **Activo** a **Vencido** (o equivalente de mora). Deja de operar como Socio Activo pleno; el sistema trata el uso de canchas como cliente externo a efectos de precio.

### Sigue pudiendo

- Consultar su perfil y estado de membresía.
- Renovar / pagar la cuota (vía pasarela) para volver a estado Activo.
- Alquilar canchas pagando el **precio externo** (tarifa plena / `StandardPricing` + pico si aplica).
- Recibir comprobante de pago de esa reserva.

### Queda restringido

- Reservar **clases grupales** (ni cupo ni lista de espera con beneficio de socio).
- Reservar / pagar canchas con el **descuento del 15%**.
- Usar beneficios exclusivos de membresía vigente (p. ej. ingreso a gimnasio como socio activo vía QR, según validación de membresía activa en RF-04).

### Resumen operativo

| Acción | Socio Activo | Socio con cuota vencida | Cliente Externo |
|--------|--------------|-------------------------|-----------------|
| Ingreso gimnasio (QR / membresía activa) | Sí | No (membresía no activa) | No |
| Reserva de clases | Sí | No | No |
| Lista de espera de clases | Sí | No | No |
| Reserva de canchas | Sí | Sí (precio externo) | Sí (precio externo) |
| Descuento 15% en canchas | Sí | No | No |
| Renovar membresía | Sí | Sí | N/A (no es socio) |

---

## Matriz rápida por módulo

| Funcionalidad | Socio Activo | Cliente Externo | Recepcionista | Gerente Central |
|---------------|:------------:|:---------------:|:-------------:|:---------------:|
| Gestionar propio perfil | ✓ | ✓ | — | — |
| Membresía / renovación | ✓ | ✗ | — | configuración global* |
| QR dinámico de ingreso | ✓ | ✗ | valida | — |
| Ver aforo de sede | — | — | ✓ (su sede) | según reportes/ops* |
| Reservar clases | ✓ | ✗ | — | agenda (alta) |
| Lista de espera clases | ✓ | ✗ | — | — |
| Reservar canchas | ✓ (−15%) | ✓ (plena) | — | recursos/precios |
| Crear sedes / precios / reportes | ✗ | ✗ | ✗ | ✓ |
| Validar ingreso en sede | — | — | ✓ | — |

\* Donde el caso no detalla cada pantalla, el alcance se interpreta por el rol: **recepcionista = operación local**; **gerente = configuración y visión central**.

---

*Documento derivado del Trabajo Integrador FitZone Sports · centrado en funcionalidades permitidas y restringidas por actor.*
