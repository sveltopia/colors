<script lang="ts">
  import { Search } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  interface Props {
    open: boolean;
    pagefindReady: boolean;
    onclose?: () => void;
  }

  // Use the PagefindDocument type from app.d.ts
  type SearchResult = PagefindDocument;

  let { open = $bindable(false), pagefindReady, onclose }: Props = $props();

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let selectedIndex = $state(0);
  let loading = $state(false);
  let inputElement: HTMLInputElement | undefined = $state();
  let modalElement: HTMLDivElement | undefined = $state();

  // Prevent mouseenter from hijacking selection when results re-render under cursor
  let allowMouseSelection = $state(true);

  // Force reactivity by creating derived state for each result's selected status
  let selectedUrl = $derived(results[selectedIndex]?.url ?? '');

  // Debounce timer
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) {
      results = [];
      selectedIndex = 0;
      return;
    }

    if (!pagefindReady || !window.pagefind) {
      return;
    }

    loading = true;
    try {
      const response = await window.pagefind.search(searchQuery);

      // Load the data for each result
      const loadedResults = await Promise.all(
        response.results.slice(0, 20).map((result) => result.data())
      );

      results = loadedResults;
      selectedIndex = 0;
      allowMouseSelection = false; // Prevent mouseenter from hijacking until mouse moves
    } catch (error) {
      console.error('Search failed:', error);
      results = [];
    } finally {
      loading = false;
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    query = target.value;

    // Debounce search
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 150);
  }

  function close() {
    open = false;
    onclose?.();
  }

  function clearAndClose() {
    query = '';
    results = [];
    selectedIndex = 0;
    close();
  }

  function navigateToResult(result: SearchResult) {
    const url = new URL(result.url, window.location.origin);
    clearAndClose();
    goto(url.pathname);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      clearAndClose();
      return;
    }

    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigateToResult(results[selectedIndex]);
      }
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === modalElement) {
      clearAndClose();
    }
  }

  // Focus input and handle body scroll when modal opens
  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Focus input after a tick
      setTimeout(() => {
        inputElement?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      // Clear search state when closing
      query = '';
      results = [];
      selectedIndex = 0;
    }

    return () => {
      document.body.style.overflow = '';
    };
  });

  // Scroll selected result into view
  $effect(() => {
    if (results.length > 0 && selectedIndex >= 0) {
      const selectedElement = document.querySelector(`[data-result-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  });
</script>

<div
  bind:this={modalElement}
  onclick={handleBackdropClick}
  onkeydown={(e) => e.key === 'Escape' && clearAndClose()}
  tabindex="-1"
  class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh] backdrop-blur-sm"
  class:hidden={!open}
  role="dialog"
  aria-modal="true"
  aria-label="Search"
>
  <div class="relative mx-4 w-full max-w-2xl">
    <!-- Search container -->
    <div
      class="search-container overflow-hidden rounded-xl bg-background shadow-2xl"
      style="border: 4px solid color-mix(in oklab, var(--color-primary-800) 50%, transparent);"
    >
      <!-- Search input area -->
      <div class="search-input-wrapper" class:has-content={results.length > 0}>
        <Search class="search-icon h-5 w-5 text-muted-foreground" />
        <input
          bind:this={inputElement}
          type="text"
          value={query}
          oninput={handleInput}
          onkeydown={handleKeydown}
          placeholder="Search"
          class="search-input"
          autocomplete="off"
          spellcheck="false"
        />
        <button onclick={clearAndClose} class="esc-button" aria-label="Cancel">
          <kbd
            class="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none"
          >
            esc
          </kbd>
        </button>
      </div>

      {#if !pagefindReady}
        <!-- Dev mode message -->
        <div class="p-8 text-center text-muted-foreground">
          <p class="mb-2 font-semibold">Search only available in production build</p>
          <p class="text-sm">
            Run <code class="rounded bg-muted px-2 py-1">pnpm build && pnpm preview</code> to test
            search functionality.
          </p>
        </div>
      {:else if loading}
        <!-- Loading state -->
        <div class="p-6 text-center text-muted-foreground">
          <p class="text-sm">Searching...</p>
        </div>
      {:else if query && results.length === 0}
        <!-- No results -->
        <div class="p-6 text-center text-muted-foreground">
          <p class="text-sm">No results found for "{query}"</p>
        </div>
      {:else if results.length > 0}
        <!-- Results list -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="results-container" onmousemove={() => (allowMouseSelection = true)}>
          {#each results as result, index (result.url)}
            {@const isSelected = result.url === selectedUrl}
            <a
              href={new URL(result.url, window.location.origin).pathname}
              data-result-index={index}
              class="result-item"
              class:selected={isSelected}
              onclick={(e) => {
                e.preventDefault();
                navigateToResult(result);
              }}
              onmouseenter={() => {
                if (allowMouseSelection) selectedIndex = index;
              }}
            >
              <span class="result-title">{result.meta.title || 'Untitled'}</span>
              {#if result.meta.category}
                <span class="result-category">{result.meta.category}</span>
              {/if}
              <p class="result-excerpt">{@html result.excerpt}</p>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .search-container {
    position: relative;
  }

  /* Search input wrapper */
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border-bottom: 1px solid transparent;
    height: 3.5rem;
  }

  .search-input-wrapper.has-content {
    border-bottom-color: color-mix(in oklch, var(--primary) 10%, transparent);
  }

  .search-input-wrapper :global(.search-icon) {
    position: absolute;
    left: 1rem;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: 100%;
    background-color: transparent;
    padding: 0 4rem 0 2.75rem;
    font-size: 1rem;
    font-weight: 400;
    font-family: inherit;
    outline: none;
    border: none;
    color: var(--foreground);
  }

  .search-input::placeholder {
    color: var(--muted-foreground);
    opacity: 0.8;
  }

  .esc-button {
    position: absolute;
    right: 1rem;
    display: flex;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .esc-button:hover kbd {
    background-color: var(--accent);
    color: var(--accent-foreground);
  }

  /* Results container */
  .results-container {
    max-height: 60vh;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Individual result item */
  .result-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: left;
    text-decoration: none;
    width: 100%;
    border-radius: 0.75rem;
    background-color: color-mix(in oklch, var(--muted) 30%, transparent);
    padding: 1rem 1.25rem;
    transition: all 150ms ease;
    cursor: pointer;
    border: none;
    font-family: inherit;
  }

  .result-item:hover {
    background-color: color-mix(in oklch, var(--muted) 50%, transparent);
  }

  .result-item.selected {
    background-color: color-mix(in oklch, var(--color-primary-800) 15%, transparent);
  }

  .result-item.selected:hover {
    background-color: color-mix(in oklch, var(--color-primary-800) 20%, transparent);
  }

  /* Focus ring for keyboard/tab navigation */
  .result-item:focus {
    outline: none;
  }

  .result-item:focus-visible {
    outline: 2px solid var(--color-primary-800);
    outline-offset: 2px;
  }

  /* Result title */
  .result-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--foreground);
  }

  /* Result category - right under title */
  .result-category {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-primary-800);
  }

  /* Result excerpt */
  .result-excerpt {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    line-height: 1.5;
    margin: 0;
    margin-top: 0.25rem;
  }

  /* Highlighted search terms in excerpt */
  :global(.result-excerpt mark) {
    background-color: color-mix(in oklch, var(--color-primary-800) 20%, transparent);
    color: var(--color-primary-950);
    font-weight: 500;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }

  /* Dark mode adjustments */
  :global(.dark) .result-item {
    background-color: color-mix(in oklch, var(--muted) 20%, transparent);
  }

  :global(.dark) .result-item:hover {
    background-color: color-mix(in oklch, var(--muted) 35%, transparent);
  }

  :global(.dark) .result-item.selected {
    background-color: color-mix(in oklch, var(--color-primary-800) 20%, transparent);
  }

  :global(.dark) .result-item.selected:hover {
    background-color: color-mix(in oklch, var(--color-primary-800) 25%, transparent);
  }

  :global(.dark .result-excerpt mark) {
    background-color: color-mix(in oklch, var(--color-primary-800) 25%, transparent);
    color: var(--color-primary-50);
  }
</style>
