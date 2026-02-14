<script lang="ts">
  import { page } from '$app/state';
  import { X } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let { children } = $props();

  // Mobile menu state
  let mobileMenuOpen = $state(false);

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Listen for toggle event from global header
  onMount(() => {
    function handleToggle() {
      mobileMenuOpen = !mobileMenuOpen;
    }
    window.addEventListener('toggle-mobile-menu', handleToggle);

    // Auto-link headings in docs content
    function linkifyHeadings() {
      const article = document.querySelector('article');
      if (!article) return;

      const headings = article.querySelectorAll('h2, h3');
      headings.forEach((heading) => {
        // Skip if already linkified
        if (heading.querySelector('.heading-anchor')) return;

        // Generate ID from text if not already set
        if (!heading.id) {
          heading.id = heading.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') ?? '';
        }

        // Wrap contents in an anchor link (Radix-style)
        const anchor = document.createElement('a');
        anchor.href = `#${heading.id}`;
        anchor.className = 'heading-anchor';
        anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);

        // Move heading's children into the anchor
        while (heading.firstChild) {
          anchor.appendChild(heading.firstChild);
        }

        // Add the link icon SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        svg.classList.add('heading-anchor-icon');
        svg.innerHTML = '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
        anchor.appendChild(svg);

        heading.appendChild(anchor);
      });
    }

    // Run on initial mount and after navigation
    linkifyHeadings();
    const observer = new MutationObserver(linkifyHeadings);
    const article = document.querySelector('article');
    if (article) {
      observer.observe(article, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('toggle-mobile-menu', handleToggle);
      observer.disconnect();
    };
  });

  const navItems = [
    { href: '/docs', label: 'Introduction' },
    { href: '/docs/quick-start', label: 'Quick Start' },
    { href: '/docs/cli', label: 'CLI Reference' },
    { href: '/docs/frameworks', label: 'Frameworks' },
    { href: '/docs/color-theory', label: 'Color Theory' },
    { href: '/docs/alpha', label: 'Alpha Colors' },
    { href: '/docs/accessibility', label: 'Accessibility' },
    { href: '/docs/api-reference', label: 'API Reference' },
    { href: '/docs/ai-docs', label: 'AI Docs' }
  ];
</script>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
  <div
    class="fixed inset-0 z-40 bg-black/50 md:hidden"
    onclick={closeMobileMenu}
    onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
    role="button"
    tabindex="-1"
    aria-label="Close mobile menu"
  ></div>
{/if}

<!-- Docs Container with Sidebar -->
<div class="w-full px-4 pb-6 lg:container lg:mx-auto lg:py-6">
  <div class="flex flex-col gap-6 lg:flex-row">
    <!-- Sidebar Navigation (Left) -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r bg-background p-4 transition-transform lg:static lg:z-0 lg:block lg:w-64 lg:shrink-0 lg:border-r-0 lg:p-0 {mobileMenuOpen
        ? 'translate-x-0'
        : '-translate-x-full lg:translate-x-0'}"
    >
      <!-- Close button (mobile only) -->
      <div class="mb-4 flex items-center justify-between lg:hidden">
        <h3 class="text-lg font-semibold">Menu</h3>
        <button
          onclick={closeMobileMenu}
          class="rounded-md p-2 hover:bg-muted"
          aria-label="Close menu"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="space-y-4 lg:sticky lg:top-20">
        <div>
          <a href="/docs" class="mb-4 hidden text-lg font-semibold hover:text-primary lg:block"
            >Documentation</a
          >
          <nav class="space-y-2">
            {#each navItems as item}
              <a
                href={item.href}
                onclick={closeMobileMenu}
                class="block rounded px-3 py-2 text-sm font-medium hover:bg-muted {page.url
                  .pathname === item.href
                  ? 'bg-muted font-semibold'
                  : ''}"
              >
                {item.label}
              </a>
            {/each}
          </nav>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <article class="flex-1 lg:w-0" data-pagefind-meta="category:Documentation">
      <div class="w-full px-4 py-12 lg:max-w-5xl">
        {@render children()}
      </div>
    </article>
  </div>
</div>
