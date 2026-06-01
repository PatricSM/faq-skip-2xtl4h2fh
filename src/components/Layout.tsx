import { Outlet, Link, useLocation } from 'react-router-dom'
import { ChatWidget } from '@/components/ChatWidget'

export default function Layout() {
  const location = useLocation()
  const showChat = !location.pathname.startsWith('/admin') && location.pathname !== '/login'

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-[20%] -top-[15%] h-[40rem] w-[40rem] rounded-full bg-brand-primary/[0.18] blur-[100px]" />
        <div className="absolute -right-[18%] top-[10%] h-[36rem] w-[36rem] rounded-full bg-brand-accent/[0.14] blur-[90px]" />
        <div className="absolute bottom-[-10%] left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-indigo-500/[0.08] blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(79,70,229,0.10),transparent_60%)]" />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-bg/60 border-b border-brand-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <Link
            to="/"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
          >
            <img
              src="/skip.png"
              alt="Skip"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl shadow-glow"
            />
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

      <footer className="border-t border-brand-border bg-brand-bg/60 backdrop-blur-md mt-auto">
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
      {showChat && <ChatWidget />}
    </div>
  )
}
