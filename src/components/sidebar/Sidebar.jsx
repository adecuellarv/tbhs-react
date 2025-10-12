import { useState } from "react";
import {
  Menu,
  Home,
  Users,
  Folder,
  Calendar,
  FileText,
  BarChart,
  Scissors,
  ChartNoAxesCombined,
  Clock,
  BriefcaseBusiness,
  CalendarDays,
  Power
} from "lucide-react";
import logo from './logo.png'

const nav = [
  { id: "dashboard", label: "Dashboard", icon: Home, link: 'https://thebesthairsalon.com.mx/inicio' },
  { id: "cuenta", label: "Cuenta", icon: Users, link: 'https://thebesthairsalon.com.mx/clientes' },
  { id: "salon", label: "Salon", icon: Scissors, link: 'https://thebesthairsalon.com.mx/ventas' },
  { id: "Estadisticas", label: "Estadisticas", icon: ChartNoAxesCombined, link: 'https://thebesthairsalon.com.mx/inicio' },
  { id: "Asistencia", label: "Asistencia", icon: Clock, link: 'https://thebesthairsalon.com.mx/asistencia' },
  { id: "rh", label: "Recursos Humanos", icon: BriefcaseBusiness, link: 'https://thebesthairsalon.com.mx/recursoshumanos/calculo' },
  { id: "agenda", label: "Agenda", icon: CalendarDays, link: 'https://thebesthairsalon.com.mx/agenda' },
];

const teams = [
  { id: "H", label: "Heroicons" },
  { id: "T", label: "Tailwind Labs" },
  { id: "W", label: "Workcation" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("agenda");

  return (
    <aside
      className={`h-screen bg-white text-gray-800 border-r border-gray/10
      ${collapsed ? "w-20" : "w-72"} transition-[width] duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" />
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-2 px-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                ${isActive ? "bg-[#036893] " : "hover:bg-white/5"}
                transition-colors`}
              title={collapsed ? item.label : undefined}
              href={item.link}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0
                  ${isActive ? "text-white" : "text-gray-800"}`}
              />
              {!collapsed && (
                <span
                  className={`text-sm ${isActive ? "text-white" : "text-gray-800"
                    }`}
                >
                  {item.label}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-4 mx-4 h-px bg-white/10" />

      {/* Teams */}


      {/* Footer user */}
      <div className="absolute bottom-0 left-0 right-0 p-3 cursor-pointer">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
          <Power />
          {!collapsed &&
            <div className="min-w-0">
              <p className="text-sm text-gray-800 truncate">Cerrar sesión</p>

            </div>
          }

        </div>
      </div>
    </aside>
  );
}
