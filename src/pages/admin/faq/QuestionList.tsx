import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, EyeOff, Pencil, Trash, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  fetchAllQuestions,
  fetchCategories,
  deleteQuestion,
  updateQuestion,
  reorderQuestions,
  type Question,
  type Category,
} from '@/services/faq'
import { toast } from 'sonner'

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [qs, cats] = await Promise.all([fetchAllQuestions(), fetchCategories()])
      setQuestions(qs)
      setCategories(cats)
    } catch (err) {
      toast.error('Erro ao carregar perguntas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteQuestion(id)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      toast.success('Pergunta excluída com sucesso')
    } catch (err) {
      toast.error('Erro ao excluir pergunta')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (q: Question) => {
    setProcessingId(q.id)
    const newStatus = q.status === 'published' ? 'draft' : 'published'
    try {
      const updated = await updateQuestion(q.id, { status: newStatus })
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, status: updated.status } : item)),
      )
      toast.success(`Status alterado para ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}`)
    } catch (err) {
      toast.error('Erro ao alterar status')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    const matchCategory = categoryFilter === 'all' || q.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  // Native drag and drop
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => {
      const el = document.getElementById(`q-${id}`)
      if (el) el.classList.add('opacity-50')
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetId: string, categoryId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const el = document.getElementById(`q-${draggedId}`)
    if (el) el.classList.remove('opacity-50')

    const draggedItem = questions.find((q) => q.id === draggedId)
    const targetItem = questions.find((q) => q.id === targetId)

    if (!draggedItem || !targetItem) return
    if (draggedItem.category !== categoryId) {
      toast.error('Só é possível reordenar dentro da mesma categoria')
      setDraggedId(null)
      return
    }

    const categoryQuestions = questions.filter((q) => q.category === categoryId)
    const oldIndex = categoryQuestions.findIndex((q) => q.id === draggedId)
    const newIndex = categoryQuestions.findIndex((q) => q.id === targetId)

    const reordered = [...categoryQuestions]
    reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, draggedItem)

    const updates = reordered.map((item, index) => ({ id: item.id, order: index }))

    setQuestions((prev) => {
      const next = [...prev]
      updates.forEach((u) => {
        const idx = next.findIndex((n) => n.id === u.id)
        if (idx !== -1) next[idx] = { ...next[idx], order: u.order }
      })
      return next.sort((a, b) => a.order - b.order)
    })

    try {
      await reorderQuestions(updates)
      toast.success('Ordem atualizada com sucesso')
    } catch (err) {
      toast.error('Erro ao reordenar perguntas')
      loadData()
    }

    setDraggedId(null)
  }

  const handleDragEnd = () => {
    if (draggedId) {
      const el = document.getElementById(`q-${draggedId}`)
      if (el) el.classList.remove('opacity-50')
    }
    setDraggedId(null)
  }

  const groupedQuestions = categories
    .map((cat) => ({
      ...cat,
      questions: filteredQuestions
        .filter((q) => q.category === cat.id)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((cat) => cat.questions.length > 0)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-textPrimary tracking-tight">Gerenciar FAQ</h1>
        <Button
          onClick={() => navigate('/admin/perguntas/nova')}
          className="bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Pergunta
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMuted" />
          <Input
            placeholder="Buscar perguntas ou respostas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-brand-textMuted">Carregando...</div>
      ) : groupedQuestions.length === 0 ? (
        <div className="text-center py-12 border border-brand-border rounded-xl bg-white/[0.03]">
          <p className="text-brand-textMuted">Nenhuma pergunta encontrada.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedQuestions.map((category) => (
            <div key={category.id} className="space-y-4">
              <h2 className="text-xl font-semibold text-brand-textPrimary border-b border-brand-border pb-2">
                {category.label}
              </h2>
              <div className="space-y-2">
                {category.questions.map((q) => (
                  <div
                    key={q.id}
                    id={`q-${q.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, q.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, q.id, category.id)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-4 p-4 bg-white/[0.03] border border-brand-border rounded-xl hover:bg-white/[0.06] hover:border-brand-primary/30 transition-all cursor-move group"
                  >
                    <div className="text-brand-textMuted opacity-50 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-brand-textPrimary truncate">{q.question}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          className={
                            q.status === 'published'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          }
                        >
                          {q.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-brand-border text-brand-textSecondary"
                        >
                          {q.priority || 'Média'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(q)}
                        disabled={processingId === q.id}
                        className="hover:bg-white/[0.06]"
                      >
                        {q.status === 'published' ? (
                          <Eye className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-brand-textMuted" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/perguntas/${q.id}`)}
                        className="hover:bg-white/[0.06]"
                      >
                        <Pencil className="h-4 w-4 text-brand-primary" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-red-500/10">
                            <Trash className="h-4 w-4 text-red-400" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white/[0.03] border-brand-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-brand-textPrimary">
                              Excluir pergunta?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-brand-textSecondary">
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
                              pergunta.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/[0.03] border-brand-border text-brand-textPrimary hover:bg-white/[0.06]">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(q.id)}
                              className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                            >
                              {deletingId === q.id ? 'Excluindo...' : 'Excluir'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
