import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
    return <div className="text-center py-12">Carregando...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isEditing ? 'Editar Pergunta' : 'Nova Pergunta'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
          >
            <SelectTrigger>
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
          <Label htmlFor="question">Pergunta * (máx 500 caracteres)</Label>
          <Input
            id="question"
            value={formData.question}
            onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
            maxLength={500}
            placeholder="Ex: Como redefinir minha senha?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer">Resposta *</Label>
          <Textarea
            id="answer"
            value={formData.answer}
            onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
            className="min-h-[150px] whitespace-pre-wrap"
            placeholder="Digite a resposta aqui..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v: 'draft' | 'published') =>
                setFormData((prev) => ({ ...prev, status: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v }))}
            >
              <SelectTrigger>
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

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/perguntas')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Pergunta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
