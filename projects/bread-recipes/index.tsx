import "./tailwind.css";
import "./index.scss";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const title = "Bread recipe index";
export const description =
  "A small library to collect and browse your bread recipe ideas.";

const STORAGE_KEY = "bread-recipes";

export type BreadRecipe = {
  id: string;
  name: string;
  category: string;
  notes: string;
  addedAt: string;
};

const CATEGORIES = [
  "Sourdough",
  "Sandwich loaf",
  "Quick bread",
  "Rolls & buns",
  "Flatbread",
  "Sweet / enriched",
  "Other",
] as const;

function loadRecipes(): BreadRecipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecipes(recipes: BreadRecipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function RecipeIndex() {
  const [recipes, setRecipes] = useState<BreadRecipe[]>(loadRecipes);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    saveRecipes(recipes);
  }, [recipes]);

  const filtered = recipes.filter((r) => {
    const matchSearch =
      !search.trim() ||
      r.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      r.notes.toLowerCase().includes(search.trim().toLowerCase());
    const matchCategory =
      !categoryFilter || r.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const addRecipe = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setRecipes((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: trimmedName,
        category,
        notes: notes.trim(),
        addedAt: new Date().toISOString(),
      },
    ]);
    setName("");
    setNotes("");
  };

  const removeRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <nav className="flex items-center border-b border-border pb-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← All projects
          </Link>
        </nav>

        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bread recipe index
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and browse your bread ideas. Stored in this browser only.
          </p>
        </header>

        {/* Add new */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Add an idea
          </h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Recipe or idea name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRecipe()}
                className="h-9 min-w-[180px] flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Recipe name"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addRecipe}
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add
              </button>
            </div>
            <input
              type="text"
              placeholder="Notes or source (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRecipe()}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Notes"
            />
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full min-w-[200px] max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[240px]"
            aria-label="Search"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium text-card-foreground">
                  {r.name}
                </span>
                <span className="ml-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {r.category}
                </span>
                {r.notes && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.notes}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeRecipe(r.id)}
                className="shrink-0 text-sm text-destructive hover:underline"
                aria-label={`Remove ${r.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="rounded-xl border border-border bg-card py-8 text-center text-sm text-muted-foreground">
            {recipes.length === 0
              ? "No recipes yet. Add one above."
              : "No recipes match your search or filter."}
          </p>
        )}
      </div>
    </div>
  );
}

export default RecipeIndex;
export const routes = [{ path: "/", Component: () => null }];
