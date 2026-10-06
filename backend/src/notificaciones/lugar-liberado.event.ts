/** Usar siempre la constante: un nombre mal escrito compila igual y nadie recibe el evento. */
export const LUGAR_LIBERADO = 'lista-espera.lugar-liberado';

export interface LugarLiberadoEvent {
  esperaId: string;
  perfilId: string;
  /** Plazo para confirmar el lugar reservado (D7). */
  venceEn: string;
  clase: { id: string; tipo: string; inicio: string };
}

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: 'numeric',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function mensajeLugarLiberado(evento: LugarLiberadoEvent): {
  titulo: string;
  mensaje: string;
} {
  const inicio = formatoFecha.format(new Date(evento.clase.inicio));
  const vence = formatoFecha.format(new Date(evento.venceEn));
  return {
    titulo: `Se liberó un lugar en ${evento.clase.tipo}`,
    mensaje:
      `Hay un lugar para vos en ${evento.clase.tipo} (${inicio}). ` +
      `Confirmalo antes de ${vence}; si no, pasa al siguiente de la lista.`,
  };
}
