const ZONA = "America/Argentina/Buenos_Aires";

export function aDatetimeLocal(iso: string) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return "";
  }
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";
  return `${valor("year")}-${valor("month")}-${valor("day")}T${valor("hour")}:${valor("minute")}`;
}

export function desdeDatetimeLocal(valor: string) {
  return `${valor}:00-03:00`;
}

export function formatearHorario(iso: string) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return iso;
  }
  return fecha.toLocaleString("es-AR", {
    timeZone: ZONA,
    dateStyle: "short",
    timeStyle: "short",
  });
}
