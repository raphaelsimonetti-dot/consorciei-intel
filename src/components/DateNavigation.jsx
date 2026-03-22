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
    <div className="flex items-center justify-between mb-6 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-sm">
      <button
        onClick={goBack}
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#E7ECF5] text-slate-400 hover:text-[#063793] transition-colors"
        title="Dia anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-3">
        <Calendar size={16} className="text-[#063793] flex-shrink-0" />
        <span className="text-[#063793] font-bold text-sm sm:text-base">{capitalizedDate}</span>
        {isAtToday && (
          <span className="hidden sm:inline-block bg-[#063793]/10 text-[#063793] text-xs px-2 py-0.5 rounded-full border border-[#063793]/20 font-semibold">
            Hoje
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isAtToday && (
          <button
            onClick={goToday}
            className="hidden sm:block text-xs text-[#063793] hover:text-[#063793]/80 px-2 py-1 rounded-lg hover:bg-[#E7ECF5] transition-colors font-semibold"
          >
            Hoje
          </button>
        )}
        <button
          onClick={goForward}
          disabled={isAtToday}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            isAtToday
              ? 'text-slate-300 cursor-not-allowed'
              : 'hover:bg-[#E7ECF5] text-slate-400 hover:text-[#063793]'
          }`}
          title="Próximo dia"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
