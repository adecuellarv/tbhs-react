import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';

const ServicesList = ({ client, services, selectedSlot, onAddMoreServices, onSave, multiple = true }) => {
  const total = services.reduce((sum, service) => sum + Number(service.costo), 0);

  return (
    <div className="p-4 flex flex-col h-full">

      {/* Services */}
      <div className="flex-1">
        <h3 className="font-semibold mb-4">Servicios</h3>
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="border-l-4 border-blue-300 bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{service.descripcion}</div>
                  <div className="text-sm text-gray-600">
                    <strong>{service.tiempo_servicio} MIN</strong> {selectedSlot?.employeeName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{service.price} {service.currency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add more services button */}
        {multiple &&
          <button
            onClick={onAddMoreServices}
            className="w-full flex items-center justify-center space-x-2 p-3 mt-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir servicio</span>
          </button>
        }
      </div>
    </div>
  );
};

export default ServicesList;
