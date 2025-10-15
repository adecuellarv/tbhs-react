/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { X, Clock, Calendar, MessageCircle, Pencil } from 'lucide-react';
import dayjs from "dayjs";
import { useSelector } from 'react-redux'
import ClientSelection from '../steps/ClientSelection';
import ServiceSelection from '../steps/ServiceSelection';
import ServicesList from '../steps/ServicesList';
import Cart from '../steps/Cart';
import WidgetSteps from '../WidgetSteps';
import EditAppointment from './EditAppointment';
import { formatTime, formatDate, toMXPhone, buildWhatsAppUrl } from '../../../helpers/calendar';

import "dayjs/locale/es";
import { Button } from 'antd';
dayjs.locale("es");


const EditView = ({ isOpen, onClose, onSave, event, employees }) => {
  const [currentStep, setCurrentStep] = useState('cart'); // 'client', 'services', 'cart'
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [day, setDay] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [waHref, setWaHref] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const clients = useSelector((state) => state?.appointment?.clients);



  if (!isOpen) return null;

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setCurrentStep('services');
  };

  const handleServiceSelect = (service) => {
    setSelectedServices([...selectedServices, service]);
    setCurrentStep('cart');
  };

  const handleAddMoreServices = () => {
    setCurrentStep('services');
  };

  const handleSave = async () => {
    onSave();
  };

  const handleDelete = async (value) => {
    onSave(value);
  };

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
      const phoneMX = findClient?.phone ? toMXPhone(findClient.phone) : null;
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
          onClose={() => setShowEdit()}
          onSave={onSave}
          event={event}
          employees={employees}
        />
        :
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 opacity-[.6]"
            onClick={onClose}
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
                          onClick={onClose}
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
                <WidgetSteps
                  selectedClient={selectedClient}
                  selectedServices={selectedServices}
                  setCurrentStep={setCurrentStep}
                  setSelectedServices={setSelectedServices}
                  advanceAmount={advanceAmount}
                  setAdvanceAmount={setAdvanceAmount}
                  services={selectedServices}
                  edit={false}
                  handleSave={handleDelete}
                />
              </div>

            </div>
          )}
          {false &&
            <div className={`fixed top-[50px] right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
              }`}>
              <div className="flex flex-col h-full">
                {/* Header */}
                {!selectedClient ?
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-[#5fba9a]" />
                        <span className="text-sm text-gray-600">{day}</span>
                      </div>
                      <div className="flex items-center space-x-4">

                        <button
                          onClick={onClose}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Time slot info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {selectedSlot && `${formatTime(selectedSlot.start)}`}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {selectedSlot?.employeeName}
                      </div>
                    </div>

                    {currentStep === 'services' && (
                      <h2 className="text-lg font-semibold">Seleccionar un servicio</h2>
                    )}
                    {currentStep === 'cart' && (
                      <h2 className="text-lg font-semibold">Servicios</h2>
                    )}
                  </div>
                  : <div className='p-6 border-b border-gray-200'>
                    {currentStep === 'services' && (
                      <h2 className="text-lg font-semibold">Seleccionar un servicio</h2>
                    )}
                    {currentStep === 'cart' && (
                      <h2 className="text-lg font-semibold">Servicios</h2>
                    )}
                  </div>
                }
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {currentStep === 'client' && (
                    <ClientSelection onClientSelect={handleClientSelect} selectedClient={selectedClient} />
                  )}
                  {currentStep === 'services' && (
                    <ServiceSelection onServiceSelect={handleServiceSelect} />
                  )}
                  {currentStep === 'services-list' && (
                    <ServicesList
                      client={selectedClient}
                      services={selectedServices}
                      selectedSlot={selectedSlot}
                      onAddMoreServices={handleAddMoreServices}
                      onSave={handleSave}
                      multiple={false}
                    />
                  )}
                  {currentStep === 'cart' && (
                    <Cart
                      services={selectedServices}
                      advanceAmount={advanceAmount}
                      setAdvanceAmount={setAdvanceAmount}
                      onSave={handleSave}
                    />
                  )}
                </div>
              </div>
            </div>
          }
        </>
      }
    </>
  );
};

export default EditView;
