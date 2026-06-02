import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  FileQuestion,
  Tags,
  PlayCircle,
  Users,
  Activity,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Painel', end: true },
  { to: '/admin/perguntas', icon: FileQuestion, label: 'Perguntas' },
  { to: '/admin/categorias', icon: Tags, label: 'Categorias' },
  { to: '/admin/drops', icon: PlayCircle, label: 'Drops' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { to: '/admin/logs', icon: Activity, label: 'Logs' },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-textPrimary flex flex-col md:flex-row font-sans">
      {/* Background Orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[15%] -top-[15%] h-[36rem] w-[36rem] rounded-full bg-brand-primary/[0.14] blur-[100px]" />
        <div className="absolute -right-[15%] top-[20%] h-[32rem] w-[32rem] rounded-full bg-brand-accent/[0.10] blur-[90px]" />
      </div>

      {/* Mobile Topbar */}
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-border bg-brand-bg/60 backdrop-blur-xl px-4">
        <div className="flex items-center gap-3">
          <img
            src="/skip.png"
            alt="Skip"
            width={32}
            height={32}
            className="w-8 h-8 rounded-xl shadow-glow shrink-0"
          />
          <span className="font-semibold">FAQ Skip</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="text-brand-textSecondary hover:text-brand-textPrimary hover:bg-white/[0.04]"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-brand-border bg-brand-bg/60 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-brand-border/50">
          <img
            src="/skip.png"
            alt="Skip"
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl shadow-glow shrink-0"
          />
          <span className="font-bold text-lg tracking-tight">FAQ Skip</span>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-primarySoft text-brand-primary border border-brand-primary/30'
                    : 'text-brand-textSecondary hover:text-brand-textPrimary hover:bg-white/[0.04]',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border/50 flex flex-col gap-3">
          <div className="px-3 text-xs text-brand-textMuted truncate">{user?.email}</div>
          <Button
            variant="outline"
            className="w-full justify-start text-brand-textSecondary hover:text-brand-textPrimary bg-white/[0.02] border-brand-border hover:bg-white/[0.06]"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pb-16 md:pb-0 min-h-screen flex flex-col">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-16 border-t border-brand-border bg-brand-bg/80 backdrop-blur-xl px-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors duration-200',
                isActive
                  ? 'text-brand-primary'
                  : 'text-brand-textSecondary hover:text-brand-textPrimary',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
