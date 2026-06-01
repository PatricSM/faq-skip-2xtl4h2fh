import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getUser, createUser, updateUser } from '@/services/users'
import { getErrorMessage, extractFieldErrors } from '@/lib/pocketbase/errors'

export default function UserForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const isSelf = id === currentUser?.id

  const schema = z
    .object({
      name: z.string().min(2, 'Nome é obrigatório'),
      email: z.string().email('E-mail inválido'),
      password: z.string().optional(),
      role: z.enum(['admin', 'superadmin']),
      isActive: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (!isEditing && (!data.password || data.password.length < 8)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Senha deve ter no mínimo 8 caracteres',
          path: ['password'],
        })
      }
      if (isEditing && data.password && data.password.length > 0 && data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Senha deve ter no mínimo 8 caracteres',
          path: ['password'],
        })
      }
    })

  type FormData = z.infer<typeof schema>

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', role: 'admin', isActive: true },
  })

  useEffect(() => {
    if (isEditing) {
      getUser(id!)
        .then((data) => {
          form.reset({
            name: data.name,
            email: data.email,
            password: '',
            role: data.role,
            isActive: data.isActive,
          })
        })
        .catch((err) => {
          toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
          navigate('/admin/usuarios')
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      if (isEditing) {
        await updateUser(id!, data)
        toast({ title: 'Usuário atualizado com sucesso' })
      } else {
        await createUser(data)
        toast({ title: 'Usuário criado com sucesso' })
      }
      navigate('/admin/usuarios')
    } catch (err) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        Object.entries(fieldErrs).forEach(([field, msg]) => {
          form.setError(field as any, { message: msg })
        })
      } else {
        toast({
          title: 'Erro ao salvar',
          description: getErrorMessage(err),
          variant: 'destructive',
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  const inputClass =
    'bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary'

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-textPrimary">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-brand-border bg-brand-bg/60 backdrop-blur-xl px-6">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-brand-textPrimary hover:bg-white/[0.06]"
        >
          <Link to="/admin/usuarios">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-brand-textPrimary">
          {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        </h1>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-2xl mx-auto w-full">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 bg-white/[0.03] p-6 rounded-xl border border-brand-border backdrop-blur-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-brand-textPrimary">
                Nome
              </Label>
              <Input id="name" {...form.register('name')} className={inputClass} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-brand-textPrimary">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                disabled={isEditing}
                {...form.register('email')}
                className={inputClass + ' disabled:opacity-60'}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password" className="text-brand-textPrimary">
                Senha{' '}
                {isEditing && (
                  <span className="text-brand-textMuted text-xs">
                    (Deixe em branco para manter a atual)
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                className={inputClass}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="role" className="text-brand-textPrimary">
                Papel
              </Label>
              <Select
                value={form.watch('role')}
                onValueChange={(val) => form.setValue('role', val as any)}
                disabled={currentUser?.role !== 'superadmin'}
              >
                <SelectTrigger id="role" className={inputClass}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-400">{form.formState.errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-brand-border pt-4">
            <div className="space-y-0.5">
              <Label className="text-brand-textPrimary">Acesso Ativo</Label>
              <p className="text-sm text-brand-textMuted">
                Permite que o usuário faça login no sistema.
              </p>
            </div>
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={(val) => form.setValue('isActive', val)}
              disabled={isSelf || (isEditing && form.watch('email') === 'admin@goskip.dev')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
            <Button
              variant="outline"
              type="button"
              asChild
              className="bg-white/[0.03] border-brand-border text-brand-textPrimary hover:bg-white/[0.06]"
            >
              <Link to="/admin/usuarios">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
