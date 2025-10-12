import dayjs from 'dayjs';
import 'dayjs/locale/es';

export const getInitials = (fullName = '') => {
  const name = String(fullName || '').trim();
  if (!name) return '';

  const clean = (s) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-zÑñ\u00C0-\u024F]/g, '');

  const parts = name.split(/\s+/).filter(Boolean);
  const stopwords = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'do', 'dos', 'van', 'von', 'san', 'santa']);

  if (parts.length === 1) {
    const p = clean(parts[0]);
    return p.slice(0, 2).toUpperCase();
  }

  const first = clean(parts[0]);

  let lastIdx = parts.length - 1;
  while (lastIdx > 0 && stopwords.has(parts[lastIdx].toLowerCase())) {
    lastIdx--;
  }
  const last = clean(parts[lastIdx]);

  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

const paletteFor = (cita) => {
  return cita?.tiene_anticipo
    ? { bg: '#bbf7d0', border: '#16a34a' }
    : { bg: '#a5b4fc', border: '#6366f1' };
};

export const mapCitaToEvent = (c) => {
  const start = dayjs(`${c.fecha}T${c.hora}`);
  const minutes = Number(c.tiempo ?? 60);
  const end = start.add(isNaN(minutes) ? 60 : minutes, 'minute');

  const servicioTexto =
    (c.servicio && c.servicio.trim()) ||
    (c.descripcion && c.descripcion.trim()) ||
    'Servicio';

  const { bg, border } = paletteFor(c);

  return {
    id: String(c.id_agenda),
    resourceId: String(c.id_usuario),
    title: servicioTexto,
    start: start.format('YYYY-MM-DDTHH:mm:ss'),
    end: end.format('YYYY-MM-DDTHH:mm:ss'),
    backgroundColor: bg,
    borderColor: border,

    extendedProps: {
      ...{tiene_anticipo: Boolean(c.tiene_anticipo)},
      ...c
    }
  };
};

export const getScheduleDay = (fechaStr, horarios) => {

  const fecha = new Date(fechaStr);
  let diaSemana = fecha.getDay();
  diaSemana = diaSemana === 0 ? 7 : diaSemana;

  const horario = horarios.find(h => parseInt(h.dia) === diaSemana);

  if (!horario) {
    return null;
  }

  return {
    hora_inicio: horario.hora_e,
    hora_fin: horario.hora_s
  };
}

export const horas = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

export const VIEW_MAP = {
  day: "resourceTimeGridDay",
  week: "resourceTimeGridWeek",
  month: "resourceDayGridMonth",
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (date, format) => {
  const d = dayjs(date).locale('es');
  return d.startOf('day').format(format);
}