export default function Header() {
  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo Consorciei */}
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="18" fill="#063793"/>
            <path
              d="M25 13C23.1 11.1 20.7 10 18 10C12.5 10 8 14.5 8 20C8 25.5 12.5 30 18 30C20.7 30 23.1 28.9 25 27"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div>
            <h1 className="text-[#063793] font-black text-lg leading-tight tracking-tight">
              consorciei
            </h1>
            <p className="text-slate-400 text-xs font-normal tracking-wide">
              Inteligência de Mercado
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span className="hidden sm:inline">Atualizado diariamente</span>
        </div>
      </div>
    </header>
  )
}
