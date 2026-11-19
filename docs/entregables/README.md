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

La impresión y la sustitución del hash son de C-26, después del commit y del tag `v1.0-entrega`. Si el tag existe, el PDF usa `git rev-parse v1.0-entrega`. Esta pasada de C-25 no imprime.

El código todavía no está congelado. C-25 en el plan de cierre sigue en por hacer hasta esa reimpresión.

Las claves de la portada se completan a mano antes de Moodle y no se versionan. Pegarlas en `dossier.md` y volver a correr `construir_dossier.py` borra lo escrito.

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
