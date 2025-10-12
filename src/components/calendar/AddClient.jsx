import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Select from "react-select";
import { CircleChevronLeft } from 'lucide-react';
import { getInitials } from '../../helpers/calendar';
import { createClient, getClients } from '../../api/clients';
import { setClientsList } from '../../store/clientsSlice';

const AddClient = ({ back, setSelectedClient }) => {
  const dispatch = useDispatch()
  const clients = useSelector((state) => state?.appointment?.clients);
  const [name, setName] = useState('')
  const [app, setApp] = useState('')
  const [apm, setApm] = useState('')
  const [gener, setGener] = useState(2)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState(false)
  const [recomended, setRecomended] = useState('')
  const [clientCreated, setClientCreated] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValid = name && app && apm && gener && phone && !phoneError;

  const handleSave = async () => {
    setLoading(true)
    const values = {
      nombre: name.trim(),
      paterno: app.trim(),
      materno: apm.trim(),
      sexo: gener,
      telefono: phone.trim(),
      recomendador: recomended?.value
    }

    const resp = await createClient(values);
    if (resp) {
      setClientCreated({
          id: resp?.id_cliente,
          name: name.trim(),
          email: '',
          avatar: getInitials(name.trim())
        });
      fetchClients();
    }
    setLoading(false)
  }

  const handleBlurPhone = (number) => {
    const regex = /^\d{10}$/;
    const val = regex.test(number);
    setPhoneError(!val);
  }

  const fetchClients = async () => {
    const resp = await getClients();
    const clientsList = resp ?? [];
    if (clientsList?.length) {
      const newArray = [];
      clientsList?.map(i => {
        const obj = {
          id: i?.id_cliente,
          name: i?.nombre?.toLowerCase(),
          email: i?.email,
          avatar: getInitials(i.nombre)
        }

        newArray.push(obj)
      })
      dispatch(setClientsList(newArray))
    }
  }

  useEffect(() => {
    if (clientCreated && clients?.length) {
      back();
    }
  }, [clientCreated, clients])

  return (
    <div>
      <div className='flex gap-2 mb-2 cursor-pointer' onClick={back}>
        <CircleChevronLeft /> Regresar
      </div>
      <p className="text-2xl font-bold">Agregar Cliente</p>

      <div className='gap-2'>
        <div className='mt-4'>
          <label>Nombre</label>
          <input
            placeholder="Nombre"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className='mt-4'>
          <label className='text-gray-800 font-semibold'>Apellido Paterno</label>
          <input
            type="text"
            placeholder="Apellido Paterno"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={app}
            onChange={(e) => setApp(e.target.value)}
          />
        </div>
        <div className='mt-4'>
          <label className='text-gray-800 font-semibold'>Apellido Materno</label>
          <input
            type="text"
            placeholder="Apellido Materno"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={apm}
            onChange={(e) => setApm(e.target.value)}
          />
        </div>
        <div className='flex gap-2 mt-4 w-full'>
          <div className="flex-1">
            <label className="text-gray-800 font-semibold">Sexo</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              value={gener}
              onChange={(e) => setGener(e.target.value)}
            >
              <option value="2">Mujer</option>
              <option value="1">Hombre</option>
              <option value="3">Sin Especificar</option>
            </select>
          </div>

          <div className='flex-1'>
            <label className='text-gray-800 font-semibold'>Teléfono</label>
            <input
              type="text"
              placeholder="Teléfono"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${phoneError ? ' border-red-700 ' : ' border-gray-300 '}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={(e) => handleBlurPhone(e.target.value)}
              maxLength={10}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-gray-800 font-semibold">Recomendado</label>
          <Select
            placeholder="Selecciona recomendado..."
            className="w-full text-gray-700"
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#d1d5db",
                borderRadius: "0.5rem",
                padding: "2px 4px",
                boxShadow: "none",
                "&:hover": { borderColor: "#93c5fd" },
              }),
              indicatorsSeparator: () => null,
            }}
            options={clients?.map(i => ({ value: i.id, label: i.name }))}
            value={recomended}
            onChange={(opt) => setRecomended(opt)}  // opt puede ser null al limpiar
          />
        </div>
        <div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className={`flex-1 text-white py-2 px-4 rounded ${!isValid || loading ? 'bg-gray-200' : 'bg-black hover:bg-gray-800'}  `}
              disabled={!isValid || loading}
            >
              {loading ? 'Enviando' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddClient;