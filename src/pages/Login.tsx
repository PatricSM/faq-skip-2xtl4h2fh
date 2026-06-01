import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn, isAuthenticated, isAdmin, isLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Informe email e senha.')
      return
    }

    setIsSubmitting(true)
    const { error } = await signIn(email, password)
    setIsSubmitting(false)

    if (error) {
      const status = error.status
      if (status === 0) {
        toast.error('Erro de conexão. Verifique sua rede.')
      } else if (status === 429) {
        toast.error('Muitas tentativas. Aguarde alguns minutos.')
      } else if (status >= 500) {
        toast.error('Erro no servidor. Tente novamente em instantes.')
      } else {
        toast.error('Login ou senha incorretos.')
      }
      return
    }

    const role = pb.authStore.record?.role?.toLowerCase()
    if (role !== 'admin' && role !== 'superadmin') {
      signOut()
      toast.error('Acesso restrito a administradores.')
    } else {
      const from = location.state?.from || '/admin'
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-brand-bg p-4 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[15%] -top-[10%] h-[34rem] w-[34rem] rounded-full bg-brand-primary/[0.18] blur-[100px]" />
        <div className="absolute -right-[15%] bottom-[5%] h-[30rem] w-[30rem] rounded-full bg-brand-accent/[0.14] blur-[90px]" />
      </div>

      <Card className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-xl border-brand-border shadow-elevation">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <img
              src="/skip.png"
              alt="Skip"
              width={56}
              height={56}
              className="w-14 h-14 rounded-2xl shadow-glow"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-brand-textPrimary">
            Login Restrito
          </CardTitle>
          <CardDescription className="text-brand-textSecondary">
            Área de administração do FAQ Skip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-brand-textPrimary">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@adapta.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                className="bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-brand-textPrimary">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary/40 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-brand-textMuted hover:text-brand-textPrimary hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">Ocultar/Mostrar senha</span>
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold shadow-glow transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
