import { useState } from 'react';
import { Checkbox } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from 'lucide-react';
import { toast } from "sonner"
import PaymentTypeSelect from '../../utils/PaymentTypeSelect';
import { addAdvancePayment, getAppoinments } from '../../../api/calendar';
import { setEvents } from "../../../store/clientsSlice";
import { mapCitaToEvent } from '../../../helpers/calendar';

const AnticiposForm = ({ refreshEvent }) => {
  const dispatch = useDispatch()
  const banks = useSelector((state) => state?.appointment?.bankTerminals);
  const event = useSelector((state) => state?.appointment?.event);
  const dateCalendar = useSelector((state) => state?.appointment?.dateCalendar);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [payment, setPayment] = useState(1);
  const [comision, setComision] = useState(0);
  //const [dataType, setDataType] = useState('');

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

  const handleSave = async () => {
    const totalAbonado = + event?.anticipo?.monto_neto ? Number(event?.anticipo?.monto_neto) : 0 + Number(advanceAmount)
    const rest = Number(event?.costo) - totalAbonado;
    if (rest >= 0) {
      const values = {
        id_agenda: event?.id_agenda,
        monto_neto: advanceAmount,
        comision,
        tipo_pago: payment,
      }

      const resp = await addAdvancePayment(values);
      if (resp?.success) {
        toast.success('Anticipo realizado')
        setAdvanceAmount('')
        setPayment(1)
        setComision(0)
        await refreshCalendarData();
        refreshEvent();
      }

    } else {
      toast.error('El monto supera el costo del servicio')
    }

  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 168px)" }}>
      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        <div className="mb-6">
          <div>
            <div className="flex gap-4">
              <p className="text-6xl">$</p>
              <input
                className="border-b border-gray-300 rounded-md p-2 placeholder-[#eee] outline-none text-2xl font-semibold"
                type="number"
                placeholder="100"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e?.target?.value)}
              />
            </div>
            <div className="mt-7">
              <PaymentTypeSelect
                banks={banks}
                value={payment}
                onChange={(payload) => {
                  setPayment(payload.value);
                  setComision(payload.comision)
                  //setDataType(payload.dataType)
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-3 mt-6">
        <button
          onClick={handleSave}
          className={`flex-1 text-white py-2 px-4 rounded ${!advanceAmount ? 'bg-gray-200' : 'bg-black hover:bg-gray-800'}  `}
          disabled={!advanceAmount}
        >
          Agendar
        </button>
      </div>

    </div>
  )
}

export default AnticiposForm;