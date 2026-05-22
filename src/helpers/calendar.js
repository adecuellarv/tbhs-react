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

export const APPOINTMENT_STATUS_LABELS = {
  4: 'Espera',
  5: 'Vigente',
  6: 'Cancelado',
  7: 'Pagado',
};

export const APPOINTMENT_STATUS_STYLES = {
  4: 'bg-amber-100 text-amber-800 border-amber-200',
  5: 'bg-blue-100 text-blue-800 border-blue-200',
  6: 'bg-red-100 text-red-800 border-red-200',
  7: 'bg-green-100 text-green-800 border-green-200',
};

export const getAppointmentStatusId = (appointment) => Number(appointment?.id_estatus);

export const getAppointmentStatusLabel = (appointment) =>
  APPOINTMENT_STATUS_LABELS[getAppointmentStatusId(appointment)] || 'Sin estatus';

export const getAppointmentStatusClassName = (appointment) =>
  APPOINTMENT_STATUS_STYLES[getAppointmentStatusId(appointment)] || 'bg-gray-100 text-gray-700 border-gray-200';

export const isPaidAppointment = (appointment) => getAppointmentStatusId(appointment) === 7;

const paletteFor = (cita) => {
  if (isPaidAppointment(cita)) {
    return { bg: '#16a34a', border: '#15803d', color: '#fff' };
  }

  return cita?.tiene_anticipo
    ? { bg: '#648ab5ff', border: '#1653a3ff', color: '#000' }
    : { bg: '#165874', border: '#4c7d92', color: '#fff ' };
};

export const mapCitaToEvent = (c) => {
  const start = dayjs(`${c.fecha}T${c.hora}`);
  const minutes = Number(c.tiempo ?? 60);
  const end = start.add(isNaN(minutes) ? 60 : minutes, 'minute');

  const servicioTexto =
    (c.servicio && c.servicio.trim()) ||
    (c.descripcion && c.descripcion.trim()) ||
    'Servicio';

  const { bg, border, color } = paletteFor(c);
  const isPaid = isPaidAppointment(c);

  return {
    id: String(c.id_agenda),
    resourceId: String(c.id_usuario),
    title: servicioTexto,
    start: start.format('YYYY-MM-DDTHH:mm:ss'),
    end: end.format('YYYY-MM-DDTHH:mm:ss'),
    backgroundColor: bg,
    borderColor: border,
    textColor: color,
    editable: !isPaid,
    startEditable: !isPaid,
    durationEditable: !isPaid,
    resourceEditable: !isPaid,

    extendedProps: {
      ...{ tiene_anticipo: Boolean(c.tiene_anticipo) },
      id_estatus: getAppointmentStatusId(c),
      ...c
    }
  };
};

export const getScheduleDay = (fechaStr, horarios) => {
  if (!fechaStr) return null;

  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day); // local time

  let diaSemana = fecha.getDay(); // 0-6 (domingo=0)
  diaSemana = diaSemana === 0 ? 7 : diaSemana; // lunes=1 ... domingo=7

  const horario = horarios.find(h => Number(h.dia) === diaSemana);

  if (!horario) return null;

  return {
    hora_inicio: horario.hora_e,
    hora_fin: horario.hora_s
  };
};


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

export const getClientById = (clients, id) => clients?.find(c => c?.id === id);
export const onlyDigits = (str = "") => (str || "").replace(/\D+/g, "");
export const toMXPhone = (raw) => {
  const lada = onlyDigits(raw?.lada || "52");
  const telefono = onlyDigits(raw?.phone || "");

  return `${lada}${telefono}`;
};
export const buildWhatsAppUrl = ({ phone, name, dateText, timeText, service, descripcion }) => {
  const base = "https://wa.me/";
  const text = `Hola ${name || ""}, te escribimos para tu cita del ${dateText} a las ${timeText} (${service}${descripcion ? " - " + descripcion : ""}).`;
  return `${base}${phone}?text=${encodeURIComponent(text)}`;
};

export const getClientInfo = (clienteId, clients) => {
  const resp = clients?.find(i => Number(i?.id) === Number(clienteId));
  if (resp) return resp
}

export const handleSlotLaneMount = (arg) => {
  if (arg.isPast) {
    arg.el.classList.add('past-time-slot');
  }
};

export const mergeDefined = (target, source) => {
  if (!source) return target;
  const out = { ...target };

  Object.keys(source).forEach((k) => {
    const v = source[k];
    // solo actualiza si el backend mandó la llave (incluye null si viene explícito)
    if (v !== undefined) out[k] = v;
  });

  return out;
};

export const normalizeToISOZ = (value) => {
  if (!value) return value;
 
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) return value;

  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toISOString();
};

export const overlaps = (aStart, aEnd, bStart, bEnd) => {
  const aS = dayjs(aStart);
  const aE = dayjs(aEnd);
  const bS = dayjs(bStart);
  const bE = dayjs(bEnd);
  return aS.isBefore(bE) && aE.isAfter(bS); // overlap real
};

export const isBlockedByPermiso = (resourceId, start, end, employees) => {
  const emp = employees.find(e => String(e.id) === String(resourceId));
  if (!emp?.permisos?.length) return false;

  return emp.permisos.some(p =>
    overlaps(start, end, p.start, p.end)
  );
};
