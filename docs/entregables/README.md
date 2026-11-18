# Entregables

El dossier de la tarea C-25 es el Markdown [`dossier.md`](./dossier.md). El PDF se imprime desde ese archivo.

| Qué | Dónde |
|-----|--------|
| Base del Anexo A | [`dossier.md`](./dossier.md) |
| Capturas de los 14 diagramas | [`figuras/`](./figuras/) |
| PDF para Moodle | [`PROGV-2026-TIF-Equipo03-Dossier.pdf`](./PROGV-2026-TIF-Equipo03-Dossier.pdf) |

El equipo es el 03. En Moodle el archivo lleva el nombre `PROGV-2026-TIF-Equipo03-Dossier.pdf`. La subida es la tarea C-27.

## Hash y tag

En `dossier.md` la portada deja `{{TAG}}`, `{{HASH}}` y `{{HASH_LEYENDA}}`. Esas marcas se reemplazan al imprimir. El Markdown no se modifica.

- Si existe el tag `v1.0-entrega`, el PDF usa `git rev-parse v1.0-entrega`.
- Si el tag no existe, el PDF usa `git rev-parse HEAD` y dice que ese commit es el del armado. El tag anotado se crea en C-26.

El código todavía no está congelado. C-25 en el plan de cierre sigue en por hacer hasta volver a imprimir con el tag.

## Comandos

Desde la raíz del repositorio:

```bash
python docs/entregables/armar_dossier.py
```

Eso escribe el PDF. Hace falta Microsoft Edge y el paquete de Python `markdown`.

Las capturas salen de los SVG de `docs/diagramas/img/`:

```bash
python docs/entregables/exportar_figuras.py
```

`construir_dossier.py` vuelve a escribir `dossier.md` a partir de los ADR, las bitácoras y los capítulos que tiene el script. Pisar el Markdown a mano y después correr ese script borra el cambio. Para imprimir alcanza con `armar_dossier.py`.
