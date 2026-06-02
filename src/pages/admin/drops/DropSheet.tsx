import { useState, useEffect } from 'react'
import { extractDriveId, getDriveEmbedUrl } from '@/lib/drive-utils'
import { createDrop, updateDrop, type Drop } from '@/services/drops'
import { fetchCategories, type Category } from '@/services/faq'
import { toast } from 'sonner'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

interface DropSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  drop?: Drop
  onSaved: () => void
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function DropSheet({ isOpen, onOpenChange, drop, onSaved }: DropSheetProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    video_url: '',
    category: '',
    duration_seconds: 0,
    thumbnail_url: '',
    order: 0,
    is_published: true,
  })

  useEffect(() => {
    if (isOpen) {
      loadCategories()
      if (drop) {
        setFormData({
          title: drop.title,
          slug: drop.slug,
          description: drop.description || '',
          video_url: drop.video_url,
          category: drop.category || '',
          duration_seconds: drop.duration_seconds || 0,
          thumbnail_url: drop.thumbnail_url || '',
          order: drop.order || 0,
          is_published: drop.is_published ?? true,
        })
        setIsSlugEdited(true) // Don't auto-update slug for existing drops
      } else {
        setFormData({
          title: '',
          slug: '',
          description: '',
          video_url: '',
          category: '',
          duration_seconds: 0,
          thumbnail_url: '',
          order: 0,
          is_published: true,
        })
        setIsSlugEdited(false)
      }
    }
  }, [isOpen, drop])

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch {
      // ignore silently
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isSlugEdited ? slugify(title) : prev.slug,
    }))
  }

  const handleSlugChange = (slug: string) => {
    setIsSlugEdited(true)
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.slug.trim() || !formData.video_url.trim()) {
      toast.error('Preencha os campos obrigatórios (Título, Slug, URL do vídeo)')
      return
    }

    const videoId = extractDriveId(formData.video_url)
    if (!videoId) {
      toast.error('URL de vídeo inválida. Não foi possível extrair o ID do Google Drive.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        video_id: videoId,
      }

      if (drop) {
        await updateDrop(drop.id, payload)
        toast.success('Drop atualizado com sucesso')
      } else {
        await createDrop(payload)
        toast.success('Drop criado com sucesso')
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      const errors = extractFieldErrors(err)
      toast.error(errors.message || 'Erro ao salvar drop')
    } finally {
      setLoading(false)
    }
  }

  const embedUrl = getDriveEmbedUrl(formData.video_url)

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-brand-bg border-brand-border sm:border-l">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-brand-textPrimary">
            {drop ? 'Editar Drop' : 'Novo Drop'}
          </SheetTitle>
          <SheetDescription className="text-brand-textSecondary">
            Preencha os dados do vídeo tutorial abaixo.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-brand-textPrimary">URL do vídeo (Google Drive) *</Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData((p) => ({ ...p, video_url: e.target.value }))}
                placeholder="Ex: https://drive.google.com/file/d/.../view"
                className="bg-white/[0.04] border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted focus-visible:ring-brand-primary"
              />
            </div>

            {embedUrl && (
              <div className="space-y-2">
                <Label className="text-brand-textSecondary text-sm">Preview do vídeo</Label>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-brand-border bg-black/20">
                  <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-brand-textPrimary">Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Como configurar a conta"
                className="bg-white/[0.04] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-brand-textPrimary">Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="como-configurar-a-conta"
                className="bg-white/[0.04] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-brand-textPrimary">Categoria</Label>
              <Select
                value={formData.category || 'none'}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, category: v === 'none' ? '' : v }))
                }
              >
                <SelectTrigger className="bg-white/[0.04] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary">
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-brand-textPrimary">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Breve descrição do vídeo..."
                className="bg-white/[0.04] border-brand-border text-brand-textPrimary min-h-[100px] focus-visible:ring-brand-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-brand-textPrimary">Duração (segundos)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.duration_seconds}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, duration_seconds: parseInt(e.target.value) || 0 }))
                  }
                  className="bg-white/[0.04] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-brand-textPrimary">Ordem</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))
                  }
                  className="bg-white/[0.04] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-brand-textPrimary">URL da Thumbnail</Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData((p) => ({ ...p, thumbnail_url: e.target.value }))}
                placeholder="Opcional. Ex: https://.../thumb.jpg"
                className="bg-white/[0.04] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-brand-border rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-brand-textPrimary cursor-pointer" htmlFor="publish-switch">
                  Publicado
                </Label>
                <div className="text-sm text-brand-textMuted">
                  Tornar vídeo visível para os usuários
                </div>
              </div>
              <Switch
                id="publish-switch"
                checked={formData.is_published}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, is_published: v }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/[0.03] border-brand-border text-brand-textPrimary hover:bg-white/[0.06]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow"
            >
              {loading ? 'Salvando...' : 'Salvar Drop'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
