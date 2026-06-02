import { useState, useEffect } from 'react'
import { Plus, Search, Eye, EyeOff, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getFullDrops, deleteDrop, updateDrop, type Drop } from '@/services/drops'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/lib/drive-utils'
import { DropSheet } from './DropSheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminDrops() {
  const [drops, setDrops] = useState<Drop[]>([])
  const [filteredDrops, setFilteredDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDrop, setSelectedDrop] = useState<Drop | undefined>()

  const loadDrops = async () => {
    try {
      setLoading(true)
      const data = await getFullDrops()
      setDrops(data)
      setFilteredDrops(data)
    } catch (err) {
      toast.error('Erro ao carregar drops')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrops()
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredDrops(drops)
        return
      }
      const lower = searchTerm.toLowerCase()
      setFilteredDrops(
        drops.filter(
          (d) =>
            d.title.toLowerCase().includes(lower) ||
            (d.description && d.description.toLowerCase().includes(lower)),
        ),
      )
    }, 250)
    return () => clearTimeout(handler)
  }, [searchTerm, drops])

  const handleTogglePublish = async (drop: Drop) => {
    try {
      await updateDrop(drop.id, { is_published: !drop.is_published })
      toast.success(drop.is_published ? 'Drop despublicado' : 'Drop publicado')
      loadDrops()
    } catch (err) {
      toast.error('Erro ao atualizar status do drop')
    }
  }

  const handleDelete = async (drop: Drop) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${drop.title}"?`)) return
    try {
      await deleteDrop(drop.id)
      toast.success('Drop excluído')
      loadDrops()
    } catch (err) {
      toast.error('Erro ao excluir drop')
    }
  }

  const openNew = () => {
    setSelectedDrop(undefined)
    setSheetOpen(true)
  }

  const openEdit = (drop: Drop) => {
    setSelectedDrop(drop)
    setSheetOpen(true)
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-textPrimary tracking-tight">Drops (Vídeos)</h1>
        <Button
          onClick={openNew}
          className="bg-brand-primary hover:bg-brand-primaryHover text-white shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Drop
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMuted" />
        <Input
          placeholder="Buscar por título ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white/[0.03] border-brand-border text-brand-textPrimary focus-visible:ring-brand-primary"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-brand-textMuted">Carregando drops...</div>
      ) : filteredDrops.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-brand-border border-dashed rounded-xl">
          <p className="text-brand-textSecondary mb-4">Nenhum drop encontrado.</p>
          <Button
            onClick={openNew}
            variant="outline"
            className="border-brand-border text-brand-textPrimary hover:bg-white/[0.04]"
          >
            Criar primeiro drop
          </Button>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-brand-border rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-brand-border hover:bg-transparent">
                  <TableHead className="text-brand-textSecondary">Título</TableHead>
                  <TableHead className="text-brand-textSecondary">Categoria</TableHead>
                  <TableHead className="text-brand-textSecondary">Duração</TableHead>
                  <TableHead className="text-brand-textSecondary">Views</TableHead>
                  <TableHead className="text-brand-textSecondary">Status</TableHead>
                  <TableHead className="text-brand-textSecondary">Atualizado em</TableHead>
                  <TableHead className="text-right text-brand-textSecondary">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrops.map((drop) => (
                  <TableRow key={drop.id} className="border-brand-border hover:bg-white/[0.02]">
                    <TableCell className="font-medium text-brand-textPrimary max-w-[200px] truncate">
                      {drop.title}
                      {drop.description && (
                        <p className="text-xs text-brand-textMuted truncate font-normal mt-0.5">
                          {drop.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-brand-textSecondary">
                      {drop.expand?.category?.label || '-'}
                    </TableCell>
                    <TableCell className="text-brand-textSecondary">
                      {formatDuration(drop.duration_seconds)}
                    </TableCell>
                    <TableCell className="text-brand-textSecondary">{drop.views || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={drop.is_published ? 'default' : 'secondary'}
                        className={
                          drop.is_published
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20'
                            : 'bg-white/5 text-brand-textSecondary hover:bg-white/10 border-white/10'
                        }
                      >
                        {drop.is_published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-brand-textSecondary">
                      {format(new Date(drop.updated), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(drop)}
                        title={drop.is_published ? 'Despublicar' : 'Publicar'}
                        className="text-brand-textSecondary hover:text-brand-textPrimary"
                      >
                        {drop.is_published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(drop)}
                        title="Editar"
                        className="text-brand-textSecondary hover:text-brand-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(drop)}
                        title="Excluir"
                        className="text-brand-textSecondary hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <DropSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        drop={selectedDrop}
        onSaved={loadDrops}
      />
    </div>
  )
}
