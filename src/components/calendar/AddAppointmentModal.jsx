/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import dayjs from "dayjs";
import moment from "moment";
import ClientSelection from './steps/ClientSelection';
import ServiceSelection from './steps/ServiceSelection';
import ServicesList from './steps/ServicesList';
import Cart from './steps/Cart';
import AddClient from './AddClient';
import WidgetSteps from './WidgetSteps';
import { formatTime, formatDate } from '../../helpers/calendar';
import { setAppoiment } from '../../api/calendar';

import "dayjs/locale/es";
dayjs.locale("es");


const AppointmentModal = ({ isOpen, onClose, onSave, selectedSlot, date }) => {
  const [currentStep, setCurrentStep] = useState('client'); // 'client', 'services', 'cart'
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [endAppoiment, setEndAppoiment] = useState('');
  const [day, setDay] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [payment, setPayment] = useState(1);
  const [comision, setComision] = useState(0);
  const [addClientModal, setAddClientModal] = useState(false);
  const [dataType, setDataType] = useState('');


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
    const formatted = moment(date).format("YYYY-MM-DD");

    const values = {
      date: formatted,
      startHour: formatTime(selectedSlot.start),
      id_cliente: selectedClient?.id,
      id_usuario: selectedSlot.resourceId,
      monto_neto: advanceAmount,
      services: selectedServices,
      tipo_pago: payment !== 1 || payment !== 2 || payment !== 4 ? dataType : payment,
      observaciones: 'test',
      comision
    };

    debugger
    const resp = await setAppoiment(values);
    if (resp) {
      onSave({
        client: selectedClient,
        services: selectedServices,
        slot: selectedSlot
      });
    }
  };

  useEffect(() => {
    if (date) {
      const isoDay = formatDate(date, 'dddd D MMMM')
      const pretty = isoDay.charAt(0).toUpperCase() + isoDay.slice(1);
      setDay(pretty);
    }
  }, [date]);


  return (
    <>
      {!addClientModal ? (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={onClose}
          />


          {selectedClient && (
            <div
              className={`fixed top-[50px] right-96 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
              <div>
                {selectedClient &&
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
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
                          {selectedSlot && `${formatTime(selectedSlot.start)} ${endAppoiment ? '-' + endAppoiment : ''}`}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {selectedSlot?.employeeName}
                      </div>
                    </div>


                  </div>
                }
                <WidgetSteps
                  selectedClient={selectedClient}
                  selectedServices={selectedServices}
                  setCurrentStep={setCurrentStep}
                  setSelectedServices={setSelectedServices}
                  advanceAmount={advanceAmount}
                  services={selectedServices}
                />
              </div>

            </div>
          )}

          <div className={`fixed top-[50px] right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
            <div className="flex flex-col h-[95%]">
              {/* Header */}
              {!selectedClient ?
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
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
                        {selectedSlot && `${formatTime(selectedSlot.start)} ${endAppoiment ? '-' + endAppoiment : ''}`}
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
                  <ClientSelection onClientSelect={handleClientSelect} selectedClient={selectedClient} setAddClient={setAddClientModal} />
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
                  />
                )}
                {currentStep === 'cart' && (
                  <Cart
                    services={selectedServices}
                    advanceAmount={advanceAmount}
                    setAdvanceAmount={setAdvanceAmount}
                    onSave={handleSave}
                    payment={payment}
                    setPayment={setPayment}
                    setComision={setComision}
                    setDataType={setDataType}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      ) :
        <div>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={onClose}
          />
          <div className="fixed top-[50px] right-0 h-full w-[50%] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out p-10">
            <AddClient back={() => setAddClientModal(false)} setSelectedClient={setSelectedClient} />
          </div>

        </div>
      }
    </>
  );
};

export default AppointmentModal;
