import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  fetchCategories,
  getQuestion,
  createQuestion,
  updateQuestion,
  type Category,
} from '@/services/faq'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function QuestionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    status: 'draft' as 'draft' | 'published',
    priority: 'Média',
  })

  useEffect(() => {
    loadInitial()
  }, [id])

  const loadInitial = async () => {
    try {
      const cats = await fetchCategories()
      setCategories(cats)
      if (isEditing) {
        const q = await getQuestion(id)
        setFormData({
          category: q.category,
          question: q.question,
          answer: q.answer,
          status: q.status,
          priority: q.priority || 'Média',
        })
      } else if (cats.length > 0) {
        setFormData((prev) => ({ ...prev, category: cats[0].id }))
      }
    } catch (err) {
      toast.error('Erro ao carregar dados')
      navigate('/admin/perguntas')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category || !formData.question.trim() || !formData.answer.trim()) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        await updateQuestion(id, formData)
        toast.success('Pergunta atualizada com sucesso')
      } else {
        await createQuestion(formData)
        toast.success('Pergunta criada com sucesso')
      }
      navigate('/admin/perguntas')
    } catch (err) {
      const errors = extractFieldErrors(err)
      toast.error(errors.message || 'Erro ao salvar pergunta')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className="text-center py-12 text-brand-textMuted">Carregando...</div>
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-brand-textSecondary hover:text-brand-textPrimary hover:bg-white/[0.06] -ml-2"
        >
          <Link to="/admin/perguntas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-brand-textPrimary tracking-tight">
          {isEditing ? 'Editar Pergunta' : 'Nova Pergunta'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/[0.03] p-6 rounded-xl border border-brand-border backdrop-blur-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="category" className="text-brand-textPrimary">
            Categoria *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
          >
            <SelectTrigger className="bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question" className="text-brand-textPrimary">
            Pergunta * (máx 500 caracteres)
          </Label>
          <Input
            id="question"
            value={formData.question}
            onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
            maxLength={500}
            placeholder="Ex: Como redefinir minha senha?"
            className="bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer" className="text-brand-textPrimary">
            Resposta *
          </Label>
          <Textarea
            id="answer"
            value={formData.answer}
            onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
            className="min-h-[150px] whitespace-pre-wrap bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary"
            placeholder="Digite a resposta aqui..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-brand-textPrimary">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(v: 'draft' | 'published') =>
                setFormData((prev) => ({ ...prev, status: v }))
              }
            >
              <SelectTrigger className="bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-brand-textPrimary">
              Prioridade
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v }))}
            >
              <SelectTrigger className="bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-2 focus-visible:ring-brand-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/perguntas')}
            disabled={loading}
            className="bg-white/[0.03] border-brand-border text-brand-textPrimary hover:bg-white/[0.06]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow"
          >
            {loading ? 'Salvando...' : 'Salvar Pergunta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
