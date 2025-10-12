import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getServices } from '../../../api/services';

const ServiceSelection = ({ onServiceSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceCategories, setServiceCategories] = useState([]);
  const [filteredServices, setFilterServices] = useState([]);



  const fetchServices = async () => {
    try {
      const resp = await getServices();
      if (resp?.length) {
        setServiceCategories(resp)
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    if (serviceCategories?.length) {
      const allServices = serviceCategories.flatMap(category => category.services);
      const filteredServicesL = allServices.filter(service =>
        service?.descripcion?.toLowerCase().includes(searchTerm?.toLowerCase())
      );
      setFilterServices(filteredServicesL)
    }
  }, [serviceCategories]);

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre de servicio"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {!!serviceCategories?.length && serviceCategories.map((category) => {
          const categoryServices = searchTerm
            ? category.services.filter(service =>
              service?.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : category.services;

          if (categoryServices.length === 0) return null;

          return (
            <div key={category.name}>
              <h3 className="font-semibold text-gray-900 mb-3">
                {category.name} <span className="text-gray-500 font-normal">{categoryServices.length}</span>
              </h3>
              <div className="space-y-2">
                {categoryServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => onServiceSelect(service)}
                    className="w-full flex items-center justify-between px-3 py-6 hover:bg-gray-50 rounded-lg border-l-4 border-blue-300"
                  >
                    <div className="text-left">
                      <div className="font-medium">{service.descripcion}</div>
                      <div className="text-sm text-gray-500">{service.tiempo_servicio} MIN</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-700">${service.costo} MXN</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSelection;
