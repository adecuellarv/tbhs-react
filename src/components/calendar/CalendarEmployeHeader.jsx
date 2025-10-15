
const CalendarEmployeHeader = ({ arg }) => {
  return (
    <div className="flex flex-col items-center py-4" data-tour="employee">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
        {arg.resource.extendedProps.foto ?
          <img className='rounded-full w-12 h-12' src={`/${arg.resource.extendedProps.foto}`} />
          :
          <span className="text-blue-600 font-semibold text-sm">
            {arg.resource.extendedProps.avatar}
          </span>
        }
      </div>
      <span className="text-sm font-medium text-gray-900">
        {arg.resource.title}
      </span>
    </div>
  )
}

export default CalendarEmployeHeader;