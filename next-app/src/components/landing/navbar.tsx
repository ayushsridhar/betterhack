import Link from "next/link"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-text-primary">
          Picasso
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            Features
          </a>
          <Link
            href="/editor"
            className="text-sm px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            Editor
          </Link>
        </div>
      </div>
    </nav>
  )
}
