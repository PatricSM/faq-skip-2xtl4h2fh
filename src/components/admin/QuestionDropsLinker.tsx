import { useState, useEffect } from 'react'
import { Plus, X, PlayCircle } from 'lucide-react'
import {
  getDropsByQuestion,
  getFullDrops,
  linkQuestionDrop,
  unlinkQuestionDrop,
  type QuestionDrop,
  type Drop,
} from '@/services/drops'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface QuestionDropsLinkerProps {
  questionId: string
}

export function QuestionDropsLinker({ questionId }: QuestionDropsLinkerProps) {
  const [linkedDrops, setLinkedDrops] = useState<QuestionDrop[]>([])
  const [allDrops, setAllDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDropId, setSelectedDropId] = useState<string>('none')
  const [isLinking, setIsLinking] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [linked, all] = await Promise.all([
        getDropsByQuestion(questionId),
        getFullDrops('is_published = true'),
      ])
      setLinkedDrops(linked)
      setAllDrops(all)
    } catch (err) {
      toast.error('Erro ao carregar drops relacionados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (questionId) {
      loadData()
    }
  }, [questionId])

  const handleLink = async () => {
    if (selectedDropId === 'none') return
    try {
      setIsLinking(true)
      await linkQuestionDrop(questionId, selectedDropId, linkedDrops.length)
      toast.success('Drop vinculado com sucesso')
      setSelectedDropId('none')
      loadData()
    } catch (err) {
      toast.error('Erro ao vincular drop')
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlink = async (id: string) => {
    try {
      await unlinkQuestionDrop(id)
      toast.success('Vínculo removido')
      loadData()
    } catch (err) {
      toast.error('Erro ao remover vínculo')
    }
  }

  const linkedDropIds = new Set(linkedDrops.map((qd) => qd.drop))
  const availableDrops = allDrops.filter((d) => !linkedDropIds.has(d.id))

  if (loading) {
    return <div className="text-brand-textMuted text-sm">Carregando drops...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PlayCircle className="h-5 w-5 text-brand-primary" />
        <h3 className="text-lg font-semibold text-brand-textPrimary">
          Vídeos Recomendados (Drops)
        </h3>
      </div>

      <p className="text-sm text-brand-textSecondary">
        Vincule vídeos a esta pergunta para enriquecer a resposta com conteúdo visual.
      </p>

      <div className="flex items-center gap-3">
        <Select value={selectedDropId} onValueChange={setSelectedDropId}>
          <SelectTrigger className="flex-1 bg-white/[0.04] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary">
            <SelectValue placeholder="Selecione um drop para vincular..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Selecione um drop...</SelectItem>
            {availableDrops.map((drop) => (
              <SelectItem key={drop.id} value={drop.id}>
                {drop.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={handleLink}
          disabled={selectedDropId === 'none' || isLinking}
          className="bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Vincular
        </Button>
      </div>

      <div className="space-y-3">
        {linkedDrops.length === 0 ? (
          <div className="text-sm text-brand-textMuted italic py-4">
            Nenhum vídeo vinculado a esta pergunta.
          </div>
        ) : (
          linkedDrops.map((qd) => (
            <div
              key={qd.id}
              className="flex items-center justify-between p-3 bg-white/[0.02] border border-brand-border rounded-lg"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-brand-textPrimary">
                  {qd.expand?.drop?.title}
                </span>
                <div className="flex gap-2">
                  {qd.expand?.drop?.expand?.category && (
                    <Badge
                      variant="secondary"
                      className="bg-white/5 text-brand-textSecondary text-[10px]"
                    >
                      {qd.expand.drop.expand.category.label}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleUnlink(qd.id)}
                className="text-brand-textSecondary hover:text-red-400 hover:bg-red-400/10"
                title="Remover vínculo"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
