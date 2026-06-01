import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeft, Pencil, Power, PowerOff, Trash2, Shield, ShieldCheck } from 'lucide-react'
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
    <div className="flex flex-col min-h-screen bg-muted/20">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Usuários</h1>
        <div className="ml-auto">
          <Button asChild>
            <Link to="/admin/usuarios/novo">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
        <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id
                const isMaster = u.email === 'admin@goskip.dev'
                const canModify = !isSelf && !isMaster

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{u.name || 'Sem nome'}</span>
                        {isSelf && (
                          <Badge variant="secondary" className="text-xs">
                            Você
                          </Badge>
                        )}
                        {isMaster && (
                          <Badge className="bg-purple-500 hover:bg-purple-600 text-xs">
                            Master
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {u.role === 'superadmin' ? (
                          <>
                            <ShieldCheck className="h-4 w-4 text-purple-600" /> Superadmin
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 text-blue-600" /> Admin
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.isActive ? 'default' : 'secondary'}
                        className={u.isActive ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/usuarios/${u.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!canModify}
                          onClick={() => openDialog(u, 'toggle')}
                          title={u.isActive ? 'Desativar' : 'Reativar'}
                        >
                          {u.isActive ? (
                            <PowerOff className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Power className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!canModify}
                          onClick={() => openDialog(u, 'delete')}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'delete'
                ? 'Excluir usuário'
                : selectedUser?.isActive
                  ? 'Desativar usuário'
                  : 'Reativar usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'delete'
                ? `Tem certeza que deseja excluir permanentemente o usuário ${selectedUser?.email}?`
                : `Tem certeza que deseja ${selectedUser?.isActive ? 'desativar' : 'reativar'} o acesso de ${selectedUser?.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={dialogAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
