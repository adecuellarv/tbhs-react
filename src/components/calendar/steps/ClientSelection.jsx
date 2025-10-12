import { useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { useSelector } from 'react-redux'

const ClientSelection = ({ onClientSelect, selectedClient, setAddClient, addClient }) => {
  const [searchTerm, setSearchTerm] = useState(selectedClient?.name ? selectedClient?.name : '');
  const clients = useSelector((state) => state?.appointment?.clients);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-4">Seleccionar cliente</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar cliente o dejar vacío"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Add new client option */}
        <button 
          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300"
          onClick={() => setAddClient(true)}
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-purple-600 font-medium">Añadir un nuevo cliente</span>
        </button>

        {/* Walk-in option */}
        {false && <button
          onClick={() => onClientSelect({ id: 'walk-in', name: 'Sin cita', email: '' })}
          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <span className="font-medium">Sin cita</span>
        </button>}

        {/* Client list */}
        {filteredClients.map((client) => (
          <button
            key={client.id}
            onClick={() => onClientSelect(client)}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">{client.avatar}</span>
            </div>
            <div className="text-left">
              <div className="font-medium capitalize">{client.name}</div>
              <div className="text-sm text-gray-500">{client.email}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClientSelection;
