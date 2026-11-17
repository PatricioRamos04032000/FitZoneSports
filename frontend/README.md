# Frontend — FitZone Sports

SPA en React, TypeScript y Vite. Los componentes propios siguen Atomic Design. El catálogo (nivel, props y pantalla que usa cada pieza) está en [src/components/README.md](src/components/README.md).

## Cómo correrlo

Desde esta carpeta:

```bash
npm install
npm run dev
```

`npm run build` compila TypeScript y arma el bundle. `npm run lint` corre ESLint.

La URL de la API es `VITE_API_URL`. El ejemplo de variables está en `.env.example`.

Las páginas viven en `src/portal/` y `src/admin/`. El organismo que las envuelve es `Layout`.
