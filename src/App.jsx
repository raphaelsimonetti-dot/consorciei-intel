import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import DateNavigation from './components/DateNavigation'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import IntelFeed from './components/IntelFeed'

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

  useEffect(() => {
    fetchItems(selectedDate)
  }, [selectedDate])

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

  // Optimistic update from card interactions
  function handleItemUpdate(id, updates) {
    setItems((prev) =>
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

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
        />
      </main>
    </div>
  )
}

export default App
