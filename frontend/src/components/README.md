# Catálogo Atomic Design

Componentes propios de la SPA. No hay kit de UI ni Storybook: el plan de cierre dejó el catálogo en este archivo. Las páginas no viven acá; siguen en `src/portal/` y `src/admin/`.

| Nivel | Pieza | Archivo | Props | Se usa en |
|-------|-------|---------|-------|-----------|
| Átomo | Button | [atoms/Button/Button.tsx](atoms/Button/Button.tsx) | Atributos de `<button>`. `type` vale `button` si no se pasa. `className` se suma a `atom-button`. | Login, envío del formulario |
| Átomo | Input | [atoms/Input/Input.tsx](atoms/Input/Input.tsx) | Atributos de `<input>`, más `label` e `id`. | Login, email y contraseña |
| Átomo | Select | [atoms/Select/Select.tsx](atoms/Select/Select.tsx) | Atributos de `<select>`, más `label`, `id` y las opciones en `children`. | Canchas, sede y horario |
| Átomo | Spinner | [atoms/Spinner/Spinner.tsx](atoms/Spinner/Spinner.tsx) | `label` opcional. Si no viene, el texto es `Cargando`. | Login, dentro del botón mientras ingresa |
| Molécula | Alerta | [molecules/Alerta/Alerta.tsx](molecules/Alerta/Alerta.tsx) | `children`. `variante` opcional: hoy solo `error`, que es el valor por defecto. El nodo tiene `role="alert"`. | Login (credencial inválida) y Canchas (carga, mis reservas y la reserva) |
| Organismo | Layout | [organisms/Layout/Layout.tsx](organisms/Layout/Layout.tsx) | Ninguna. Lee la sesión con `useAuth` y pinta el `<Outlet />`. | Todas las rutas, desde [App.tsx](../App.tsx) |

No hay carpeta de templates. Un organismo compone la página; la página en sí queda en el portal o en el admin.

## Responsive

Login y Canchas ya adaptaban el ancho (C-03). Este catálogo no les cambia el corte:

- [Login.css](../portal/Login/Login.css) achica el formulario por debajo de 480 px y de 350 px.
- [Canchas.css](../portal/Canchas/Canchas.css) achica el contenido por debajo de 600 px y de 350 px. El `Select` mide como máximo 450 px y, debajo de 600 px, ocupa el ancho de la pantalla. El control usa 16 px para que el celular no haga zoom al enfocarlo.
- [Layout.css](organisms/Layout/Layout.css) parte el menú por debajo de 650 px.

`Select` fija color `#14283f` y fondo blanco. Así la opción se lee también cuando el sistema está en modo oscuro.
