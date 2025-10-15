import { toMXPhone, getClientInfo, buildWhatsAppUrl } from "../../helpers/calendar";
import { Clock, User as UserIcon, MessageCircle, CircleDollarSign, Scissors } from 'lucide-react';

const CalendarDetailEvent = ({ arg, clients }) => {
  const { event, timeText } = arg || {};
  //const xp = event?.extendedProps || {};
  const client = getClientInfo(arg.event.extendedProps.id_cliente, clients);
  //console.log('#client', client, arg.event.extendedProps)
  const phoneMX = client?.phone ? toMXPhone(client.phone) : null;
  const xp = arg.event.extendedProps;

  // Anticipo: asumo que viene como número en xp.anticipo o boolean xp.anticipo_pagado
  const anticipoMonto = xp?.anticipo?.monto_neto;
  const anticipoPagado = xp?.tiene_anticipo;

  const waHref = phoneMX
    ? buildWhatsAppUrl({
      phone: phoneMX,
      name: client?.name || client?.nombre || "",
      dateText: xp?.fecha ? xp.fecha : '',
      timeText,
      service: event?.title || "",
      descripcion: xp?.descripcion || ""
    })
    : null;
  return (
    <div className="group   shadow-sm transition-shadow p-2 text-[13px] leading-snug h-full" style={{ borderLeft: '15px solid #67e8b8ff' }}>
      {/* Header: hora + badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold">
          <Clock className="w-4 h-4" />
          <span>{timeText}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {anticipoPagado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
              <CircleDollarSign className="w-3.5 h-3.5" />
              {anticipoMonto ? `Anticipo $${anticipoMonto.toLocaleString()}` : "Anticipo pagado"}
            </span>
          )}
        </div>
      </div>

      {/* Servicio */}
      <div className="mt-1.5 flex items-start gap-1.5 ">
        <Scissors className="w-4 h-4 mt-[2px] shrink-0" />
        <div className="truncate">
          <span className="font-semibold">Servicio: </span>
          <span className="truncate">
            {event?.title}
            {xp?.descripcion ? ` - ${xp.descripcion}` : ""}
          </span>
        </div>
      </div>

      {/* Cliente */}
      {xp?.tiempo > 50 &&
        <div className="mt-1 flex items-start gap-1.5 ">
          <UserIcon className="w-4 h-4 mt-[2px] shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold">Cliente: </span>
            <span className="truncate">{client?.name || client?.nombre || "—"}</span>
          </div>
        </div>
      }

      {/* Acciones */}
      {xp?.tiempo > 50 &&
        <div className="mt-2 flex items-center gap-2">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100 active:scale-[0.98] transition"
              onClick={(e) => e.stopPropagation()}
              title="Abrir WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-[12px] cursor-not-allowed">
              <MessageCircle className="w-4 h-4" />
              Sin teléfono
            </span>
          )}
        </div>
      }
    </div>
  )
}

export default CalendarDetailEvent;