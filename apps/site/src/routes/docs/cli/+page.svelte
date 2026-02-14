<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { Info } from 'lucide-svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>CLI Reference</h1>

  <p class="lead">
    The <code>@sveltopia/colors</code> CLI generates palettes from the command line or interactively.
  </p>

  <h2>generate</h2>

  <p>
    Generates a complete color palette from your brand colors.
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code='npx @sveltopia/colors generate --colors "#FF4F00,#1A1A1A" --format tailwind,shadcn'
    language="bash"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h3>Flags</h3>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Flag</th>
          <th>Alias</th>
          <th>Description</th>
          <th>Default</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--colors</code></td>
          <td><code>-c</code></td>
          <td>Comma-separated hex colors (up to 7)</td>
          <td><em>interactive</em></td>
        </tr>
        <tr>
          <td><code>--format</code></td>
          <td><code>-f</code></td>
          <td>Output formats: <code>css</code>, <code>json</code>, <code>tailwind</code>, <code>tailwind-v3</code>, <code>radix</code>, <code>panda</code>, <code>shadcn</code>, <code>all</code></td>
          <td><code>css,json</code></td>
        </tr>
        <tr>
          <td><code>--output</code></td>
          <td><code>-o</code></td>
          <td>Output directory</td>
          <td><code>./colors</code></td>
        </tr>
        <tr>
          <td><code>--config</code></td>
          <td></td>
          <td>Path to config file</td>
          <td><code>colors.config.json</code></td>
        </tr>
        <tr>
          <td><code>--prefix</code></td>
          <td><code>-p</code></td>
          <td>CSS variable prefix (e.g., <code>my-</code> for <code>--my-red-9</code>)</td>
          <td><em>none</em></td>
        </tr>
        <tr>
          <td><code>--verbose</code></td>
          <td><code>-v</code></td>
          <td>Show tuning profile, anchors, and custom rows</td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>--dry-run</code></td>
          <td></td>
          <td>Preview output without writing files</td>
          <td><code>false</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3>Generated files</h3>

  <p>
    Depending on the formats you choose, the CLI writes these files to your output directory:
  </p>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Format</th>
          <th>File</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>css</code></td>
          <td><code>colors.css</code></td>
          <td>CSS custom properties for all scales</td>
        </tr>
        <tr>
          <td><code>json</code></td>
          <td><code>colors.json</code></td>
          <td>Structured JSON with hex, OKLCH, and P3 formats</td>
        </tr>
        <tr>
          <td><code>tailwind</code></td>
          <td><code>tailwind.css</code></td>
          <td>Tailwind v4 CSS with <code>@theme</code> block (50–950 scale)</td>
        </tr>
        <tr>
          <td><code>tailwind-v3</code></td>
          <td><code>tailwind.preset.js</code></td>
          <td>Tailwind v3 JS preset (50–950 scale)</td>
        </tr>
        <tr>
          <td><code>shadcn</code></td>
          <td><code>shadcn-colors.css</code></td>
          <td>shadcn/ui compatible CSS variables</td>
        </tr>
        <tr>
          <td><code>radix</code></td>
          <td><code>radix-colors.js</code></td>
          <td>Radix Colors compatible JS export</td>
        </tr>
        <tr>
          <td><code>panda</code></td>
          <td><code>panda.preset.ts</code></td>
          <td>Panda CSS preset</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3>Config file</h3>

  <p>
    Instead of passing flags every time, create a <code>colors.config.json</code> in your project root:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`{
  "brandColors": ["#FF4F00", "#1A1A1A"],
  "outputDir": "./colors",
  "formats": ["css", "json", "tailwind"],
  "prefix": ""
}`}
    language="json"
    filename="colors.config.json"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <p>
    Then run <code>npx @sveltopia/colors generate</code> with no flags — the CLI reads the config
    automatically.
  </p>

  <h2>dev</h2>

  <p>
    Starts an interactive dev server where you can preview and tweak your palette in real time.
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code='npx @sveltopia/colors dev --colors "#FF4F00"'
    language="bash"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h3>Flags</h3>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Flag</th>
          <th>Alias</th>
          <th>Description</th>
          <th>Default</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>--colors</code></td>
          <td><code>-c</code></td>
          <td>Comma-separated hex colors</td>
          <td><em>interactive</em></td>
        </tr>
        <tr>
          <td><code>--config</code></td>
          <td></td>
          <td>Path to config file</td>
          <td><code>colors.config.json</code></td>
        </tr>
        <tr>
          <td><code>--port</code></td>
          <td><code>-p</code></td>
          <td>Dev server port</td>
          <td><code>3000</code></td>
        </tr>
        <tr>
          <td><code>--no-open</code></td>
          <td></td>
          <td>Don't auto-open browser</td>
          <td><code>false</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 id="interactive-vs-flag-based">Interactive vs flag-based</h2>

  <p>
    The CLI supports two workflows:
  </p>

  <h3>Flag-based (CI/scripts)</h3>

  <p>
    Pass all options as flags for reproducible, scriptable generation:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code='npx @sveltopia/colors generate -c "#FF4F00,#2563EB" -f tailwind,shadcn -o ./src/colors'
    language="bash"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h3>Interactive (first-time setup)</h3>

  <p>
    Run without flags and the CLI prompts you through each decision:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`npx @sveltopia/colors generate

? Enter your brand colors (hex, comma-separated):
> #FF4F00, #1A1A1A

? Select output formats:
> css, json, tailwind

? Output directory:
> ./colors`}
    language="bash"
  />
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Info}>
    <p>
      <strong>Tip:</strong> Use <code class="rounded bg-muted px-1.5 py-0.5 text-xs">--dry-run</code> with flag-based mode to preview
      what files will be generated before writing anything to disk.
    </p>
  </KeyConcept>
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Quick Start', href: '/docs/quick-start' }}
    next={{ label: 'Frameworks', href: '/docs/frameworks' }}
  />
</div>
