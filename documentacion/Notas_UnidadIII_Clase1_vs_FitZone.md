# Notas: Unidad III Clase 1 (patrones) frente a FitZone

**Fecha:** 2026-10-06 · **Autor:** Patricio Ramos (P1)  
**Fuente:** [transcripción de la clase](./UnidadIII_Clase1_Patrones_de_Diseno.md) (PDF `UnidadIII_Clase1_Patrones_de_Diseño.pdf`)  
**Para:** ajustar la [justificación de patrones (S4-T05)](./Justificacion_Patrones_Unidad_III.md)

---

## 1. Puntos de la clase que tocan lo ya hecho

| Tema | Qué dice el profesor | Impacto en FitZone |
|------|----------------------|--------------------|
| **Observer a mano** | En "Cuándo NO usar un patrón" pone como ejemplo "un Observer a mano habiendo eventos de dominio" en el framework. Contrapregunta: "¿qué me da mi versión que no me da la del framework?" (diap. 46) | Es lo que hicimos en S4-T02 al elegir interfaces propias frente a `@nestjs/event-emitter`. La justificación tiene que responder esa pregunta |
| **Strategy o Decorator** para el precio (RF-11) | Si las reglas son excluyentes, es Strategy. Si se **acumulan** sobre el mismo precio (descuento + recargo + IVA), en rigor es una cadena de decoradores. Acepta cualquiera de los dos nombres si la justificación lo explica (diap. 26 y 35) | Nuestro diseño (S4-T09, P4) combina descuento y recargo: hay que decirlo explícitamente en la sección Strategy |
| **Tres decisiones obligatorias del Observer** | Las pide "sí o sí" en el Trabajo Integrador (diap. 37): (1) ¿antes o después del commit?; (2) ¿mismo hilo u otro?; (3) ¿qué pasa si el proceso se cae entre el commit y el aviso? (bandeja de salida) | La justificación cubre en parte la (1) y no las otras dos |

---

## 2. Patrones que el profesor ve para FitZone

| Patrón | Caso en FitZone según la clase | Diap. |
|--------|-------------------------------|-------|
| **Strategy** | Precio de canchas (RF-11) | 32–35 |
| **Observer** | Aviso a la lista de espera al liberarse un cupo (RF-08) | 32, 36–37 |
| **Builder** | Armar una Reserva (muchos campos); "el creacional que casi seguro van a necesitar" | 13, 16 |
| **Factory Method** | Elegir el notificador según el canal del socio (push, email, SMS) | 13–14 |
| **Adapter** | Pasarela de pago (MercadoPago) detrás de una interfaz del dominio | 24 |
| **Facade** | Caso de uso `reservar()` de canchas: disponibilidad, membresía, precio, pago, reserva, aviso | 27 |
| **State** | Membresía (Activa / Vencida / Suspendida), cancha (Disponible / Mantenimiento), reserva | 40–41 |
| **Chain of Responsibility** | Validaciones previas a una reserva, devolviendo todos los errores juntos | 42 |
| **Template Method** | Emisión de comprobantes: el flujo es uno, el formato cambia | 39 |
| **Composite** | Árbol red → región → sede → espacio para reportes de ocupación | 30 |
| **Abstract Factory** | **Descartarlo y escribir por qué** (hay una sola pasarela y un solo país) | 15 |

---

## 3. Pendiente

Comparar esta lista con el proyecto y proponer cómo ajustar la justificación de S4-T05.
