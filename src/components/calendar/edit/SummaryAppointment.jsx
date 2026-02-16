import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingBasket, User, Trash2, Wallet, PlusIcon } from 'lucide-react';
import { Button, Modal } from 'antd';
import { toast } from "react-hot-toast"
import AnticiposForm from './AnticiposForm';
import { deleteApointment, deleteAdvance, getAppoinments } from '../../../api/calendar';
import { setEvents, setEvent, setOpenModalEdit } from "../../../store/clientsSlice";
import { mapCitaToEvent, mergeDefined, normalizeToISOZ } from '../../../helpers/calendar';

const SummaryAppointment = ({
  selectedClient,
  selectedServices,
  advanceAmount,
  setAdvanceAmount,
  services,
  event }) => {
  const dispatch = useDispatch()
  const total = services.reduce((sum, service) => sum + Number(service.costo), 0);
  const [open, setOpen] = useState(false);
  const [openDeleteAnticipo, setOpenDeleteAnticipo] = useState(false);
  const [openAddAnticipo, setOpenAddAnticipo] = useState(false);
  const [selectedAnticipo, setSelectedAnticipo] = useState(null);
  const dateCalendar = useSelector((state) => state?.appointment?.dateCalendar);
  const events = useSelector((state) => state?.appointment?.events);

  const refreshCalendarData = async () => {
    try {
      const resp = await getAppoinments({ fecha: dateCalendar });
      const citas = resp?.citas ?? [];
      const events = citas.map(mapCitaToEvent);
      dispatch(setEvents(events));
    } catch (e) {
      console.log(e)
      dispatch(setEvents([]));
    }
  }

  const refreshEvent = (eventsUpdate) => {
    if (!event?.id_agenda) return;

    const currentId = String(event.id_agenda);

    const fresh = eventsUpdate.find(
      (c) => String(c?.extendedProps?.id_agenda) === currentId
    );

    if (!fresh) return;

    const patch = {
      ...fresh.extendedProps,
      id: fresh.id,
      title: fresh.title,
      resourceId: fresh.resourceId,
      start: normalizeToISOZ(fresh.start),
      end: normalizeToISOZ(fresh.end),
    };

    const nextEvent = mergeDefined(event, patch);
    dispatch(setEvent(nextEvent));
  };

  const handleDelete = async () => {
    const values = {
      id: services[0].id
    };

    const resp = await deleteApointment(values)
    if (resp) {
      toast.success('Cita eliminada');
      setOpen(false)
      dispatch(setOpenModalEdit(false))
      refreshCalendarData();
    }
  };

  const handleRemoveAnticipo = async () => {
    const values = {
      id: selectedAnticipo?.id_anticipo,
      id_agendas_grupo: event?.id_agendas_grupo,
      id_agenda_actual: event?.id_agenda
    };

    const resp = await deleteAdvance(values)
    if (resp) {
      toast.success('Anticipo eliminado');
      setOpenDeleteAnticipo(false)
      setOpen(false)
      setAdvanceAmount(0)
      refreshCalendarData();
    }
  }

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (events?.length) {
      refreshEvent(events);
    }
  }, [events]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-4">Pasos Agenda</h3>
      </div>

      <div className="space-y-3">
        {selectedClient && (
          <button
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-[#165874] font-semibold"><User /></span>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-500">Cliente: </div>
              <div className="font-medium capitalize">{selectedClient.name}</div>
            </div>
          </button>
        )}

        {!!selectedServices?.length && (
          <button
            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-[#165874] font-semibold"><ShoppingBasket /></span>
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-2">Servicios:</div>

                {/* Chips con botón de eliminar */}
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((item, idx) => {
                    const id = item?.id ?? item?.id_servicios_empresa ?? idx;
                    const name = item?.descripcion ?? item?.descripcion ?? `Servicio ${idx + 1}`;
                    const serviceDescription = item?.serviceDescription ? item?.serviceDescription : '';
                    return (
                      <div
                        key={id}
                        className="group inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-sm  hover:bg-gray-100"
                      >
                        <span className="capitalize">{name} - {serviceDescription}</span>



                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </button>
        )}

        {selectedClient && !!selectedServices?.length &&
          <button
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-[#165874] font-semibold"><Wallet /></span>
            </div>
            <div className="text-left">
              {/* Total */}
              <div className="text-sm text-gray-500">
                Total: <strong>${total}</strong>
              </div>

              {/* Header Anticipos + botón agregar */}
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Anticipos:{" "}
                  <strong>${advanceAmount}</strong>
                  {event?.anticipo?.pagos_total ? (
                    <span className="ml-2 text-xs text-gray-400">
                      ({event.anticipo.pagos_total})
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label="Agregar anticipo"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenAddAnticipo(true);
                  }}
                  className="rounded-full p-1 hover:bg-blue-800 bg-blue-600 text-white cursor-pointer"
                  title="Agregar"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de anticipos (scroll) */}
              {!!event?.anticipo?.pagos?.length ? (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-100 bg-white">
                  <ul className="divide-y divide-gray-100">
                    {event.anticipo.pagos.map((p) => (
                      <li
                        key={p.id_anticipo}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="text-sm text-gray-700">
                            <strong>${Number(p.monto_neto || 0).toFixed(2)}</strong>
                            <span className="ml-2 text-xs text-gray-400">
                              Folio {p.folio}
                            </span>
                          </div>

                          <div className="text-xs text-gray-400 truncate">
                            {p.tipo_pago_descripcion
                              ? p.tipo_pago_descripcion
                              : `Tipo pago: ${p.tipo_pago}`}
                            {p.fecha_anticipo ? ` · ${p.fecha_anticipo}` : ""}
                          </div>
                        </div>
                        {p?.id_venta === null && p?.tipo_pago !== "Mercado Pago" && p?.corte === "0"  &&
                          <button
                            type="button"
                            aria-label={`Eliminar anticipo ${p.id_anticipo}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // aquí abre tu modal y guarda el id seleccionado
                              setSelectedAnticipo(p); // o setSelectedAnticipoId(p.id_anticipo)
                              setOpenDeleteAnticipo(true);
                            }}
                            className="ml-3 rounded-full p-1 hover:bg-red-800 bg-red-600 text-white cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400">
                  No hay anticipos registrados.
                </div>
              )}

              <div className="font-medium capitalize"></div>
            </div>

          </button>
        }

      </div>

      <div className="flex flex-col mt-10">
        <button
          type="button"
          onClick={() => advanceAmount ? toast.error('Elimina primero los anticipos') : setOpen(true)}
          className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 cursor-pointer ${advanceAmount ? 'bg-gray-400' : 'bg-red-700'} text-white`}
          title="Eliminar"
        //disabled={advanceAmount}
        >
          <Trash2 className="w-4 h-4" />
          <span>Eliminar</span>
        </button>
      </div>

      <Modal
        open={open}
        title="Eliminar cita"
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <Button className='bg-purple-300 text-purple-900' onClick={handleDelete}>Sí, eliminar</Button>
          </>
        )}
      >
        <p className='text-gray-600 font-bold'>¿Esta seguro que desea eliminar esta cita?</p>
      </Modal>

      <Modal
        open={openDeleteAnticipo}
        title="Eliminar anticipo"
        onCancel={() => setOpenDeleteAnticipo(false)}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <Button className='bg-purple-300 text-purple-900' onClick={handleRemoveAnticipo}>Sí, eliminar</Button>
          </>
        )}
      >
        <p className='text-gray-600 font-bold'>¿Esta seguro que desea eliminar el anticipo?</p>
      </Modal>

      <Modal
        open={openAddAnticipo}
        title="Agregar anticipo"
        onCancel={() => setOpenAddAnticipo(false)}
        footer={false}
      >
        <AnticiposForm
          refreshEvent={() => {
            //refreshEvent()
            setOpenAddAnticipo(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default SummaryAppointment;