import { format, subDays, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function DateNavigation({ selectedDate, onDateChange }) {
  const dateObj = parseISO(selectedDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isAtToday = format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

  const goBack = () => {
    const newDate = subDays(dateObj, 1)
    onDateChange(format(newDate, 'yyyy-MM-dd'))
  }

  const goForward = () => {
    if (!isAtToday) {
      const newDate = addDays(dateObj, 1)
      onDateChange(format(newDate, 'yyyy-MM-dd'))
    }
  }

  const goToday = () => {
    onDateChange(format(today, 'yyyy-MM-dd'))
  }

  const formattedDate = format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="flex items-center justify-between mb-6 bg-[#1a1d27] border border-[#2a2d3e] rounded-xl px-4 py-3">
      <button
        onClick={goBack}
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#21253a] text-slate-400 hover:text-white transition-colors"
        title="Dia anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-3">
        <Calendar size={16} className="text-blue-400 flex-shrink-0" />
        <span className="text-white font-medium text-sm sm:text-base">{capitalizedDate}</span>
        {isAtToday && (
          <span className="hidden sm:inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
            Hoje
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isAtToday && (
          <button
            onClick={goToday}
            className="hidden sm:block text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-400/10 transition-colors"
          >
            Hoje
          </button>
        )}
        <button
          onClick={goForward}
          disabled={isAtToday}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            isAtToday
              ? 'text-slate-600 cursor-not-allowed'
              : 'hover:bg-[#21253a] text-slate-400 hover:text-white'
          }`}
          title="Próximo dia"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
