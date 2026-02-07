export function Footer() {
  return (
    <footer className="border-t border-border-subtle py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-tertiary">
          &copy; {new Date().getFullYear()} Omniclip. All rights reserved.
        </p>
        <a
          href="https://github.com/nicosResworworkoWorkoWorko/omniclip"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
