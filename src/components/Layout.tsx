import { Outlet, Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-brand-bg/80 border-b border-brand-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <Link
            to="/"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-brand-textPrimary tracking-tight">
              FAQ Skip
            </span>
          </Link>
          <nav>
            <Link
              to="/login"
              className="text-brand-textSecondary hover:text-brand-textPrimary transition-colors duration-200 text-sm font-medium"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-brand-border bg-brand-bg mt-auto">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl">
          <p className="text-brand-textSecondary text-sm text-center md:text-left font-medium">
            FAQ Skip — Perguntas frequentes da plataforma
          </p>
          <a
            href="https://goskip.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-textSecondary hover:text-brand-textPrimary transition-colors duration-200 text-sm font-medium"
          >
            goskip.dev
          </a>
        </div>
      </footer>
    </div>
  )
}
