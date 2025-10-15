import { useState, useRef, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceDayGridPlugin from "@fullcalendar/resource-daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast } from 'sonner';
import AppointmentModal from '../components/calendar/AddAppointmentModal';
import EditAppointmentModal from '../components/calendar/EditAppointmentModal';
import CalendarEmployeHeader from '../components/calendar/CalendarEmployeHeader';
import CalendarDetailEvent from '../components/calendar/CalendarDetailEvent';
import CalendarHeader from '../components/calendar/CalendarHeader';
import { getEmployees, getAppoinments, getSchedule, getBankTerminals, updateAppointment } from '../api/calendar';
import { getClients } from '../api/clients';
import { getInitials, mapCitaToEvent, getScheduleDay, horas, VIEW_MAP, handleSlotLaneMount } from '../helpers/calendar';
import { setClientsList, setTerminals } from '../store/clientsSlice';
import { useDriverTour } from '../hooks/useDriverTour';
import { TOUR } from '../constans/tour';

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
  const steps = useMemo(() => (TOUR), []);

  const { start } = useDriverTour(steps, {
    runOnMount: true,
    storageKey: 'tour_home_v1_seen',
  });
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

  const handleSaveSchedule = () => {
    if (selectHoraInicio && selectHoraFin) {
      setSchedule({
        hora_inicio: `${selectHoraInicio}:00`,
        hora_fin: `${selectHoraFin}:00`
      });
      setShowEditSchedule(false);
    }
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
      <CalendarHeader
        typeCalendar={typeCalendar}
        setTypeCalendar={setTypeCalendar}
        goToPrevious={goToPrevious}
        AdapterDayjs={AdapterDayjs}
        date={date}
        handlePickerChange={handlePickerChange}
        goToNext={goToNext}
        goToToday={goToToday}
        showEditSchedule={showEditSchedule}
        setShowEditSchedule={setShowEditSchedule}
        schedule={schedule}
        selectHoraInicio={selectHoraInicio}
        setSelectHoraInicio={setSelectHoraInicio}
        horas={horas}
        selectHoraFin={selectHoraFin}
        setSelectHoraFin={setSelectHoraFin}
        handleSaveSchedule={handleSaveSchedule}
        start={start}
        addEmployee={addEmployee}
      />

      {/* Calendar */}
      <div className="flex-1 p-6" data-tour="calendar">
        <FullCalendar
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          ref={calendarRef}
          locale={esLocale}
          plugins={[resourceTimeGridPlugin, resourceDayGridPlugin, interactionPlugin]}
          initialView={VIEW_MAP[typeCalendar]}
          headerToolbar={false}
          resources={employees}
          events={events}
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
              <CalendarEmployeHeader arg={arg} />
            )
          }}
          eventContent={(arg) => {


            return (
              <CalendarDetailEvent
                arg={arg}
                clients={clients}
              />
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
