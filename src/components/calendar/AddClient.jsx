import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Select } from '../utils/Select';
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
  const [loading, setLoading] = useState(false);

  const isValid = name && app && apm && gener && phone && !phoneError;

  const mapClient = (client) => ({
    id: client?.id_cliente ?? client?.id,
    name: (client?.nombre ?? name)?.trim()?.toLowerCase(),
    email: client?.email ?? '',
    lada: client?.lada,
    phone: client?.telefono ?? phone.trim(),
    avatar: getInitials(client?.nombre ?? name)
  });

  const upsertClient = (client, list = clients) => {
    const filteredClients = list.filter((item) => Number(item?.id) !== Number(client?.id));
    const nextClients = [client, ...filteredClients];
    dispatch(setClientsList(nextClients));
    return nextClients;
  };

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
      const createdClient = mapClient({
        ...resp,
        nombre: resp?.nombre ?? name.trim(),
        telefono: resp?.telefono ?? phone.trim(),
      });

      upsertClient(createdClient);
      const refreshedClients = await fetchClients(createdClient);
      const selectedClient = refreshedClients.find((client) => Number(client?.id) === Number(createdClient?.id)) ?? createdClient;

      setSelectedClient?.(selectedClient);
      back?.();
    }
    setLoading(false)
  }

  const handleBlurPhone = (number) => {
    const regex = /^\d{10}$/;
    const val = regex.test(number);
    setPhoneError(!val);
  }

  const fetchClients = async (fallbackClient) => {
    const resp = await getClients();
    const clientsList = resp ?? [];
    const newArray = clientsList.map(mapClient);

    if (fallbackClient && !newArray.some((client) => Number(client?.id) === Number(fallbackClient?.id))) {
      newArray.unshift(fallbackClient);
    }

    if (newArray?.length) {
      dispatch(setClientsList(newArray));
    }

    return newArray;
  }

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
            style={{
              border: '1px solid #eee'
            }}
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
            style={{
              border: '1px solid #eee'
            }}
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
            style={{
              border: '1px solid #eee'
            }}
          />
        </div>
        <div className='flex gap-2 mt-4 w-full'>
          <div className="flex-1">
            <label className="text-gray-800 font-semibold">Sexo</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              value={gener}
              onChange={(e) => setGener(e.target.value)}
              style={{
                border: '1px solid #eee'
              }}
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
            showSearch
            allowClear
            size="large"
            placeholder="Buscar recomendado..."
            value={recomended}
            onChange={(opt) => setRecomended(opt)}

            getPopupContainer={(triggerNode) => triggerNode.parentNode} // o document.body
            options={[
              { value: "", label: "Selecciona un servicio", disabled: true },
              ...clients.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
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
