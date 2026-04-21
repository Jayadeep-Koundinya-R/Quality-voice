import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShopCardHorizontal } from '../components/common/ShopCard';
import { SkeletonShopCardHorizontal } from '../components/common/SkeletonCard';
import { getShops } from '../utils/api';
import { useLocation } from '../context/LocationContext';
import { Search, X, MapPin, SlidersHorizontal, Star, Compass, Sparkles } from 'lucide-react';
import '../styles/Search.css';

const CATEGORIES = ['All', 'Food', 'Services', 'Shops', 'Products'];
const RATING_OPTIONS = [
  { label: 'Any rating', value: 0 },
  { label: '3+ stars',   value: 3 },
  { label: '4+ stars',   value: 4 },
  { label: '4.5+ stars', value: 4.5 },
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useLocation();

  const [query, setQuery]           = useState('');
  const [category, setCategory]     = useState('All');
  const [minRating, setMinRating]   = useState(0);
  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(false);
  const [page, setPage]             = useState(1);
  const [showFilters, setFilters]   = useState(false);
  const [resultError, setResultError] = useState('');

  const [suggestions, setSuggestions]       = useState([]);
  const [showSuggest, setShowSuggest]       = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const suggestRef   = useRef(null);
  const inputRef     = useRef(null);
  const debounceRef  = useRef(null);
  const suggestDebRef = useRef(null);
  const urlSyncRef = useRef(null);
  const sentinelRef = useRef(null);
  const pagingRef = useRef(false);

  const fetchPage = useCallback(async (q, cat, rating, targetPage, replace = false) => {
    if (!replace && (pagingRef.current || !hasMore)) return;
    if (!replace) pagingRef.current = true;

    replace ? setLoading(true) : setLoadingMore(true);
    setResultError('');
    try {
      const { data } = await getShops({
        search: q,
        category: cat,
        minRating: rating || undefined,
        page: targetPage,
        limit: 10
      });
      const incoming = data.shops || [];
      setShops(prev => (replace ? incoming : [...prev, ...incoming]));
      setPage(targetPage);
      setHasMore(targetPage < (data.pages || 1));
    } catch {
      if (replace) setShops([]);
      setResultError('Could not load more shops. Please retry.');
    } finally {
      replace ? setLoading(false) : setLoadingMore(false);
      pagingRef.current = false;
    }
  }, [hasMore]);

  const search = useCallback(async (q, cat, rating) => {
    setPage(1);
    setHasMore(false);
    setLoadingMore(false);
    await fetchPage(q, cat, rating, 1, true);
  }, [fetchPage]);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setSuggestLoading(true);
    try {
      const { data } = await getShops({ search: q, limit: 6 });
      setSuggestions(data.shops || []);
    } catch { setSuggestions([]); }
    finally { setSuggestLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query, category, minRating), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, minRating, search]);

  useEffect(() => {
    clearTimeout(suggestDebRef.current);
    suggestDebRef.current = setTimeout(() => fetchSuggestions(query), 200);
    return () => clearTimeout(suggestDebRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const h = e => { if (suggestRef.current && !suggestRef.current.contains(e.target)) setShowSuggest(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (loading || !hasMore || !sentinelRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchPage(query, category, minRating, page + 1, false);
        }
      },
      { root: null, rootMargin: '220px 0px', threshold: 0.01 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, fetchPage, query, category, minRating]);

  const activeFilters = (category !== 'All' ? 1 : 0) + (minRating > 0 ? 1 : 0);
  const total = shops.length;
  const locationLabel = location.city ? `${location.area ? location.area + ', ' : ''}${location.city}` : 'Location not set';
  const externalQuery = searchParams.get('q') || '';

  useEffect(() => {
    setQuery(prev => (prev === externalQuery ? prev : externalQuery));
  }, [externalQuery]);

  useEffect(() => {
    clearTimeout(urlSyncRef.current);
    urlSyncRef.current = setTimeout(() => {
      if (query === externalQuery) return;
      const nextParams = new URLSearchParams(searchParams);
      if (query.length > 0) {
        nextParams.set('q', query);
      } else {
        nextParams.delete('q');
      }
      setSearchParams(nextParams, { replace: true });
    }, 180);

    return () => clearTimeout(urlSyncRef.current);
  }, [query, externalQuery, searchParams, setSearchParams]);

  return (
    <div className="search-page">
      <div className="content-container">
        <section className="search-hero">
          <div>
            <p className="search-hero-eyebrow">Smart discovery</p>
            <h1 className="search-hero-title">Find trusted shops faster</h1>
            <p className="search-hero-sub">
              Explore top-rated places with live filters, local ranking, and instant results.
            </p>
          </div>
          <div className="search-hero-pill">
            <Compass size={14} />
            {locationLabel}
          </div>
        </section>

        {/* ── Search bar ── */}
        <div className="search-top">
          <div className="search-bar-wrap" ref={suggestRef}>
            <div className="search-bar">
              <Search size={17} className="search-bar-icon" />
              <input
                ref={inputRef}
                className="search-bar-input"
                type="text"
                placeholder="Search shops, areas, categories..."
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggest(true); }}
                onFocus={() => query.length >= 2 && setShowSuggest(true)}
                aria-label="Search shops"
                autoFocus
                autoComplete="off"
              />
              {query && (
                <button className="search-clear" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }} aria-label="Clear">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Autocomplete */}
            {showSuggest && query.length >= 2 && (
              <div className="suggest-dropdown">
                {suggestLoading ? (
                  <div className="suggest-loading">Searching…</div>
                ) : suggestions.length === 0 ? (
                  <div className="suggest-empty">No results for "{query}"</div>
                ) : suggestions.map(shop => (
                  <button key={shop._id} className="suggest-item" onClick={() => { setShowSuggest(false); navigate(`/shop/${shop._id}`); }}>
                    <span className="suggest-emoji">
                      {shop.category === 'Food' ? '🍽️' : shop.category === 'Services' ? '🔧' : shop.category === 'Shops' ? '🛍️' : '📦'}
                    </span>
                    <span className="suggest-info">
                      <span className="suggest-name">{shop.name}</span>
                      <span className="suggest-meta">{shop.category} · {shop.area}, {shop.city}</span>
                    </span>
                    {shop.averageRating > 0 && (
                      <span className="suggest-rating"><Star size={11} fill="var(--accent)" color="var(--accent)" /> {shop.averageRating.toFixed(1)}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="search-meta">
            <span className="search-loc"><MapPin size={13} /> {total} result{total === 1 ? '' : 's'}</span>
            <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setFilters(p => !p)}>
              <SlidersHorizontal size={14} />
              Filters
              {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <span className="filter-row-label">Category</span>
              <div className="filter-chips">
                {CATEGORIES.map(c => (
                  <button key={c} className={`filter-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <span className="filter-row-label">Min Rating</span>
              <div className="filter-chips">
                {RATING_OPTIONS.map(opt => (
                  <button key={opt.value} className={`filter-chip ${minRating === opt.value ? 'active' : ''}`} onClick={() => setMinRating(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button className="clear-filters" onClick={() => { setCategory('All'); setMinRating(0); }}>Clear all filters</button>
            )}
          </div>
        )}

        {/* ── Results ── */}
        <div className="search-results">
          {activeFilters > 0 && (
            <div className="search-active-filters">
              <Sparkles size={14} />
              <span>
                Active: {category !== 'All' ? category : 'All categories'}
                {minRating > 0 ? ` · ${minRating}+ stars` : ''}
              </span>
            </div>
          )}

          {loading ? (
            <div>
              {[1,2,3,4].map(i => <SkeletonShopCardHorizontal key={i} />)}
            </div>
          ) : (
            <>
              {shops.length > 0 && (
                <section>
                  <div className="results-section-label">
                    <Sparkles size={13} /> Top Rated Discoveries
                    <span className="results-count">{shops.length}</span>
                  </div>
                  {shops.map(shop => <ShopCardHorizontal key={shop._id} shop={shop} />)}
                </section>
              )}

              {resultError && (
                <div className="search-load-error">
                  {resultError}
                  <button onClick={() => fetchPage(query, category, minRating, page + 1, false)}>Retry</button>
                </div>
              )}

              {loadingMore && (
                <div className="search-loading-more">
                  <div className="spinner" />
                  <span>Loading more top rated shops...</span>
                </div>
              )}

              {!hasMore && shops.length > 0 && (
                <div className="search-end-feed">You have reached the end of results.</div>
              )}

              <div ref={sentinelRef} className="search-feed-sentinel" aria-hidden="true" />

              {total === 0 && (
                <div className="empty-state" style={{ marginTop: 32 }}>
                  <div className="empty-state-icon"><Search size={28} /></div>
                  <h3>Nothing found</h3>
                  <p>{query ? `No shops match "${query}". Try a different name or area.` : 'Start typing to search for shops near you.'}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
