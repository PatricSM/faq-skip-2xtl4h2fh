import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Tags, Users, Activity } from 'lucide-react'
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
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary">Visão Geral</h1>
        <p className="text-brand-textSecondary">Bem-vindo ao painel de controle do FAQ.</p>
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
                <p className="text-sm text-brand-textSecondary mt-2">{tile.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
