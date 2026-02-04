import { useState } from 'react';
import { Checkbox } from 'antd';
import { useSelector } from 'react-redux';
import { Box } from 'lucide-react';
import PaymentTypeSelect from '../../utils/PaymentTypeSelect';

const AnticiposForm = () => {
  const banks = useSelector((state) => state?.appointment?.bankTerminals);
  const [hasAdvance, setHasAdvance] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [payment, setPayment] = useState(1);
  const [comision, setComision] = useState(0);
  const [dataType, setDataType] = useState('');

  const handleSave = () => {
    alert('hey')
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
                  setDataType(payload.dataType)
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