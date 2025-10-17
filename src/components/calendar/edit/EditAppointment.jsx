/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useState } from "react";
import { X, Clock, Calendar as CalendarIcon, UserCog, UserRound } from "lucide-react";
import { Select, message, TreeSelect } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import durationPlugin from "dayjs/plugin/duration";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import ClientSelection from "../steps/ClientSelection";
import AddClient from "../AddClient";
import { getClientInfo } from "../../../helpers/calendar";
import { editAppointmentFull } from "../../../api/calendar";
import { getServices } from "../../../api/services";


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
  event,
  employees,
  clients,
  handleSave
}) {
  const [submitting, setSubmitting] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [currentService, setCurrentService] = useState();

  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPanelOpen, setClientPanelOpen] = useState(false);
  const [addClientModal, setAddClientModal] = useState(false);

  if (!isOpen || !event) return null;

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

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialStart);
  const [employeeId, setEmployeeId] = useState(initialEmployee);

  const tiempoMin = useMemo(() => {
    const t = Number(event?.extendedProps?.tiempo || 60);
    return Number.isFinite(t) ? t : 60;
  }, [event]);


  const { extendedProps = {} } = event;
  const servicio = extendedProps?.servicio || event?.title || "Servicio";
  const idAgenda = extendedProps?.id_agenda || event?.id;

  const handleUpdate = async () => {
    if (!startDateTime || !endDateTime || !employeeId || !selectedClient?.id) return;
    setSubmitting(true);

    try {
      const payload = {
        id: idAgenda,
        fecha: startDateTime.format("YYYY-MM-DD"),
        hora: startDateTime.format("HH:mm:ss"),
        tiempo: tiempoMin,
        id_usuario: employeeId,
        id_cliente: selectedClient.id,
        id_servicio: currentService?.id_servicios_empresa ? currentService?.id_servicios_empresa : currentService,
        observaciones: extendedProps?.descripcion,
      };

      const ok = await editAppointmentFull(payload);

      if (ok) {
        //onSave?.(payload);
        //onClose?.();
        message.success("Cita actualizada con exito");

        setTimeout(() => {
          onClose?.();
        }, 600);
      }
    } catch (e) {
      console.error(e);
      message.error("Ocurrió un error al actualizar la cita.");
    } finally {
      setSubmitting(false);
      handleSave();
    }
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

  const fetchServices = async () => {
    const resp = await getServices();
    if (resp?.length) {
      const newArray = [];

      resp.map(i => {
        if (i?.services?.length) {
          i?.services?.map(k => {
            newArray.push(k);
          })
        }
      })
      setServiceCategories(newArray)
    }
  }

  // -------- Efectos: reset si cambia el evento --------
  useEffect(() => {
    setDate(initialDate);
    setTime(initialStart);
    //setEmployeeId(initialEmployee);
    //setSelectedClient(initialClient);
    //setAdvances(initialAdvances);
  }, [initialDate, initialStart]);

  useEffect(() => {
    if (event?.id_cliente && clients?.length) {
      const clientInfo = getClientInfo(event?.id_cliente, clients)
      if (clientInfo) setSelectedClient(clientInfo)
    }
  }, [clients, event]);

  useEffect(() => {
    if (serviceCategories?.length) {
      const resp = serviceCategories.find(i => i?.id_servicios_empresa === event?.id_servicios_empresa);

      setCurrentService(resp);
    }
  }, [serviceCategories]);

  useEffect(() => {
    fetchServices();
  }, [])

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
        <div className="p-6 space-y-6 overflow-y-auto" style={{ height: 'calc(100vh - 299px)' }}>
          {/* Cliente */}
          <div className="space-y-2">
            <Label icon={UserRound}>Cliente</Label>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-800 font-bold">
                {selectedClient?.name
                  ? `${selectedClient.name}`
                  : selectedClient?.id
                    ? `ID: ${selectedClient.id}`
                    : "Sin cliente"}
              </div>
              <button
                className="text-sm px-3 py-1.5 rounded-md bg-gray-300  hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setClientPanelOpen(true);
                  setAddClientModal(false);
                }}
              >
                Cambiar cliente
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label icon={UserCog}>Editar servicio</Label>
            <Select
              showSearch
              placeholder="Selecciona un servicio"
              optionFilterProp="children"
              value={currentService}
              onChange={(value) => setCurrentService(value)}
              size="large"
              style={{ width: '100%' }}
            >
              <Select.Option value="" disabled>
                Selecciona un servicio
              </Select.Option>

              {serviceCategories.map(serv => (
                <Select.Option
                  key={serv.id_servicios_empresa}
                  value={serv.id_servicios_empresa}
                >
                  {serv.descripcion} — {serv.subfamilia_nombre}
                </Select.Option>
              ))}
            </Select>

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
            <Select
              value={employeeId}
              onChange={(e) => setEmployeeId(e)}
              size="large"
              style={{ width: '100%' }}
            >
              <Select.Option value="" disabled>Selecciona un empleado</Select.Option>
              {employees.map(emp => (
                <Select.Option key={emp.id} value={emp.id}>{emp.title}</Select.Option>
              ))}
            </Select>
          </div>

          {/* Anticipos */}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            disabled={submitting || !startDateTime || !endDateTime || !employeeId || !selectedClient?.id}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
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
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Label icon={UserRound}>Seleccionar cliente</Label>
              <div className="flex items-center gap-2">

                <button
                  className="p-2 flex gap-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  onClick={() => setClientPanelOpen(false)}
                >
                  Cancelar <X className="w-5 h-6" />
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
