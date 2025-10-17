
import { useMemo } from "react"
import { X, Clock, Calendar as CalendarIcon, UserCog, UserRound } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";

const Label = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    {Icon ? <Icon className="w-4 h-4" /> : null}
    <span className="font-medium">{children}</span>
  </div>
);


const Header = ({
  servicio,
  onClose,
  date,
  event,
  startDateTime,
  endDateTime,
  tiempoMin
}) => {

  const prettyDay = useMemo(() => {
    if (!date) return "";
    const s = dayjs(date).format("dddd D MMMM");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [date]);

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-gray-500">Editar cita</div>
          <div className="text-lg font-semibold text-gray-800">{servicio}</div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Resumen */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <Label icon={CalendarIcon}>{prettyDay}</Label>
          <div className="text-xs text-blue-700">#{event?.id}</div>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <Label icon={Clock}>
            {startDateTime && endDateTime
              ? `${startDateTime.format("HH:mm")} - ${endDateTime.format("HH:mm")}`
              : "--:--"}
          </Label>
          <div className="text-xs text-blue-700">{tiempoMin} min</div>
        </div>

      </div>
    </div>
  )
};

export default Header;