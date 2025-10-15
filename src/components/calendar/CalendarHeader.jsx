import { Plus, ChevronLeft, ChevronRight, Settings, PenIcon, HelpCircleIcon } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarSelect from '../utils/CalendarSelect';

const CalendarHeader = ({
  typeCalendar,
  setTypeCalendar,
  goToPrevious,
  AdapterDayjs,
  date,
  handlePickerChange,
  goToNext,
  goToToday,
  showEditSchedule,
  setShowEditSchedule,
  schedule,
  selectHoraInicio,
  setSelectHoraInicio,
  horas,
  selectHoraFin,
  setSelectHoraFin,
  handleSaveSchedule,
  start,
  addEmployee
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        {/* izquierda */}
        <div className="flex flex-wrap items-center gap-2">
          <CalendarSelect
            typeCalendar={typeCalendar}
            setTypeCalendar={setTypeCalendar}
          />

          <button onClick={goToPrevious} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* El DatePicker ocupa ancho completo en móvil */}
          <div className="min-w-[180px] sm:min-w-[220px] w-full sm:w-auto" data-tour="date">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                label="Selecciona una fecha"
                value={date}
                onChange={handlePickerChange}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' }
                }}
                // Fuerza UI móvil bajo 640px
                desktopModeMediaQuery="@media (min-width: 640px)"

              />
            </LocalizationProvider>
          </div>

          <button onClick={goToNext} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={goToToday}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Hoy
          </button>

          {!showEditSchedule ? (
            <div
              className="flex items-center gap-2 cursor-pointer text-sm sm:text-base"
              onClick={() => setShowEditSchedule(true)}
              data-tour="schedule"
            >
              <strong>Horario</strong> {schedule.hora_inicio} - {schedule.hora_fin}
              <PenIcon className="w-4 h-4 text-gray-500" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                className="border border-gray-300 rounded px-3 py-1 text-sm"
                value={selectHoraInicio}
                onChange={(e) => setSelectHoraInicio(e.target.value)}
              >
                {horas.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded px-3 py-1 text-sm"
                value={selectHoraFin}
                onChange={(e) => setSelectHoraFin(e.target.value)}
              >
                {horas.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
              <button
                className="bg-blue-500 text-white px-3 sm:px-4 py-1 rounded-md text-sm"
                onClick={handleSaveSchedule}
              >
                Guardar
              </button>
            </div>
          )}
          <div>
            <button
              onClick={start}
              className="flex gap-2 rounded-md px-3 py-1 text-sm bg-blue-200 text-black ml-20 cursor-pointer"
            >
              <HelpCircleIcon size={18} /> Ayuda / Tour
            </button>
          </div>
        </div>

        {/* derecha */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {false && (
            <button className="p-2 hover:bg-gray-100 rounded">
              <Settings className="w-4 h-4" />
            </button>
          )}
          {false && (
            <button
              onClick={addEmployee}
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarHeader;