import { LogIn, LogOut, BarChart2, Rss } from 'lucide-react'
import { signInWithGoogle, signOut } from '../lib/actions'

export default function Header({ user, activeTab, onTabChange }) {
  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Logo Consorciei */}
        <div className="flex items-center gap-3 shrink-0">
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

        {/* Tab navigation */}
        <nav className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onTabChange('intel')}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'intel'
                ? 'bg-[#E7ECF5] text-[#063793] font-semibold'
                : 'text-slate-400 hover:text-slate-600 hover:bg-[#F2F5F9]'
            }`}
          >
            <Rss size={14} />
            <span className="hidden sm:inline">Intel</span>
          </button>
          <button
            onClick={() => onTabChange('avaliacoes')}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'avaliacoes'
                ? 'bg-[#E7ECF5] text-[#063793] font-semibold'
                : 'text-slate-400 hover:text-slate-600 hover:bg-[#F2F5F9]'
            }`}
          >
            <BarChart2 size={14} />
            <span className="hidden sm:inline">Avaliações</span>
          </button>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status pulse (only on intel tab) */}
        {activeTab === 'intel' && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Atualizado diariamente
          </div>
        )}

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-2 ml-2">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name || user.email}
                className="w-7 h-7 rounded-full border border-[#E2E8F0]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#E7ECF5] flex items-center justify-center text-[#063793] font-bold text-xs">
                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="hidden sm:inline text-xs text-slate-500 max-w-[120px] truncate">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={() => signOut()}
              title="Sair"
              className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signInWithGoogle()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-[#E7ECF5] hover:text-[#063793] hover:border-[#063793]/20 transition-colors"
          >
            <LogIn size={13} />
            <span className="hidden sm:inline">Entrar com Google</span>
            <span className="sm:hidden">Entrar</span>
          </button>
        )}
      </div>
    </header>
  )
}
