import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react'
import {
  fetchCategories,
  deleteCategory,
  reorderCategories,
  countQuestionsByCategory,
  Category,
} from '@/services/faq'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
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
import { Card, CardContent } from '@/components/ui/card'

export default function CategoryList() {
  const [categories, setCategories] = useState<(Category & { count: number })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await fetchCategories()
      const withCounts = await Promise.all(
        data.map(async (c) => {
          const count = await countQuestionsByCategory(c.id)
          return { ...c, count }
        }),
      )
      withCounts.sort((a, b) => (a.order || 0) - (b.order || 0))
      setCategories(withCounts)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar categorias', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (isSaving) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    setIsSaving(true)
    const newCategories = [...categories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[newIndex]
    newCategories[newIndex] = temp

    const updates = newCategories.map((c, i) => ({ id: c.id, order: i }))

    setCategories(newCategories.map((c, i) => ({ ...c, order: i })))

    try {
      await reorderCategories(updates)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao reordenar', variant: 'destructive' })
      loadData()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsSaving(true)
    try {
      await deleteCategory(deleteId)
      toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso' })
      setCategories(categories.filter((c) => c.id !== deleteId))
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 bg-brand-bg">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border border-brand-border bg-background bg-brand-surface px-6 shadow-sm">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="font-semibold text-lg text-foreground text-brand-textPrimary">
          Categorias FAQ
        </div>
        <div className="ml-auto">
          <Button
            asChild
            className="bg-primary bg-brand-primary hover:bg-primary/90 hover:bg-brand-primaryHover"
          >
            <Link to="/admin/categorias/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground text-brand-textMuted">
              Carregando...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-brand-textMuted">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            categories.map((cat, idx) => (
              <Card
                key={cat.id}
                className="bg-card bg-brand-surface border-border border-brand-border"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex flex-col gap-1 mr-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx === 0 || isSaving}
                      onClick={() => handleReorder(idx, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx === categories.length - 1 || isSaving}
                      onClick={() => handleReorder(idx, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col items-start">
                    <div className="font-medium text-lg text-foreground text-brand-textPrimary">
                      {cat.label}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {cat.slug}
                      </Badge>
                      <span className="text-sm text-muted-foreground text-brand-textSecondary">
                        {cat.count} {cat.count === 1 ? 'pergunta' : 'perguntas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/categorias/${cat.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={cat.count > 0 || isSaving}
                      onClick={() => {
                        if (cat.count > 0) {
                          toast({
                            title: 'Aviso',
                            description: 'Não é possível excluir categorias com perguntas',
                            variant: 'destructive',
                          })
                          return
                        }
                        setDeleteId(cat.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-brand-surface border-brand-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-brand-textPrimary">
              Excluir categoria
            </AlertDialogTitle>
            <AlertDialogDescription className="text-brand-textSecondary">
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
