import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LayoutDashboard,
  FileQuestion,
  Tags,
  Users,
  LogOut,
  Activity,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const TILES = [
  {
    to: '/admin/perguntas',
    title: 'Perguntas',
    description: 'Gerenciar perguntas',
    icon: FileQuestion,
  },
  {
    to: '/admin/categorias',
    title: 'Categorias',
    description: 'Gerenciar categorias da FAQ',
    icon: Tags,
  },
  {
    to: '/admin/usuarios',
    title: 'Usuários',
    description: 'Gerenciar administradores',
    icon: Users,
  },
  {
    to: '/admin/logs',
    title: 'Logs de Atividade',
    description: 'Auditoria e histórico',
    icon: Activity,
  },
]

export default function AdminDashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="relative flex flex-col min-h-screen bg-brand-bg text-brand-textPrimary overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-[15%] -top-[15%] h-[36rem] w-[36rem] rounded-full bg-brand-primary/[0.14] blur-[100px]" />
        <div className="absolute -right-[15%] top-[20%] h-[32rem] w-[32rem] rounded-full bg-brand-accent/[0.10] blur-[90px]" />
      </div>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-brand-border bg-brand-bg/60 backdrop-blur-xl px-6">
        <div className="flex items-center gap-3 font-semibold">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="text-brand-textPrimary">Painel Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-brand-textSecondary hidden sm:inline-flex">
            Logado como {user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="bg-white/[0.03] border-brand-border text-brand-textPrimary hover:bg-white/[0.06] hover:text-brand-textPrimary"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary">
              Visão Geral
            </h1>
            <p className="text-brand-textSecondary">
              Bem-vindo ao painel de controle do FAQ.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TILES.map((tile) => (
              <Link key={tile.to} to={tile.to} className="block group">
                <Card className="h-full bg-white/[0.03] border-brand-border hover:border-brand-primary/40 hover:bg-brand-primarySoft/30 transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-brand-textPrimary">
                      {tile.title}
                    </CardTitle>
                    <tile.icon className="h-5 w-5 text-brand-textMuted group-hover:text-brand-primary transition-colors" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-brand-textSecondary mt-2">
                      {tile.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
