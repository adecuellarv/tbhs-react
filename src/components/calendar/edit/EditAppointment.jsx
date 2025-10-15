/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useState } from "react";
import { X, Clock, Calendar as CalendarIcon, UserCog, UserRound, Plus, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import durationPlugin from "dayjs/plugin/duration";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

// Reutilizamos tus componentes existentes:
import ClientSelection from "../steps/ClientSelection";
import AddClient from "../AddClient";

dayjs.locale("es");
dayjs.extend(localizedFormat);
dayjs.extend(durationPlugin);

const Label = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    {Icon ? <Icon className="w-4 h-4" /> : null}
    <span className="font-medium">{children}</span>
  </div>
);


export default function EditAppointment({
  isOpen,
  onClose,
  onSave,
  event,
  employees = [],
}) {
  const [submitting, setSubmitting] = useState(false);

  // -------- Iniciales de calendario --------
  const initialDate = useMemo(() => {
    if (!event) return null;
    const base = event?.extendedProps?.fecha
      ? dayjs(event.extendedProps.fecha, "YYYY-MM-DD")
      : dayjs(event.start);
    return base.isValid() ? base : null;
  }, [event]);

  const initialStart = useMemo(() => (event ? dayjs(event.start) : null), [event]);
  const initialEmployee = useMemo(
    () => (event?.resourceId ? String(event.resourceId) : ""),
    [event]
  );

  const tiempoMin = useMemo(() => {
    const t = Number(event?.extendedProps?.tiempo || 60);
    return Number.isFinite(t) ? t : 60;
  }, [event]);

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialStart);
  const [employeeId, setEmployeeId] = useState(initialEmployee);

  // -------- Cliente --------
  const initialClient = useMemo(() => {
    if (!event?.extendedProps?.id_cliente) return null;
    return { id: String(event.extendedProps.id_cliente) };
  }, [event]);

  const [selectedClient, setSelectedClient] = useState(initialClient);
  const [clientPanelOpen, setClientPanelOpen] = useState(false);
  const [addClientModal, setAddClientModal] = useState(false);

  // -------- Anticipos --------
  // Normalizamos a lista. Cada item puede traer id_anticipo (existente en DB).
  const initialAdvances = useMemo(() => {
    const a = event?.extendedProps?.anticipo;
    if (!a) return [];
    if (Array.isArray(a)) return a.map(x => ({ ...x, __state: "unchanged" }));
    return [{ ...a, __state: "unchanged" }]; // uno solo
  }, [event]);

  const [advances, setAdvances] = useState(initialAdvances);
  // helpers
  const addAdvance = () => {
    setAdvances(prev => [
      ...prev,
      {
        id_anticipo: null, // nuevo
        id_agenda: event?.extendedProps?.id_agenda || event?.id,
        monto_neto: "",
        tipo_pago: "1",
        comision: "0",
        status: "1",
        notas: "",
        fecha_anticipo: dayjs().format("YYYY-MM-DD"),
        __state: "new",
      },
    ]);
  };
  const removeAdvance = (idx) => {
    setAdvances(prev => {
      const c = [...prev];
      const item = c[idx];
      // Si es nuevo, lo quitamos; si existe en BD, lo marcamos como deleted
      if (item?.__state === "new") {
        c.splice(idx, 1);
      } else {
        c[idx] = { ...item, __state: "deleted" };
      }
      return c;
    });
  };
  const updateAdvanceField = (idx, field, value) => {
    setAdvances(prev => {
      const c = [...prev];
      const item = c[idx];
      const nextState =
        item.__state === "new" ? "new" : item.__state === "deleted" ? "deleted" : "updated";
      c[idx] = { ...item, [field]: value, __state: nextState };
      return c;
    });
  };

  // -------- Derivados de fecha/hora --------
  const startDateTime = useMemo(() => {
    if (!date || !time) return null;
    return dayjs(date)
      .hour(time.hour())
      .minute(time.minute())
      .second(0)
      .millisecond(0);
  }, [date, time]);

  const endDateTime = useMemo(() => {
    if (!startDateTime) return null;
    return startDateTime.add(tiempoMin, "minute");
  }, [startDateTime, tiempoMin]);

  const prettyDay = useMemo(() => {
    if (!date) return "";
    const s = dayjs(date).format("dddd D MMMM");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [date]);

  // -------- Efectos: reset si cambia el evento --------
  useEffect(() => {
    setDate(initialDate);
    setTime(initialStart);
    setEmployeeId(initialEmployee);
    setSelectedClient(initialClient);
    setAdvances(initialAdvances);
  }, [initialDate, initialStart, initialEmployee, initialClient, initialAdvances]);

  if (!isOpen || !event) return null;

  const { extendedProps = {} } = event;
  const servicio = extendedProps?.servicio || event?.title || "Servicio";
  const idAgenda = extendedProps?.id_agenda || event?.id;

  const handleSave = async () => {
    if (!startDateTime || !endDateTime || !employeeId || !selectedClient?.id) return;
    setSubmitting(true);
    try {
      // Partimos anticipos en 3 grupos para el backend:
      const advances_new = advances.filter(a => a.__state === "new" && a.__state !== "deleted")
        .map(({ __state, ...rest }) => rest);
      const advances_update = advances.filter(a => a.__state === "updated")
        .map(({ __state, ...rest }) => rest);
      const advances_delete = advances
        .filter(a => a.__state === "deleted" && a.id_anticipo)
        .map(a => a.id_anticipo);

      const payload = {
        id_agenda: idAgenda,
        date: startDateTime.format("YYYY-MM-DD"),
        startHour: startDateTime.format("HH:mm:ss"),
        endHour: endDateTime.format("HH:mm:ss"),
        tiempo: tiempoMin,
        id_usuario: employeeId,
        id_cliente: selectedClient.id, // EDITADO
        id_servicios_empresa: extendedProps?.id_servicios_empresa,
        servicio,
        descripcion: extendedProps?.descripcion,
        // Anticipos (CRUD)
        advances_new,
        advances_update,
        advances_delete,
      };

      onSave?.(payload);
      onClose?.();
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al actualizar la cita.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 opacity-[.6]"
        onClick={onClose}
      />

      {/* Panel principal */}
      <div
        className={`fixed top-[50px] right-0 h-full w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-gray-500">Editar cita</div>
              <div className="text-lg font-semibold text-gray-800">{servicio}</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <Label icon={CalendarIcon}>{prettyDay}</Label>
              <div className="text-xs text-blue-700">#{idAgenda}</div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <Label icon={Clock}>
                {startDateTime && endDateTime
                  ? `${startDateTime.format("HH:mm")} - ${endDateTime.format("HH:mm")}`
                  : "--:--"}
              </Label>
              <div className="text-xs text-blue-700">{tiempoMin} min</div>
            </div>
   
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6 h-[calc(100%-160px)] overflow-y-auto">
          {/* Cliente */}
          <div className="space-y-2">
            <Label icon={UserRound}>Cliente</Label>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-800">
                {selectedClient?.name
                  ? `${selectedClient.name} (ID: ${selectedClient.id})`
                  : selectedClient?.id
                    ? `ID: ${selectedClient.id}`
                    : "Sin cliente"}
              </div>
              <button
                className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setClientPanelOpen(true);
                  setAddClientModal(false);
                }}
              >
                Cambiar cliente
              </button>
            </div>
          </div>

          {/* Editar calendario */}
          <div className="space-y-2 flex gap-2">
            <div className="">
              <Label icon={CalendarIcon}>Editar calendario</Label>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                  value={date}
                  onChange={(val) => setDate(val)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
              <p className="text-xs text-gray-500">Cambia el <b>día</b> de la cita.</p>
            </div>

            {/* Editar hora */}
            <div className="w-[40%]">
              <Label icon={Clock}>Editar hora</Label>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <TimePicker
                  ampm={false}
                  value={time}
                  onChange={(val) => setTime(val)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
              <p className="text-xs text-gray-500">
                Ajusta la <b>hora de inicio</b>. El fin se calcula con la duración ({tiempoMin} min).
              </p>
            </div>
          </div>
          {/* Editar empleado */}
          <div className="space-y-2">
            <Label icon={UserCog}>Editar empleado</Label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="" disabled>Selecciona un empleado</option>
              {employees.map(emp => (
                <option key={emp.id} value={String(emp.id)}>{emp.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Cambia el <b>recurso</b> (empleado) asignado.</p>
          </div>

          {/* Anticipos */}
      
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || !startDateTime || !endDateTime || !employeeId || !selectedClient?.id}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Panel de cliente (reutiliza tus componentes) */}
      {clientPanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-[60] opacity-[.6]"
            onClick={() => setClientPanelOpen(false)}
          />
          <div className="fixed top-[50px] right-0 h-full w-[560px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b">
              <Label icon={UserRound}>Seleccionar cliente</Label>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => setAddClientModal(v => !v)}
                >
                  {addClientModal ? "Buscar existentes" : "Nuevo cliente"}
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setClientPanelOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
              {!addClientModal ? (
                <ClientSelection
                  onClientSelect={(client) => {
                    setSelectedClient(client); // espera { id, name, ...}
                    setClientPanelOpen(false);
                  }}
                  selectedClient={selectedClient}
                  setAddClient={setAddClientModal}
                />
              ) : (
                <div className="p-2">
                  <AddClient
                    back={() => setAddClientModal(false)}
                    setSelectedClient={(client) => {
                      setSelectedClient(client);
                      setClientPanelOpen(false);
                      setAddClientModal(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
