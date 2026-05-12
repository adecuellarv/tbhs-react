/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { X, Clock, Calendar, MessageCircle, Pencil } from 'lucide-react';
import dayjs from "dayjs";
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '../../utils/Button';
import SummaryAppointment from './SummaryAppointment';
import EditAppointment from './EditAppointment';
import { setOpenModalEdit } from '../../../store/clientsSlice';
import { formatTime, formatDate, toMXPhone, buildWhatsAppUrl } from '../../../helpers/calendar';

import "dayjs/locale/es";
dayjs.locale("es");


const EditView = () => {
  const dispatch = useDispatch()
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [day, setDay] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [waHref, setWaHref] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const clients = useSelector((state) => state?.appointment?.clients);
  const event = useSelector((state) => state?.appointment?.event);
  const isOpen = useSelector((state) => state?.appointment?.openModalEdit);

  if (!isOpen) return null;


  useEffect(() => {
    if (event) {
      //day
      const isoDay = formatDate(event?.start, 'dddd D MMMM')
      const pretty = isoDay.charAt(0).toUpperCase() + isoDay.slice(1);
      setDay(pretty);

      //setSelectedSlot
      setSelectedSlot({
        start: event?.start,
        end: event?.end,
        employeeName: event?.employeeName
      })

      //cliente
      const findClient = clients?.find(i => i?.id === event?.id_cliente);
      setSelectedClient(findClient)

      //service
      const service = {
        id: event?.id,
        descripcion: event?.title,
        tiempo_servicio: event?.tiempo,
        costo: Number(event?.costo),
        currency: 'MXN',
        anticipo: event?.anticipo,
        serviceDescription: event?.descripcion
      }
      setSelectedServices([service]);

      //advance
      setAdvanceAmount(event?.anticipo?.monto_neto ? Number(event?.anticipo?.monto_neto) : 0)


      //whatsapp
      const phoneMX = findClient?.phone ? toMXPhone(findClient) : null;
      setWaHref(phoneMX
        ? buildWhatsAppUrl({
          phone: phoneMX,
          name: findClient?.name || findClient?.nombre || "",
          dateText: event?.fecha ? event.fecha : '',
          timeText: event?.hora,
          service: event?.title || "",
          descripcion: event?.descripcion || ""
        })
        : null)
    }
  }, [event, clients]);

  return (
    <>
      {showEdit ?
        <EditAppointment
          isOpen={true}
          onClose={() => setShowEdit(false)}
          //event={event}
          //employees={employees}
          //clients={clients}
          //handleSave={handleSave}
        />
        :
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 opacity-[.6]"
            onClick={() => dispatch(setOpenModalEdit(false))}
          />

          {/* Side Panel */}
          {selectedClient && (
            <div
              className={`fixed top-[50px] right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
              style={{
                overflowY: 'auto',
                height: 'calc(100vh - 50px)'
              }}
            >
              <div>
                {selectedClient &&
                  <div className="pl-6 pt-6 pr-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-[#5fba9a]" />
                        <span className="text-sm text-gray-600">{day}</span>
                      </div>
                      <div className="flex items-center space-x-4">

                        <button
                          onClick={() => dispatch(setOpenModalEdit(false))}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Time slot info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {selectedSlot && `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        <strong>Tiempo: </strong>{event?.tiempo} min
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {selectedSlot?.employeeName}
                      </div>

                      {waHref &&
                        <div className='mt-2'>
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
                        </div>
                      }

                    </div>


                  </div>
                }
                <div className='text-right mt-3 mr-6'>
                  <Button
                    type="primary"
                    size='small'
                    icon={<Pencil size={14} />}
                    onClick={() => setShowEdit(true)}
                    style={{ padding: 10 }}
                  >
                    Editar Datos de cita
                  </Button>

                </div>
                <SummaryAppointment
                  selectedClient={selectedClient}
                  selectedServices={selectedServices}
                  advanceAmount={advanceAmount}
                  setAdvanceAmount={setAdvanceAmount}
                  services={selectedServices}
                  event={event}
                />
              </div>

            </div>
          )}
        </>
      }
    </>
  );
};

export default EditView;
