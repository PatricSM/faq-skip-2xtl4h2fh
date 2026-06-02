import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Drops from './pages/Drops'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import QuestionList from './pages/admin/faq/QuestionList'
import QuestionForm from './pages/admin/faq/QuestionForm'
import CategoryList from './pages/admin/faq/CategoryList'
import CategoryForm from './pages/admin/faq/CategoryForm'
import AdminDrops from './pages/admin/drops/AdminDrops'
import UserList from './pages/admin/users/UserList'
import UserForm from './pages/admin/users/UserForm'
import LogList from './pages/admin/logs/LogList'
import { AuthProvider } from './hooks/use-auth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/AdminLayout'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/perguntas" element={<QuestionList />} />
              <Route path="/admin/perguntas/nova" element={<QuestionForm />} />
              <Route path="/admin/perguntas/:id" element={<QuestionForm />} />
              <Route path="/admin/categorias" element={<CategoryList />} />
              <Route path="/admin/categorias/nova" element={<CategoryForm />} />
              <Route path="/admin/categorias/:id" element={<CategoryForm />} />
              <Route path="/admin/drops" element={<AdminDrops />} />
              <Route path="/admin/usuarios" element={<UserList />} />
              <Route path="/admin/usuarios/novo" element={<UserForm />} />
              <Route path="/admin/usuarios/:id" element={<UserForm />} />
              <Route path="/admin/logs" element={<LogList />} />
            </Route>
          </Route>

          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/drops" element={<Drops />} />
            <Route path="/drops/:slug" element={<Drops />} />
            {/* Outras rotas serão adicionadas nas próximas fases */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
