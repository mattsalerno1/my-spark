import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom'
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { List, LayoutGrid } from 'lucide-react'
import { getProjectRoutes, projectMeta, type ProjectMeta } from './registry'

const base = import.meta.env.BASE_URL
const INITIAL_VISIBLE = 12
const LOAD_MORE = 12

type SortKey = 'name-asc' | 'name-desc'
type ViewMode = 'list' | 'tile'

function filterAndSort(
  list: ProjectMeta[],
  search: string,
  sort: SortKey
): ProjectMeta[] {
  const q = search.trim().toLowerCase()
  const out = q
    ? list.filter(
        (p) =>
          (p.name ?? '').toLowerCase().includes(q) ||
          (p.title ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
      )
    : [...list]
  const asc = sort === 'name-asc'
  out.sort((a, b) => {
    const cmp = (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
    return asc ? cmp : -cmp
  })
  return out
}

function HomePage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('name-asc')
  const [viewMode, setViewMode] = useState<ViewMode>('tile')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () => filterAndSort(projectMeta, search, sort),
    [search, sort]
  )
  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  )
  const hasMore = visible.length < filtered.length

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + LOAD_MORE, filtered.length))
  }, [filtered.length])

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [search, sort])

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return
    const el = sentinelRef.current
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '200px', threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadMore, visible.length])

  return (
    <main className="home-page-bg min-h-screen text-neutral-100">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 text-center">
        <h1 className="mb-2 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          <span className="home-title-wrap">
            <span className="home-title-gradient">PROJECTS</span>
          </span>
        </h1>
        <p className="mb-10 text-neutral-400">
          Add a folder under <code className="rounded bg-[var(--klaviyo-bg-elevated)] px-1.5 py-0.5 font-mono text-sm text-neutral-300">projects/</code> with an <code className="rounded bg-[var(--klaviyo-bg-elevated)] px-1.5 py-0.5 font-mono text-sm text-neutral-300">index.tsx</code> to add one.
        </p>

        {projectMeta.length === 0 ? (
          <p className="rounded-xl border border-white/[0.08] bg-[var(--klaviyo-bg-elevated)] p-6 text-neutral-400">
            No projects yet. Add <code className="font-mono">projects/my-name/index.tsx</code> (export default + optional <code className="font-mono">routes</code>).
          </p>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              <input
                type="search"
                placeholder="Search projects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="home-input-glow h-10 flex-1 min-w-[200px] rounded-lg border border-white/[0.08] bg-[var(--klaviyo-bg-elevated)] px-3 text-neutral-100 placeholder-neutral-500 focus:border-[var(--klaviyo-burnt-sienna)] focus:outline-none focus:ring-1 focus:ring-[var(--klaviyo-burnt-sienna)]/50"
                aria-label="Search projects"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="home-select h-10 rounded-lg border border-white/[0.08] bg-[var(--klaviyo-bg-elevated)] px-3 text-neutral-100 focus:border-[var(--klaviyo-burnt-sienna)] focus:outline-none focus:ring-1 focus:ring-[var(--klaviyo-burnt-sienna)]/50"
                aria-label="Sort by project name"
              >
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
              </select>
              <div className="home-view-toggle-wrap relative flex rounded-lg border border-white/[0.08] bg-[var(--klaviyo-bg-elevated)] p-0.5">
                <span
                  className="home-view-toggle-pill absolute left-0.5 top-0.5 bottom-0.5 w-[calc(50%-4px)] rounded-md bg-[var(--klaviyo-burnt-sienna)]"
                  style={{ marginLeft: viewMode === 'tile' ? 'calc(50% + 2px)' : '0' }}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-200 data-[active]:text-white"
                  data-active={viewMode === 'list' || undefined}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="sr-only sm:not-sr-only sm:inline">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('tile')}
                  className="relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-200 data-[active]:text-white"
                  data-active={viewMode === 'tile' || undefined}
                  aria-label="Tile view"
                  aria-pressed={viewMode === 'tile'}
                >
                  <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="sr-only sm:not-sr-only sm:inline">Tile</span>
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="text-neutral-500">No projects match your search.</p>
            ) : viewMode === 'list' ? (
              <ul className="flex flex-col gap-2">
                {visible.map(({ name, title, description, preview }) => (
                  <li key={name}>
                    <Link
                      to={name}
                      className="home-card-glow group flex items-stretch gap-0 rounded-xl border border-white/[0.08] bg-[var(--klaviyo-bg-elevated)] overflow-hidden hover:border-[var(--klaviyo-burnt-sienna)]/30 hover:bg-white/[0.06]"
                    >
                      {preview != null ? (
                        <span className="flex min-h-full w-24 shrink-0 sm:basis-40">
                          <img
                            src={preview}
                            alt=""
                            className="h-full min-h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                          />
                        </span>
                      ) : (
                        <div className="min-h-full w-24 shrink-0 bg-white/[0.06] sm:w-40" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1 p-4 text-left">
                        <span className="block font-semibold text-white">
                          {title ?? name}
                        </span>
                        {description != null && (
                          <p className="mt-0.5 truncate text-sm text-neutral-400">
                            {description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map(({ name, title, description, preview }) => (
                  <li key={name}>
                    <Link
                      to={name}
                      className="home-card-glow group flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--klaviyo-bg-elevated)] hover:border-[var(--klaviyo-burnt-sienna)]/30 hover:bg-white/[0.06]"
                    >
                      {preview != null ? (
                        <img
                          src={preview}
                          alt=""
                          className="aspect-video w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="aspect-video w-full bg-white/[0.06]" aria-hidden />
                      )}
                      <div className="flex flex-1 flex-col p-4 text-left">
                        <span className="font-semibold text-white">
                          {title ?? name}
                        </span>
                        {description != null && (
                          <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                            {description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div ref={sentinelRef} className="h-4" aria-hidden />
          </>
        )}
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="home-page-bg-subtle flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="home-title-glow mb-4 text-6xl font-bold text-white sm:text-8xl">
        404
      </h1>
      <p className="mb-6 text-neutral-400">Page not found.</p>
      <Link
        to="/"
        className="home-back-link rounded-lg bg-[var(--klaviyo-burnt-sienna)] px-4 py-2 font-medium text-white hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  )
}

const router = createBrowserRouter(
  [
    { path: '/', element: <HomePage /> },
    ...getProjectRoutes(),
    { path: '*', element: <NotFoundPage /> },
  ],
  { basename: base.replace(/\/$/, '') || '/' }
)

export default function App() {
  return <RouterProvider router={router} />
}
