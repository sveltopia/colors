// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
  // Pagefind search result types
  interface PagefindSearchResult {
    id: string;
    data: () => Promise<PagefindDocument>;
  }

  interface PagefindDocument {
    url: string;
    excerpt: string;
    meta: {
      title?: string;
      category?: string;
      [key: string]: string | undefined;
    };
    content: string;
    word_count: number;
  }

  interface PagefindSearchResponse {
    results: PagefindSearchResult[];
    unfilteredResultCount: number;
    filters: Record<string, Record<string, number>>;
    totalFilters: Record<string, Record<string, number>>;
    timings: {
      preload: number;
      search: number;
      total: number;
    };
  }

  interface Pagefind {
    init: () => Promise<void>;
    search: (
      query: string,
      options?: { filters?: Record<string, string> },
    ) => Promise<PagefindSearchResponse>;
    debouncedSearch: (
      query: string,
      options?: { filters?: Record<string, string> },
      debounceMs?: number,
    ) => Promise<PagefindSearchResponse | null>;
    filters: () => Promise<Record<string, Record<string, number>>>;
    preload: (
      query: string,
      options?: { filters?: Record<string, string> },
    ) => Promise<void>;
  }

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  interface Window {
    pagefind?: Pagefind;
  }
}

export {};
