export default function Header() {
  return (
    <header className="border-b border-[#2a2d3e] bg-[#1a1d27]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            CI
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">Consorciei Intel</h1>
            <p className="text-slate-500 text-xs">Inteligência de Mercado · Consórcio</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span>Atualizado diariamente</span>
        </div>
      </div>
    </header>
  )
}
