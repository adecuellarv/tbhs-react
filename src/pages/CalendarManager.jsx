import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceDayGridPlugin from "@fullcalendar/resource-daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { useDispatch, useSelector } from 'react-redux'
import { Plus, ChevronLeft, ChevronRight, Settings, PenIcon, Clock, User as UserIcon, MessageCircle, CircleDollarSign, Scissors } from 'lucide-react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'sonner';
import AppointmentModal from '../components/calendar/AddAppointmentModal';
import EditAppointmentModal from '../components/calendar/EditAppointmentModal';
import CalendarSelect from '../components/utils/CalendarSelect';
import { getEmployees, getAppoinments, getSchedule, getBankTerminals, updateAppointment } from '../api/calendar';
import { getClients } from '../api/clients';
import { getInitials, mapCitaToEvent, getScheduleDay, horas, VIEW_MAP, getClientById, onlyDigits, toMXPhone, buildWhatsAppUrl } from '../helpers/calendar';
import { setClientsList, setTerminals } from '../store/clientsSlice';

import 'dayjs/locale/es';

const CalendarManager = () => {
  const dispatch = useDispatch()
  const calendarRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);
  const [schedule, setSchedule] = useState({
    hora_inicio: '08:00:00',
    hora_fin: '20:00:00'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [selectHoraInicio, setSelectHoraInicio] = useState('');
  const [selectHoraFin, setSelectHoraFin] = useState('');
  const [typeCalendar, setTypeCalendar] = useState('day');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const clients = useSelector((state) => state?.appointment?.clients);
  //const [clients, setClients] = useState([]);

  const addEmployee = () => {
    const name = prompt('Nombre del empleado:');
    if (name) {
      const newEmployee = {
        id: Date.now().toString(),
        title: name,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      };
      setEmployees([...employees, newEmployee]);
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedSlot({
      resourceId: selectInfo.resource.id,
      start: selectInfo.start,
      end: selectInfo.end,
      employeeName: selectInfo.resource.title
    });
    setIsModalOpen(true);
  };

  const handleAppointmentSave = (value) => {
    const isoDay = date.startOf('day').format('YYYY-MM-DD');
    fetchEventsForDay(isoDay);

    if (value) {
      setIsEditModalOpen(false);
    }
  };

  const goto = (targetDayjs) => {
    const api = calendarRef.current?.getApi();
    if (!api || !targetDayjs) return;
    api.gotoDate(targetDayjs.toDate());
    setDate(targetDayjs);
  };

  const goToPrevious = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const current = dayjs(api.getDate());
    goto(current.subtract(1, 'day'));
  };

  const goToNext = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const current = dayjs(api.getDate());
    goto(current.add(1, 'day'));
  };

  const goToToday = () => {
    goto(dayjs());
  };

  const handlePickerChange = (newValue) => {
    if (!newValue) return;
    goto(newValue.startOf('day'));
  };

  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;

    // Si usas resources, intenta obtener el resource desde la API de FC
    const resource = ev.getResources?.()[0] ?? null;

    // Estructura que quieras guardar en tu state
    const eventData = {
      id: ev.id,
      title: ev.title,
      start: ev.start,            // Date
      end: ev.end,                // Date
      allDay: ev.allDay,
      // Si usas employee/recursos
      resourceId: resource?.id ?? ev.getResourceId?.() ?? null,
      employeeName: resource?.title ?? null,
      // Todo lo que hayas metido en extendedProps
      ...ev.extendedProps,
    };

    setSelectedEvent(eventData);

    // Si quieres reutilizar tu modal para “ver/editar” la cita, puedes setear selectedSlot
    setSelectedSlot({
      resourceId: eventData.resourceId,
      start: eventData.start,
      end: eventData.end,
      employeeName: eventData.employeeName,
      // puedes pasar más campos si tu modal los usa
      ...eventData,
    });

    setIsEditModalOpen(true);
  };

  const handleEventDrop = async (info) => {
    const ev = info.event;

    // Recurso/empleado destino (si usas resources)
    const resource = ev.getResources?.()[0] ?? null;

    // Construye el payload para tu backend
    const payload = {
      id: ev.id,
      start: dayjs(ev.start).format('YYYY-MM-DD HH:mm:ss'),
      end: ev.end ? dayjs(ev.end).format('YYYY-MM-DD HH:mm:ss') : null,
      resourceId: resource?.id ?? ev.getResourceId?.() ?? null,
    };

    // Llama a tu API. Si falla, revierte el drag.
    const ok = await updateAppointment(payload);
    if (!ok) {
      info.revert();
      return;
    } else {
      const isoDay = date.startOf('day').format('YYYY-MM-DD');
      fetchEventsForDay(isoDay);
      toast.success('Cita modificada')
    }
  };

  const handleEventResize = async (info) => {
    const ev = info.event;

    const payload = {
      id: ev.id,
      start: dayjs(ev.start).format('YYYY-MM-DD HH:mm:ss'),
      end: ev.end ? dayjs(ev.end).format('YYYY-MM-DD HH:mm:ss') : null,
      resourceId: ev.getResources?.()[0]?.id ?? ev.getResourceId?.() ?? null,
    };

    const ok = await updateAppointment(payload);
    if (!ok) {
      info.revert();
      return;
    } else {
      const isoDay = date.startOf('day').format('YYYY-MM-DD');
      fetchEventsForDay(isoDay);
      toast.success('Cita modificada')
    }

    //const visibleDay = dayjs(ev.start).startOf('day').format('YYYY-MM-DD');
    //fetchEventsForDay(visibleDay);
  };

  const handleSlotLaneMount = (arg) => {
    if (arg.isPast) {
      arg.el.classList.add('past-time-slot');
    }
  };

  const handleSaveSchedule = () => {
    if (selectHoraInicio && selectHoraFin) {
      setSchedule({
        hora_inicio: `${selectHoraInicio}:00`,
        hora_fin: `${selectHoraFin}:00`
      });
      setShowEditSchedule(false);
    }
  }

  const getClientInfo = (clienteId) => {
    const resp = clients?.find(i => Number(i?.id) === Number(clienteId));
    if (resp) return resp
  }

  const fetchEmployees = async (isoDay) => {
    const values = {
      fecha: isoDay
    }
    const resp = await getEmployees(values);

    if (resp?.empleados?.length) {
      const newArray = [];
      resp?.empleados.map(i => {
        const obj = {
          id: i.id_usuario,
          title: i.nombre,
          avatar: getInitials(i.nombre),
          foto: i.foto
        }
        newArray.push(obj);
      })
      setEmployees(newArray)
    }
  }

  const fetchEventsForDay = async (isoDay) => {
    try {
      const resp = await getAppoinments({ fecha: isoDay });
      const citas = resp?.citas ?? [];
      const events = citas.map(mapCitaToEvent);
      setEvents(events);
      setIsModalOpen(false);
    } catch (err) {
      setEvents([]);
    }
  };

  const fetchSchedule = async (isoDay) => {
    const resp = await getSchedule();
    const daysSchedule = resp ?? [];
    if (daysSchedule?.length) {
      const todaySch = getScheduleDay(isoDay, daysSchedule)
      if (todaySch) {
        setSchedule(todaySch);
        const horaInicioSinSegundos = todaySch.hora_inicio.split(":").slice(0, 2).join(":");
        const horaFinSinSegundos = todaySch.hora_fin.split(":").slice(0, 2).join(":");
        setSelectHoraInicio(horaInicioSinSegundos)
        setSelectHoraFin(horaFinSinSegundos)
      }
    }
  }

  const fetchClients = async () => {
    const resp = await getClients();
    const clientsList = resp ?? [];
    if (clientsList?.length) {
      const newArray = [];
      clientsList?.map(i => {
        const obj = {
          id: i?.id_cliente,
          name: i?.nombre?.toLowerCase(),
          email: i?.email,
          avatar: getInitials(i.nombre),
          phone: i?.telefono
        }

        newArray.push(obj)
      })
      dispatch(setClientsList(newArray))
    }
  }

  const fetchTerminals = async () => {
    const resp = await getBankTerminals();
    const list = resp ?? [];
    if (list?.length) {
      dispatch(setTerminals(list))
    }
  }

  useEffect(() => {
    if (date) {
      const isoDay = date.startOf('day').format('YYYY-MM-DD');
      fetchEmployees(isoDay);
      fetchEventsForDay(isoDay);
      fetchSchedule(isoDay);
    }
  }, [date]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    api.removeAllEvents();
    if (events?.length) {
      api.addEventSource(events);
    }
  }, [employees, events]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(VIEW_MAP[typeCalendar]);
  }, [typeCalendar]);

  useEffect(() => {
    fetchClients();
    fetchTerminals();
  }, []);


  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          {/* izquierda */}
          <div className="flex flex-wrap items-center gap-2">
            <CalendarSelect
              typeCalendar={typeCalendar}
              setTypeCalendar={setTypeCalendar}
            />

            <button onClick={goToPrevious} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* El DatePicker ocupa ancho completo en móvil */}
            <div className="min-w-[180px] sm:min-w-[220px] w-full sm:w-auto">
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                  label="Selecciona una fecha"
                  value={date}
                  onChange={handlePickerChange}
                  slotProps={{
                    textField: { fullWidth: true, size: 'small' }
                  }}
                  // Fuerza UI móvil bajo 640px
                  desktopModeMediaQuery="@media (min-width: 640px)"
                />
              </LocalizationProvider>
            </div>

            <button onClick={goToNext} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={goToToday}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Hoy
            </button>

            {!showEditSchedule ? (
              <div
                className="flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                onClick={() => setShowEditSchedule(true)}
              >
                <strong>Horario</strong> {schedule.hora_inicio} - {schedule.hora_fin}
                <PenIcon className="w-4 h-4 text-gray-500" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                  value={selectHoraInicio}
                  onChange={(e) => setSelectHoraInicio(e.target.value)}
                >
                  {horas.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                  value={selectHoraFin}
                  onChange={(e) => setSelectHoraFin(e.target.value)}
                >
                  {horas.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-blue-500 text-white px-3 sm:px-4 py-1 rounded-md text-sm"
                  onClick={handleSaveSchedule}
                >
                  Guardar
                </button>
              </div>
            )}
          </div>

          {/* derecha */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {false && (
              <button className="p-2 hover:bg-gray-100 rounded">
                <Settings className="w-4 h-4" />
              </button>
            )}
            {false && (
              <button
                onClick={addEmployee}
                className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6">
        <FullCalendar
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          ref={calendarRef}
          locale={esLocale}
          plugins={[resourceTimeGridPlugin, resourceDayGridPlugin, interactionPlugin]}
          initialView={VIEW_MAP[typeCalendar]}
          headerToolbar={false}
          resources={employees}
          events={events}

          // Selección que ya tienes
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}

          // Límites de horario
          slotMinTime={schedule.hora_inicio}
          slotMaxTime={schedule.hora_fin}
          slotDuration="00:15:00"
          height="calc(100vh - 120px)"
          resourceAreaHeaderContent="Empleados"
          resourceAreaWidth="200px"
          allDaySlot={false}

          // === HABILITAR DRAG/RESIZE ===
          editable={true}                 // permite arrastrar y redimensionar
          eventStartEditable={true}       // mover inicio/posición
          eventDurationEditable={true}    // cambiar duración
          eventResourceEditable={true}    // mover entre empleados (resources)
          droppable={false}               // si NO arrastras desde fuera
          longPressDelay={250}            // mejor UX en móvil

          // Handlers
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          nowIndicator={true}
          slotLaneDidMount={handleSlotLaneMount}

          // (Opcional) Reglas para permitir/denegar drop/resize
          eventAllow={(dropInfo, draggedEvent) => {
            const s = dayjs(dropInfo.start);
            // por si FullCalendar no manda end (raro con allDaySlot=false), asumimos 15 min
            const e = dropInfo.end ? dayjs(dropInfo.end) : s.add(15, 'minute');

            const [hInicio, mInicio] = schedule.hora_inicio.split(':').map(Number);
            const [hFin, mFin] = schedule.hora_fin.split(':').map(Number);

            const min = s.startOf('day').hour(hInicio).minute(mInicio).second(0);
            const max = s.startOf('day').hour(hFin).minute(mFin).second(0);

            const withinStart = s.isAfter(min) || s.isSame(min);
            const withinEnd = e.isBefore(max) || e.isSame(max);

            return withinStart && withinEnd;
          }}

          selectAllow={(selectInfo) => {
            const now = dayjs();
            const start = dayjs(selectInfo.start);
            return start.isAfter(now); // solo permite si la hora es después de ahora
          }}


          resourceLabelContent={(arg) => {
            return (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  {arg.resource.extendedProps.foto ?
                    <img className='rounded-full w-12 h-12' src={`/${arg.resource.extendedProps.foto}`} />
                    :
                    <span className="text-blue-600 font-semibold text-sm">
                      {arg.resource.extendedProps.avatar}
                    </span>
                  }
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {arg.resource.title}
                </span>
              </div>
            )
          }}
          eventContent={(arg) => {
            const { event, timeText } = arg || {};
            //const xp = event?.extendedProps || {};
            const client = getClientInfo(arg.event.extendedProps.id_cliente);
            //console.log('#client', client, arg.event.extendedProps)
            const phoneMX = client?.phone ? toMXPhone(client.phone) : null;
            const xp = arg.event.extendedProps;

            // Anticipo: asumo que viene como número en xp.anticipo o boolean xp.anticipo_pagado
            const anticipoMonto = xp?.anticipo?.monto_neto;
            const anticipoPagado = xp?.tiene_anticipo;

            const waHref = phoneMX
              ? buildWhatsAppUrl({
                phone: phoneMX,
                name: client?.name || client?.nombre || "",
                dateText: xp?.fecha ? xp.fecha : '',
                timeText,
                service: event?.title || "",
                descripcion: xp?.descripcion || ""
              })
              : null;

            return (
              <div className="group   shadow-sm transition-shadow p-2 text-[13px] leading-snug h-full" style={{borderLeft: '15px solid #67e8b8ff'}}>
                {/* Header: hora + badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>{timeText}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {anticipoPagado && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        {anticipoMonto ? `Anticipo $${anticipoMonto.toLocaleString()}` : "Anticipo pagado"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Servicio */}
                <div className="mt-1.5 flex items-start gap-1.5 ">
                  <Scissors className="w-4 h-4 mt-[2px] shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold">Servicio: </span>
                    <span className="truncate">
                      {event?.title}
                      {xp?.descripcion ? ` - ${xp.descripcion}` : ""}
                    </span>
                  </div>
                </div>

                {/* Cliente */}
                <div className="mt-1 flex items-start gap-1.5 ">
                  <UserIcon className="w-4 h-4 mt-[2px] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold">Cliente: </span>
                    <span className="truncate">{client?.name || client?.nombre || "—"}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-2 flex items-center gap-2">
                  {waHref ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100 active:scale-[0.98] transition"
                      onClick={(e) => e.stopPropagation()}
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-[12px] cursor-not-allowed">
                      <MessageCircle className="w-4 h-4" />
                      Sin teléfono
                    </span>
                  )}
                </div>
              </div>
            )
          }}
          eventClick={handleEventClick}
        />

      </div>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSlot(null);
          }}
          onSave={handleAppointmentSave}
          selectedSlot={selectedSlot}
          date={date}
        />
      )}

      {isEditModalOpen && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleAppointmentSave}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default CalendarManager;
