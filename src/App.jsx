import { useState, useEffect, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { supabase } from './lib/supabase'
import { signInWithGoogle } from './lib/actions'
import Header from './components/Header'
import DateNavigation from './components/DateNavigation'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import IntelFeed from './components/IntelFeed'
import PeriodSummaryFeed from './components/PeriodSummaryFeed'
import AvaliacoesView from './components/AvaliacoesView'

function LoginScreen() {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    await signInWithGoogle()
    // redirect happens, no need to setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F2F5F9] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <svg width="52" height="52" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="18" fill="#063793"/>
            <path
              d="M25 13C23.1 11.1 20.7 10 18 10C12.5 10 8 14.5 8 20C8 25.5 12.5 30 18 30C20.7 30 23.1 28.9 25 27"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="text-center">
            <h1 className="text-[#063793] font-black text-2xl tracking-tight">consorciei</h1>
            <p className="text-slate-400 text-sm">Inteligência de Mercado</p>
          </div>
        </div>

        <div className="w-full h-px bg-[#E2E8F0]" />

        <div className="text-center">
          <p className="text-slate-600 text-sm font-medium mb-1">Acesso restrito</p>
          <p className="text-slate-400 text-xs">Entre com sua conta Google corporativa para continuar</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F2F5F9] hover:border-[#063793]/20 transition-all text-slate-600 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? 'Redirecionando…' : 'Entrar com Google'}
        </button>

        <p className="text-xs text-slate-300 text-center">
          Use sua conta @consorciei.com.br
        </p>
      </div>
    </div>
  )
}

function App() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(today)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    sourceType: '',
    relevance: '',
    strategic: false,
  })
  const [period, setPeriod] = useState('hoje') // 'hoje' | '7dias' | '30dias'
  const [periodItems, setPeriodItems] = useState([])
  const [periodLoading, setPeriodLoading] = useState(false)
  const [periodError, setPeriodError] = useState(null)
  const [activeTab, setActiveTab] = useState('intel')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user || activeTab !== 'intel') return
    if (period === 'hoje') {
      fetchItems(selectedDate)
    } else {
      fetchPeriodItems(period === '7dias' ? 7 : 30)
    }
  }, [selectedDate, activeTab, user, period])

  async function fetchItems(date) {
    setLoading(true)
    setError(null)
    try {
      const { data, error: supabaseError } = await supabase
        .from('intel_items')
        .select('*')
        .eq('collected_date', date)
      if (supabaseError) throw supabaseError

      const relevanceOrder = { alta: 0, média: 1, baixa: 2 }
      const sorted = (data || []).sort(
        (a, b) =>
          (relevanceOrder[a.relevance] ?? 3) - (relevanceOrder[b.relevance] ?? 3)
      )
      setItems(sorted)
    } catch (err) {
      setError(err.message || 'Erro desconhecido')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchPeriodItems(days) {
    setPeriodLoading(true)
    setPeriodError(null)
    try {
      const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
      const { data, error: supabaseError } = await supabase
        .from('intel_items')
        .select('*')
        .gte('collected_date', startDate)
        .lte('collected_date', today)
        .or('relevance.eq.alta,user_relevance.eq.true')
      if (supabaseError) throw supabaseError

      const filtered = (data || []).filter((item) => item.user_relevance !== false)
      const relevanceOrder = { alta: 0, média: 1, baixa: 2 }
      const sorted = filtered.sort((a, b) => {
        if (b.collected_date !== a.collected_date)
          return b.collected_date.localeCompare(a.collected_date)
        return (relevanceOrder[a.relevance] ?? 3) - (relevanceOrder[b.relevance] ?? 3)
      })
      setPeriodItems(sorted)
    } catch (err) {
      setPeriodError(err.message || 'Erro desconhecido')
      setPeriodItems([])
    } finally {
      setPeriodLoading(false)
    }
  }

  function handleItemUpdate(id, updates) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  function handlePeriodItemUpdate(id, updates) {
    setPeriodItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.category && item.category !== filters.category) return false
      if (filters.sourceType && item.source_type !== filters.sourceType) return false
      if (filters.relevance && item.relevance !== filters.relevance) return false
      if (filters.strategic && !item.is_strategic) return false
      return true
    })
  }, [items, filters])

  // Loading auth state — blank screen to avoid flash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F2F5F9] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#063793]/20 border-t-[#063793] animate-spin" />
      </div>
    )
  }

  // Not logged in — show login screen
  if (!user) {
    return <LoginScreen />
  }

  return (
    <div className="min-h-screen bg-[#F2F5F9] text-[#333]">
      <Header user={user} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'intel' ? (
          <>
            {/* Period selector */}
            <div className="flex items-center gap-1 mb-4 bg-white border border-[#E2E8F0] rounded-xl p-1 w-fit shadow-sm">
              {[
                { value: 'hoje', label: 'Hoje' },
                { value: '7dias', label: 'Últimos 7 dias' },
                { value: '30dias', label: 'Últimos 30 dias' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    period === value
                      ? 'bg-[#063793] text-white'
                      : 'text-slate-500 hover:text-[#063793] hover:bg-[#E7ECF5]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {period === 'hoje' ? (
              <>
                <DateNavigation
                  selectedDate={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date)
                    setFilters({ category: '', sourceType: '', relevance: '', strategic: false })
                  }}
                />

                <StatsBar items={items} loading={loading} />

                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  totalItems={items.length}
                  filteredCount={filteredItems.length}
                />

                <IntelFeed
                  items={filteredItems}
                  loading={loading}
                  error={error}
                  onUpdate={handleItemUpdate}
                  user={user}
                />
              </>
            ) : (
              <PeriodSummaryFeed
                items={periodItems}
                loading={periodLoading}
                error={periodError}
                days={period === '7dias' ? 7 : 30}
                onUpdate={handlePeriodItemUpdate}
                user={user}
              />
            )}
          </>
        ) : (
          <AvaliacoesView />
        )}
      </main>
    </div>
  )
}

export default App
