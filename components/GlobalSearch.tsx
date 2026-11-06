'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  FileText,
  Newspaper,
  Search,
  ShoppingBag,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { getGlobalSearch } from '@/lib/api';
import { cloudinaryImageUrl } from '@/lib/cloudinary';
import type {
  GlobalSearchItem,
  GlobalSearchResponse,
  GlobalSearchSectionKey,
} from '@/lib/types';

type SearchFilter = 'all' | GlobalSearchSectionKey;

const FILTERS: Array<{ key: SearchFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'articles', label: 'Articles' },
  { key: 'members', label: 'Members' },
  { key: 'news', label: 'News' },
  { key: 'groups', label: 'Groups' },
  { key: 'products', label: 'Products' },
];

function emptyResults(query = ''): GlobalSearchResponse {
  return {
    query,
    total: 0,
    sections: FILTERS.filter((filter) => filter.key !== 'all').map((filter) => ({
      key: filter.key as GlobalSearchSectionKey,
      label: filter.key === 'news' ? 'Community news' : filter.label,
      items: [],
    })),
  };
}

function SectionIcon({ section }: { section: GlobalSearchSectionKey }) {
  if (section === 'articles') return <FileText size={17} aria-hidden="true" />;
  if (section === 'members') return <UserRound size={17} aria-hidden="true" />;
  if (section === 'news') return <Newspaper size={17} aria-hidden="true" />;
  if (section === 'groups') return <UsersRound size={17} aria-hidden="true" />;
  return <ShoppingBag size={17} aria-hidden="true" />;
}

function SearchResultLink({
  item,
  section,
  onSelect,
}: {
  item: GlobalSearchItem;
  section: GlobalSearchSectionKey;
  onSelect: () => void;
}) {
  return (
    <Link className="global-search-result" href={item.href} onClick={onSelect}>
      <span className="global-search-result__media">
        {item.image ? (
          <img src={cloudinaryImageUrl(item.image, 160)} alt="" />
        ) : (
          <SectionIcon section={section} />
        )}
      </span>
      <span className="global-search-result__copy">
        <strong>{item.title}</strong>
        <small>{item.subtitle}</small>
        {item.description ? <span>{item.description}</span> : null}
      </span>
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [results, setResults] = useState<GlobalSearchResponse>(() => emptyResults());
  const [loading, setLoading] = useState(false);

  function closeSearch() {
    setOpen(false);
  }

  function openSearch() {
    setOpen(true);
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]');
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const isSlash = event.key === '/' && !isTyping;

      if (isShortcut || isSlash) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30);

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    const controller = new AbortController();
    let disposed = false;

    if (normalizedQuery.length < 2) {
      setResults(emptyResults(normalizedQuery));
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      const response = await getGlobalSearch(normalizedQuery, controller.signal);
      if (!disposed) {
        setResults(response);
        setLoading(false);
      }
    }, 280);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const visibleSections = useMemo(() => {
    if (activeFilter === 'all') return results.sections.filter((section) => section.items.length > 0);
    return results.sections.filter((section) => section.key === activeFilter && section.items.length > 0);
  }, [activeFilter, results.sections]);

  function countFor(filter: SearchFilter) {
    if (filter === 'all') return results.total;
    return results.sections.find((section) => section.key === filter)?.items.length ?? 0;
  }

  function selectFirstResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = visibleSections[0]?.items[0];
    if (!firstResult) return;
    closeSearch();
    router.push(firstResult.href);
  }

  function focusFirstResult(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'ArrowDown') return;
    const firstLink = resultsRef.current?.querySelector<HTMLAnchorElement>('.global-search-result');
    if (!firstLink) return;
    event.preventDefault();
    firstLink.focus();
  }

  return (
    <>
      <button
        type="button"
        className="global-search-trigger"
        aria-label="Search Asiance"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openSearch}
      >
        <Search size={16} aria-hidden="true" />
        <span>Search anything</span>
      </button>

      {open && typeof document !== 'undefined' ? createPortal(
        <div className="global-search-layer">
          <button type="button" className="global-search-backdrop" aria-label="Close search" onClick={closeSearch} />
          <section className="global-search-dialog" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
            <div className="global-search-dialog__header">
              <div>
                <span className="eyebrow">Discover Asiance</span>
                <h2 id="global-search-title">Search everything</h2>
              </div>
              <button type="button" className="global-search-close" aria-label="Close search" onClick={closeSearch}>
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <form className="global-search-form" role="search" onSubmit={selectFirstResult}>
              <Search size={21} aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={focusFirstResult}
                placeholder="Search all of Asiance…"
                aria-label="Search all Asiance content"
                autoComplete="off"
                spellCheck="false"
              />
              {query ? (
                <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </form>

            <div className="global-search-filters" aria-label="Search result type">
              {FILTERS.map((filter) => (
                <button
                  type="button"
                  className={activeFilter === filter.key ? 'is-active' : ''}
                  aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  key={filter.key}
                >
                  {filter.label}
                  {query.trim().length >= 2 && !loading ? <span>{countFor(filter.key)}</span> : null}
                </button>
              ))}
            </div>

            <div className="global-search-body" ref={resultsRef} aria-live="polite">
              {query.trim().length < 2 ? (
                <div className="global-search-state">
                  <Search size={25} aria-hidden="true" />
                  <strong>Find anything in one place</strong>
                  <p>Enter at least two characters to search across the whole community.</p>
                </div>
              ) : loading ? (
                <div className="global-search-loading" aria-label="Searching">
                  {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
                </div>
              ) : visibleSections.length === 0 ? (
                <div className="global-search-state">
                  <Search size={25} aria-hidden="true" />
                  <strong>No results for “{query.trim()}”</strong>
                  <p>Try a broader word, a member name, or a product category.</p>
                </div>
              ) : (
                <div className={`global-search-sections${activeFilter === 'all' ? '' : ' is-filtered'}`}>
                  {visibleSections.map((section) => (
                    <section className="global-search-section" aria-labelledby={`global-search-${section.key}`} key={section.key}>
                      <header>
                        <span><SectionIcon section={section.key} /></span>
                        <h3 id={`global-search-${section.key}`}>{section.label}</h3>
                        <small>{section.items.length}</small>
                      </header>
                      <div>
                        {section.items.map((item) => (
                          <SearchResultLink item={item} section={section.key} onSelect={closeSearch} key={`${section.key}-${item.id}`} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <footer className="global-search-footer">
              <span><kbd>↓</kbd> browse results</span>
              <span><kbd>Enter</kbd> open first result</span>
              <span><kbd>Esc</kbd> close</span>
            </footer>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
