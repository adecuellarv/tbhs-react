import { useState, useRef, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceDayGridPlugin from "@fullcalendar/resource-daygrid";
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from "@fullcalendar/core/locales/es";
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppointmentModal from '../components/calendar/AddAppointmentModal';
import EditView from '../components/calendar/edit/EditView';
import CalendarEmployeHeader from '../components/calendar/CalendarEmployeHeader';
import CalendarDetailEvent from '../components/calendar/CalendarDetailEvent';
import CalendarHeader from '../components/calendar/CalendarHeader';
import { getEmployees, getAppoinments, getSchedule, getBankTerminals, updateAppointment } from '../api/calendar';
import { getClients } from '../api/clients';
import { getInitials, mapCitaToEvent, getScheduleDay, horas, VIEW_MAP, handleSlotLaneMount, isBlockedByPermiso, isPaidAppointment } from '../helpers/calendar';
import { setClientsList, setTerminals, setEmployees, setEvent, setDateCalendar, setOpenModalEdit, setEvents } from '../store/clientsSlice';
import { useDriverTour } from '../hooks/useDriverTour';
import { TOUR } from '../constans/tour';

import 'dayjs/locale/es';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [query]);

  return matches;
}

const CalendarManager = () => {
  const dispatch = useDispatch()
  const calendarRef = useRef(null);
  //const [employees, setEmployees] = useState([]);
  //const [events, setEvents] = useState([]);
  const [schedule, setSchedule] = useState({
    hora_inicio: '08:00:00',
    hora_fin: '20:00:00'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [eventsCalendar, setEventsCalendar] = useState([]);
  const [selectHoraInicio, setSelectHoraInicio] = useState('');
  const [selectHoraFin, setSelectHoraFin] = useState('');
  const [typeCalendar, setTypeCalendar] = useState('day');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [employeePage, setEmployeePage] = useState(0);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('all');
  const clients = useSelector((state) => state?.appointment?.clients);
  const employees = useSelector((state) => state?.appointment?.employees);
  const openModalEdit = useSelector((state) => state?.appointment?.openModalEdit);
  const events = useSelector((state) => state?.appointment?.events);
  //const steps = useMemo(() => (TOUR), []);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const [mobileEmployeeId, setMobileEmployeeId] = useState(null);

  const responsiveView = useMemo(() => {
    if (isMobile) return 'timeGridDay';
    return VIEW_MAP[typeCalendar];
  }, [isMobile, typeCalendar]);

  const calendarHeight = useMemo(() => {
    if (isMobile) return 'auto';
    return 'calc(100vh - 120px)';
  }, [isMobile]);

  const resourceAreaWidth = useMemo(() => {
    if (isMobile) return '0px';
    if (isTablet) return '150px';
    return '200px';
  }, [isMobile, isTablet]);

  const employeePageSize = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 4;
    return 6;
  }, [isMobile, isTablet]);

  const totalEmployeePages = useMemo(() => {
    return Math.max(1, Math.ceil((employees?.length || 0) / employeePageSize));
  }, [employees, employeePageSize]);

  const resourcesForCalendar = useMemo(() => {
    if (!isMobile && selectedEmployeeFilter !== 'all') {
      return employees.filter(e => String(e.id) === String(selectedEmployeeFilter));
    }

    const start = employeePage * employeePageSize;
    if (!isMobile) return employees.slice(start, start + employeePageSize);
    if (!mobileEmployeeId) return [];
    return employees.filter(e => String(e.id) === String(mobileEmployeeId));
  }, [isMobile, employees, mobileEmployeeId, employeePage, employeePageSize, selectedEmployeeFilter]);

  const employeeRangeText = useMemo(() => {
    if (!employees?.length) return '0 de 0';
    const start = employeePage * employeePageSize + 1;
    const end = Math.min(employees.length, (employeePage + 1) * employeePageSize);
    return `${start}-${end} de ${employees.length}`;
  }, [employees, employeePage, employeePageSize]);

  const goToPreviousEmployees = () => {
    setEmployeePage((page) => Math.max(0, page - 1));
  };

  const goToNextEmployees = () => {
    setEmployeePage((page) => Math.min(totalEmployeePages - 1, page + 1));
  };

  useEffect(() => {
    if (isMobile && employees?.length && !mobileEmployeeId) {
      setMobileEmployeeId(String(employees[0].id));
    }
  }, [isMobile, employees, mobileEmployeeId]);

  useEffect(() => {
    setEmployeePage((page) => Math.min(page, totalEmployeePages - 1));
  }, [totalEmployeePages]);

  useEffect(() => {
    setEmployeePage(0);
  }, [selectedEmployeeFilter]);

  /*const { start } = useDriverTour(steps, {
    runOnMount: true,
    storageKey: 'tour_home_v1_seen',
  });*/
  //const [clients, setClients] = useState([]);

  const addEmployee = () => {
    const name = prompt('Nombre del empleado:');
    if (name) {
      const newEmployee = {
        id: Date.now().toString(),
        title: name,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      };
      //dispatch(setEmployees([...employees, newEmployee]));
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedSlot({
      resourceId: selectInfo.resource?.id,
      start: selectInfo.start,
      end: selectInfo.end,
      employeeName: selectInfo.resource?.title
    });
    setIsModalOpen(true);
  };

  const handleAppointmentSave = (value) => {
    const isoDay = date.startOf('day').format('YYYY-MM-DD');
    fetchEventsForDay(isoDay);

    /*if (value) {
      setIsEditModalOpen(false);
      dispatch(setOpenModalEdit(false))
    }*/
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
    const nextDate = dayjs(newValue);
    if (!nextDate.isValid()) return;
    goto(nextDate.startOf('day'));
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
    dispatch(setEvent(eventData))

    // Si quieres reutilizar tu modal para “ver/editar” la cita, puedes setear selectedSlot
    setSelectedSlot({
      resourceId: eventData.resourceId,
      start: eventData.start,
      end: eventData.end,
      employeeName: eventData.employeeName,
      // puedes pasar más campos si tu modal los usa
      ...eventData,
    });

    dispatch(setOpenModalEdit(true))
  };

  const handleEventDrop = async (info) => {
    const ev = info.event;
    if (isPaidAppointment(ev.extendedProps)) {
      info.revert();
      toast.error('La cita pagada no se puede editar');
      return;
    }

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
    if (isPaidAppointment(ev.extendedProps)) {
      info.revert();
      toast.error('La cita pagada no se puede editar');
      return;
    }

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
          foto: i.foto,
          permisos: i.permisos ?? [],
        }
        newArray.push(obj);
      })

      dispatch(setEmployees(newArray))
    }
  }

  const fetchEventsForDay = async (isoDay, employeeId = null) => {
    try {
      const resp = await getAppoinments({ fecha: isoDay, empleado: employeeId });
      const citas = resp?.citas ?? [];
      const eventsList = citas.map(mapCitaToEvent);
      dispatch(setEvents(eventsList));
      setIsModalOpen(false);
    } catch (e) {
      console.log(e)
      dispatch(setEvents([]));
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
          lada: i?.lada,
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
      dispatch(setDateCalendar(isoDay))
    }
  }, [date]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    api.removeAllEvents();
    if (eventsCalendar?.length) {
      api.addEventSource(eventsCalendar);
    }
  }, [employees, eventsCalendar]);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(responsiveView);
  }, [responsiveView]);

  useEffect(() => {
    if(!isMobile){
      setEventsCalendar(events);
    } else {
      const filter = events?.filter(i => Number(i?.extendedProps?.id_usuario) === Number(mobileEmployeeId));
      setEventsCalendar(filter);
    }
  }, [events, isMobile, mobileEmployeeId])

  useEffect(() => {
    fetchClients();
    fetchTerminals();
  }, []);

  useEffect(() => {
    const onCart = (e) => {
        handleAppointmentSave();
    };

    window.addEventListener('tbhs:cart', onCart);
    return () => window.removeEventListener('tbhs:cart', onCart);
  }, []);


  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <CalendarHeader
        typeCalendar={typeCalendar}
        setTypeCalendar={setTypeCalendar}
        goToPrevious={goToPrevious}
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
        //start={start}
        addEmployee={addEmployee}
      />

      {isMobile && (
        <div className="px-3 pt-3">
          <select
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm"
            value={mobileEmployeeId ?? ''}
            onChange={(e) => setMobileEmployeeId(e.target.value)}
          >
            {employees?.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Calendar */}
      <div
        className="flex-1 p-2 sm:p-4 lg:p-6"
        data-tour="calendar"
      >
        {!isMobile && (
          <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
            <select
              className="h-8 min-w-[220px] rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-400"
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
            >
              <option value="all">Todos los empleados</option>
              {employees?.map((employee) => (
                <option key={employee.id} value={String(employee.id)}>
                  {employee.title}
                </option>
              ))}
            </select>

            {selectedEmployeeFilter === 'all' && employees.length > employeePageSize && (
              <>
                <button
                  type="button"
                  onClick={goToPreviousEmployees}
                  disabled={employeePage === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Empleados anteriores"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[130px] text-center text-sm font-medium text-gray-600">
                  Empleados {employeeRangeText}
                </span>
                <button
                  type="button"
                  onClick={goToNextEmployees}
                  disabled={employeePage >= totalEmployeePages - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Siguientes empleados"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
        <FullCalendar
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          ref={calendarRef}
          locale={esLocale}
          plugins={[resourceTimeGridPlugin, resourceDayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView={responsiveView}
          headerToolbar={false}
          resources={resourcesForCalendar}
          events={eventsCalendar}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}

          // Límites de horario
          slotMinTime={schedule.hora_inicio}
          slotMaxTime={schedule.hora_fin}
          slotDuration="00:15:00"
          height={calendarHeight}
          resourceAreaHeaderContent={isMobile ? '' : 'Empleados'}
          resourceAreaWidth={resourceAreaWidth}
          allDaySlot={false}

          // === HABILITAR DRAG/RESIZE ===
          editable={true}                 // permite arrastrar y redimensionar
          eventStartEditable={true}       // mover inicio/posición
          eventDurationEditable={true}    // cambiar duración
          eventResourceEditable={true}    // mover entre empleados (resources)
          droppable={false}               // si NO arrastras desde fuera
          longPressDelay={isMobile ? 120 : 250}            // mejor UX en móvil

          // Handlers
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          nowIndicator={true}
          slotLaneDidMount={handleSlotLaneMount}

          // (Opcional) Reglas para permitir/denegar drop/resize
          eventAllow={(dropInfo, draggedEvent) => {
            if (isPaidAppointment(draggedEvent?.extendedProps)) return false;

            const s = dayjs(dropInfo.start);
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
            const resourceId = selectInfo.resource?.id;
            const start = selectInfo.start;
            const end = selectInfo.end ?? dayjs(selectInfo.start).add(15, 'minute').toDate();

            // (tu regla actual de "después de ahora")
            if (!dayjs(start).isAfter(dayjs())) return false;

            // bloqueo por permisos
            if (isBlockedByPermiso(resourceId, start, end, employees)) return false;

            return true;
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

      {openModalEdit && (
        <EditView />
      )}
    </div>
  );
};

export default CalendarManager;
