import { useState } from 'react';
import { ShoppingBasket, User, Trash2, Wallet, PlusIcon } from 'lucide-react';
import { Button, Modal, Space } from 'antd';
import { toast } from "sonner"
import AnticiposForm from './AnticiposForm';
import { deleteApointment, deleteAdvance } from '../../../api/calendar';

const SummaryAppointment = ({
  selectedClient,
  selectedServices,
  advanceAmount,
  setAdvanceAmount,
  services,
  handleSave,
  event }) => {
  const total = services.reduce((sum, service) => sum + Number(service.costo), 0);
  const [open, setOpen] = useState(false);
  const [openDeleteAnticipo, setOpenDeleteAnticipo] = useState(false);
  const [openAddAnticipo, setOpenAddAnticipo] = useState(false);

  const handleDelete = async () => {
    const values = {
      id: services[0].id
    };

    const resp = await deleteApointment(values)
    if (resp) {
      toast.success('Cita eliminada');
      setOpen(false)
      handleSave(true);
    }
  };

  const handleRemoveAnticipo = async () => {
    const values = {
      id: selectedServices[0]?.anticipo?.id_anticipo,
      id_agendas_grupo: event?.id_agendas_grupo,
      id_agenda_actual: event?.id_agenda
    };

    const resp = await deleteAdvance(values)
    if (resp) {
      toast.success('Anticipo eliminado');
      setOpenDeleteAnticipo(false)
      setOpen(false)
      handleSave();
      setAdvanceAmount(0)
    }
  }

  const handleCancel = () => {
    setOpen(false);
  };

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
            <div className="text-left ">
              <div className="text-sm text-gray-500">Total: <strong>${total}</strong></div>
              <div className="text-sm text-gray-500">
                Anticipo: <strong>${advanceAmount}</strong>
                {!!advanceAmount &&
                  <button
                    type="button"
                    aria-label={`Eliminar anticipos`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDeleteAnticipo(true);
                    }}
                    className="rounded-full p-1 hover:bg-red-800 transition-opacity group-hover:opacity-100 bg-red-600 text-white ml-6 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                }

                <button
                  type="button"
                  aria-label={`Agregar anticipos`}
                  onClick={(e) => {
                    //e.preventDefault();
                    //e.stopPropagation();
                    //setOpenDeleteAnticipo(true);
                    setOpenAddAnticipo(true)
                  }}
                  className="rounded-full p-1 hover:bg-blue-800 transition-opacity group-hover:opacity-100 bg-blue-600 text-white ml-6 cursor-pointer"
                  title="Eliminar"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>

              </div>
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
        <AnticiposForm />
      </Modal>
    </div>
  );
};

export default SummaryAppointment;