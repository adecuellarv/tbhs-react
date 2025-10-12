import { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import { useSelector } from 'react-redux';
import { Box } from 'lucide-react';
import PaymentTypeSelect from '../../utils/PaymentTypeSelect';

const Cart = ({ services, advanceAmount, setAdvanceAmount, payment, setPayment, setComision, setDataType, onSave }) => {
  const total = services.reduce((sum, service) => sum + Number(service.costo), 0);
  const banks = useSelector((state) => state?.appointment?.bankTerminals);
  const [hasAdvance, setHasAdvance] = useState(false);
  

  const onChange = (e) => {
    setHasAdvance(e.target.checked);
  };

  useEffect(() => {
    if (!hasAdvance) setAdvanceAmount(0);
  }, [hasAdvance]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 168px)" }}>
      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Anticipo:{' '}
            <Checkbox onChange={onChange} checked={hasAdvance}></Checkbox>
          </div>

          {hasAdvance ? (
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
          ) :
            <div className="min-h-[200px] flex items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-3xl text-gray-700 font-bold">Sin anticipo</p>
                <Box className="w-8 h-8 text-gray-700" />
              </div>
            </div>


          }
        </div>
      </div>

      {/* Footer fijo */}
      <div className="border-t bg-white shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total</span>
          <span className="font-semibold text-lg">
            ${total}{' '}
            <span className="text-sm text-gray-600">MXN</span>
          </span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Anticipo</span>
          <span className="font-semibold text-lg">
            ${advanceAmount}{' '}
            <span className="text-sm text-gray-600">MXN</span>
          </span>
        </div>
        <div className="flex justify-between items-center mb-4 bg-purple-200 p-2 rounded">
          <span className="font-semibold">Restante a pagar</span>
          <span className="font-semibold text-lg">
            {Number(total) - Number(advanceAmount)}{' '}
            <span className="text-sm text-gray-600">MXN</span>
          </span>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onSave}
            className={`flex-1 text-white py-2 px-4 rounded ${hasAdvance && !advanceAmount ? 'bg-gray-200' : 'bg-black hover:bg-gray-800'}  `}
            disabled={hasAdvance && !advanceAmount}
          >
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
