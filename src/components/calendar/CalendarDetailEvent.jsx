import { toMXPhone, getClientInfo, buildWhatsAppUrl, isPaidAppointment } from "../../helpers/calendar";
import { Clock, User as UserIcon, MessageCircle, CircleDollarSign, Scissors } from 'lucide-react';

const CalendarDetailEvent = ({ arg, clients }) => {
  const { event, timeText } = arg || {};
  //const xp = event?.extendedProps || {};
  const client = getClientInfo(arg.event.extendedProps.id_cliente, clients);
  //console.log('#client', client, arg.event.extendedProps)
  const phoneMX = client?.phone ? toMXPhone(client) : null;
  const xp = arg.event.extendedProps;

  // Anticipo: asumo que viene como número en xp.anticipo o boolean xp.anticipo_pagado
  const anticipoMonto = xp?.anticipo?.monto_neto;
  const anticipoPagado = xp?.tiene_anticipo;
  const isPaid = isPaidAppointment(xp);

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

  const serviceText = `${event?.title || ""}${xp?.descripcion ? ` - ${xp.descripcion}` : ""}`;

  return (
    <div
      className="tbhs-event-card group h-full w-full min-w-0 overflow-hidden p-1.5 text-[12px] leading-snug shadow-sm transition-shadow"
      style={{ borderLeft: '8px solid #67e8b8ff' }}
      title={serviceText}
    >
      {/* Header: hora + badges */}
      {xp?.tiempo > 20 &&
        <div className="flex min-w-0 items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1 font-semibold">
            <Clock className="tbhs-event-time-icon h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{timeText}</span>
          </div>

          <div className="tbhs-event-badges flex min-w-0 shrink items-center justify-end gap-1 overflow-hidden">
            {isPaid && (
              <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800">
                <CircleDollarSign className="h-3 w-3 shrink-0" />
                <span className="tbhs-event-badge-text truncate">Pagado</span>
              </span>
            )}
            {anticipoPagado && (
              <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                <CircleDollarSign className="h-3 w-3 shrink-0" />
                <span className="tbhs-event-badge-text truncate">
                  {anticipoMonto ? `$${anticipoMonto.toLocaleString()}` : "Anticipo"}
                </span>
              </span>
            )}
          </div>
        </div>
      }

      {/* Servicio */}
      {xp?.tiempo > 20 &&
        <div className="mt-1 flex min-w-0 items-start gap-1">
          <Scissors className="tbhs-event-service-icon h-3.5 w-3.5 shrink-0" />
          <div className="min-w-0 flex-1 truncate">
            {serviceText}
          </div>
        </div>
      }
      {xp?.tiempo <= 20 &&
        <div className="min-w-0 truncate">
          {event?.title}
        </div>
      }

      {/* Cliente */}
      {xp?.tiempo > 60 &&
        <div className="tbhs-event-client mt-1 flex min-w-0 items-start gap-1">
          <UserIcon className="mt-[2px] h-3.5 w-3.5 shrink-0" />
          <div className="min-w-0 truncate">
            <span className="font-semibold">Cliente: </span>
            <span>{client?.name || client?.nombre || "—"}</span>
          </div>
        </div>
      }

      {/* Acciones */}
      {xp?.tiempo > 90 &&
        <div className="tbhs-event-actions mt-2 flex items-center gap-2">
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
