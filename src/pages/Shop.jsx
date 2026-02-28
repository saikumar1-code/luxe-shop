import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/product/ProductCard'
import ProductSkeleton from '../components/product/ProductSkeleton'
import './Shop.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    featured: searchParams.get('featured') === 'true',
    inStock: false,
  })

  const searchDebounce = useRef(null)

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const fetchProducts = useCallback(async (f) => {
    setLoading(true)
    let q = supabase.from('products').select('*', { count: 'exact' })

    if (f.search) q = q.ilike('name', `%${f.search}%`)
    if (f.category) q = q.eq('category', f.category)
    if (f.minPrice) q = q.gte('price', parseFloat(f.minPrice))
    if (f.maxPrice) q = q.lte('price', parseFloat(f.maxPrice))
    if (f.featured) q = q.eq('is_featured', true)
    if (f.inStock) q = q.gt('stock', 0)

    const sortMap = {
      newest: { col: 'created_at', asc: false },
      price_asc: { col: 'price', asc: true },
      price_desc: { col: 'price', asc: false },
      rating: { col: 'avg_rating', asc: false },
      popular: { col: 'review_count', asc: false },
    }
    const s = sortMap[f.sort] || sortMap.newest
    q = q.order(s.col, { ascending: s.asc })

    const { data, error, count } = await q
    if (!error) { setProducts(data || []); setTotal(count || 0) }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => {
      fetchProducts(filters)
    }, 300)
    return () => clearTimeout(searchDebounce.current)
  }, [filters, fetchProducts])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', featured: false, inStock: false })
    setSearchParams({})
  }

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.featured || filters.inStock

  return (
    <div className="page">
      <div className="container">
        <div className="shop-header">
          <div>
            <h1 className="shop-title gradient-text">Shop All</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              {loading ? '...' : `${total} products`}
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            ⚡ Filters {hasActiveFilters && <span className="filter-dot"></span>}
          </button>
        </div>

        {/* Search Bar */}
        <div className="shop-search-bar" style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>⌕</span>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '44px' }}
            />
          </div>
          <select
            className="input-glass"
            style={{ maxWidth: '200px', cursor: 'pointer' }}
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="shop-layout">
          {/* Sidebar Filters */}
          <aside className={`shop-sidebar glass ${filtersOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', color: 'var(--error)' }}>Clear All</button>
              )}
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4 className="filter-label">Category</h4>
              <div className="filter-options">
                <button
                  className={`filter-opt ${!filters.category ? 'active' : ''}`}
                  onClick={() => updateFilter('category', '')}
                >All</button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    className={`filter-opt ${filters.category === c.name ? 'active' : ''}`}
                    onClick={() => updateFilter('category', c.name)}
                  >{c.name}</button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h4 className="filter-label">Price Range</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="input-glass"
                  style={{ padding: '10px 12px' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="input-glass"
                  style={{ padding: '10px 12px' }}
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="filter-group">
              <label className="filter-toggle-label">
                <span>Featured Only</span>
                <div
                  className={`toggle ${filters.featured ? 'on' : ''}`}
                  onClick={() => updateFilter('featured', !filters.featured)}
                />
              </label>
              <label className="filter-toggle-label">
                <span>In Stock Only</span>
                <div
                  className={`toggle ${filters.inStock ? 'on' : ''}`}
                  onClick={() => updateFilter('inStock', !filters.inStock)}
                />
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="shop-main">
            <div className="product-grid">
              {loading ? <ProductSkeleton count={8} /> : (
                products.length > 0
                  ? products.map(p => <ProductCard key={p.id} product={p} />)
                  : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                      <h3 style={{ marginBottom: '8px' }}>No products found</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Try adjusting your filters</p>
                      <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
                    </div>
                  )
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
