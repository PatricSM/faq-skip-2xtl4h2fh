import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Power, PowerOff, Trash2, Shield, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { fetchUsers, updateUser, deleteUser, type User } from '@/services/users'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function UserList() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<'toggle' | 'delete'>('toggle')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const load = async () => {
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (err) {
      toast({
        title: 'Erro ao carregar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openDialog = (u: User, action: 'toggle' | 'delete') => {
    setSelectedUser(u)
    setDialogAction(action)
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedUser) return
    try {
      if (dialogAction === 'toggle') {
        await updateUser(selectedUser.id, { isActive: !selectedUser.isActive })
        toast({ title: `Usuário ${selectedUser.isActive ? 'desativado' : 'reativado'}` })
      } else {
        await deleteUser(selectedUser.id)
        toast({ title: 'Usuário excluído' })
      }
      load()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setDialogOpen(false)
      setSelectedUser(null)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-textPrimary tracking-tight">Usuários</h1>
        <Button
          asChild
          className="bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow"
        >
          <Link to="/admin/usuarios/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Link>
        </Button>
      </div>

      <div className="bg-white/[0.03] rounded-xl border border-brand-border overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b-brand-border hover:bg-transparent">
              <TableHead className="text-brand-textSecondary">Nome / E-mail</TableHead>
              <TableHead className="text-brand-textSecondary">Papel</TableHead>
              <TableHead className="text-brand-textSecondary">Status</TableHead>
              <TableHead className="text-right text-brand-textSecondary">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id
              const isMaster = u.email === 'admin@goskip.dev'
              const canModify = !isSelf && !isMaster

              return (
                <TableRow
                  key={u.id}
                  className="border-b-brand-border hover:bg-white/[0.04] transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-brand-textPrimary">
                        {u.name || 'Sem nome'}
                      </span>
                      {isSelf && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/[0.05] text-brand-textSecondary border border-brand-border"
                        >
                          Você
                        </Badge>
                      )}
                      {isMaster && (
                        <Badge className="bg-brand-primarySoft text-brand-primary border border-brand-primary/40 hover:bg-brand-primarySoft text-xs">
                          Master
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-brand-textMuted">{u.email}</div>
                  </TableCell>
                  <TableCell className="text-brand-textPrimary">
                    <div className="flex items-center gap-1.5">
                      {u.role === 'superadmin' ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-brand-primary" /> Superadmin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 text-brand-textSecondary" /> Admin
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-white/[0.05] text-brand-textMuted border border-brand-border'
                      }
                    >
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-white/[0.06]">
                        <Link to={`/admin/usuarios/${u.id}`}>
                          <Pencil className="h-4 w-4 text-brand-primary" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canModify}
                        onClick={() => openDialog(u, 'toggle')}
                        title={u.isActive ? 'Desativar' : 'Reativar'}
                        className="hover:bg-white/[0.06] disabled:opacity-30"
                      >
                        {u.isActive ? (
                          <PowerOff className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Power className="h-4 w-4 text-emerald-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canModify}
                        onClick={() => openDialog(u, 'delete')}
                        className="hover:bg-red-500/10 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-white/[0.03] border-brand-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-brand-textPrimary">
              {dialogAction === 'delete'
                ? 'Excluir usuário'
                : selectedUser?.isActive
                  ? 'Desativar usuário'
                  : 'Reativar usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-brand-textSecondary">
              {dialogAction === 'delete'
                ? `Tem certeza que deseja excluir permanentemente o usuário ${selectedUser?.email}?`
                : `Tem certeza que deseja ${selectedUser?.isActive ? 'desativar' : 'reativar'} o acesso de ${selectedUser?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.03] border-brand-border text-brand-textPrimary hover:bg-white/[0.06]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                dialogAction === 'delete'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                  : 'bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow'
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
