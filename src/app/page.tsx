export default function Home() {
  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <main className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-h1 text-text">The Potential</h1>
          <p className="text-body text-muted">
            Design System Verification - Task 1.3
          </p>
        </header>

        {/* Color Palette Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Color Palette</h2>

          {/* Primary Colors */}
          <div className="space-y-3">
            <h3 className="text-h3 text-muted">Primary Colors</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary" />
                <span className="text-caption">Primary #0079FF</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary-light" />
                <span className="text-caption">Primary Light #00E5FF</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary-10" />
                <span className="text-caption">Primary 10%</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-primary-20" />
                <span className="text-caption">Primary 20%</span>
              </div>
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="space-y-3">
            <h3 className="text-h3 text-muted">Semantic Colors</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-success" />
                <span className="text-caption">Success</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-warning" />
                <span className="text-caption">Warning</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-error" />
                <span className="text-caption">Error</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-info" />
                <span className="text-caption">Info</span>
              </div>
            </div>
          </div>

          {/* Background Colors */}
          <div className="space-y-3">
            <h3 className="text-h3 text-muted">Background Colors</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl border border-border bg-background" />
                <span className="text-caption">Background #000</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-card" />
                <span className="text-caption">Card #121212</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-2xl bg-card-secondary" />
                <span className="text-caption">Card Secondary</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Cards (24px / rounded-3xl)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Default Card */}
            <div className="card p-5">
              <h3 className="text-section mb-2">Default Card</h3>
              <p className="text-body-sm text-muted">
                Background: #121212, Border: white/8%, Border radius: 24px
              </p>
            </div>

            {/* Interactive Card */}
            <div className="card-interactive cursor-pointer p-5">
              <h3 className="text-section mb-2">Interactive Card</h3>
              <p className="text-body-sm text-muted">
                Hover to see scale + border color change + glow effect
              </p>
            </div>

            {/* Glow Card */}
            <div className="card-glow p-5">
              <h3 className="text-section mb-2">Glow Card</h3>
              <p className="text-body-sm text-muted">
                Primary glow shadow effect always visible
              </p>
            </div>

            {/* Secondary Card */}
            <div className="card-secondary p-5">
              <h3 className="text-section mb-2">Secondary Card</h3>
              <p className="text-body-sm text-muted">
                Background: #1C1C1E (elevated element)
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Buttons</h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Primary Button */}
            <button className="btn h-12 rounded-2xl bg-primary px-8 text-white hover:bg-primary-hover">
              Primary Button
            </button>

            {/* Primary Glow Button (CTA) */}
            <button className="btn btn-primary-glow h-12 rounded-2xl px-8">
              CTA with Glow
            </button>

            {/* Outline Button */}
            <button className="btn h-12 rounded-2xl border border-border bg-transparent px-8 text-white hover:border-primary-40">
              Outline Button
            </button>

            {/* Ghost Button */}
            <button className="btn h-12 rounded-2xl bg-transparent px-8 text-primary hover:bg-primary-10">
              Ghost Button
            </button>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Badges (Pill Shape)</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge badge-primary">Primary Badge</span>
            <span className="badge badge-success">Available</span>
            <span className="badge badge-warning">D-3 Deadline</span>
            <span className="badge badge-error">Urgent</span>
            <span className="badge badge-info">Info Badge</span>
          </div>
        </section>

        {/* Glow Effects Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Glow Effects (Hover States)</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="hover-glow cursor-pointer rounded-3xl border border-border bg-card p-5 transition-all duration-150">
              <h3 className="text-section mb-2">Hover Glow</h3>
              <p className="text-body-sm text-muted">
                Hover to see primary glow effect
              </p>
            </div>

            <div className="hover-glow-strong cursor-pointer rounded-3xl border border-border bg-card p-5 transition-all duration-150">
              <h3 className="text-section mb-2">Strong Glow</h3>
              <p className="text-body-sm text-muted">
                Hover for stronger cyan glow
              </p>
            </div>

            <div className="glow-primary animate-glow-pulse rounded-3xl border border-primary-40 bg-card p-5">
              <h3 className="text-section mb-2">Pulsing Glow</h3>
              <p className="text-body-sm text-muted">
                Animated glow pulse effect
              </p>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Typography</h2>
          <div className="space-y-4">
            <p className="text-display">Display (48px, 800)</p>
            <p className="text-h1">Heading 1 (40px, 800)</p>
            <p className="text-h2">Heading 2 (32px, 700)</p>
            <p className="text-h3">Heading 3 (24px, 700)</p>
            <p className="text-section">Section Title (20px, 800)</p>
            <p className="text-body-lg">Body Large (18px, 600)</p>
            <p className="text-body">Body Regular (16px, 400)</p>
            <p className="text-body-semibold">Body Semibold (16px, 600)</p>
            <p className="text-body-sm">Body Small (14px, 400)</p>
            <p className="text-caption">Caption (12px, 500)</p>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-6">
          <h2 className="text-h2">Form Inputs (48px height)</h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="mb-2 block text-body-sm font-semibold">
                Default Input
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Enter text..."
              />
            </div>
            <div>
              <label className="mb-2 block text-body-sm font-semibold">
                Error State
              </label>
              <input
                type="text"
                className="input input-error w-full"
                placeholder="Invalid input"
              />
              <p className="mt-1 text-caption text-error">
                This field is required
              </p>
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-h2">Loading States</h2>
          <div className="flex flex-wrap gap-4">
            {/* Skeleton */}
            <div className="skeleton h-24 w-48 rounded-3xl" />

            {/* Spinner */}
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>

            {/* Pulsing Indicator */}
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card">
              <div className="animate-pulse-indicator h-4 w-4 rounded-full bg-success" />
            </div>
          </div>
        </section>

        {/* Spacing Reference */}
        <section className="space-y-6">
          <h2 className="text-h2">Spacing (8px Base)</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="h-1 w-1 bg-primary" />
              <span className="text-caption">4px</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-2 w-2 bg-primary" />
              <span className="text-caption">8px</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-3 bg-primary" />
              <span className="text-caption">12px</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-4 w-4 bg-primary" />
              <span className="text-caption">16px</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-5 w-5 bg-primary" />
              <span className="text-caption">20px</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-6 w-6 bg-primary" />
              <span className="text-caption">24px</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-8 bg-primary" />
              <span className="text-caption">32px</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center">
          <p className="text-muted">
            Task 1.3: Configure Tailwind CSS v4 with Design Tokens - Complete
          </p>
        </footer>
      </main>
    </div>
  );
}
