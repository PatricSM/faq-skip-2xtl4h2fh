import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { getCategory, createCategory, updateCategory, fetchCategories } from '@/services/faq'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const categorySchema = z.object({
  label: z
    .string()
    .min(1, 'O nome é obrigatório')
    .max(120, 'O nome deve ter no máximo 120 caracteres'),
  slug: z
    .string()
    .min(1, 'O slug é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'O slug deve conter apenas letras minúsculas, números e hifens'),
  icon: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function CategoryForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      label: '',
      slug: '',
      icon: '',
    },
  })

  useEffect(() => {
    if (isEditing && id) {
      getCategory(id)
        .then((data) => {
          form.reset({
            label: data.label,
            slug: data.slug,
            icon: data.icon || '',
          })
          setSlugManuallyEdited(true)
        })
        .catch(() => {
          toast({ title: 'Erro', description: 'Categoria não encontrada', variant: 'destructive' })
          navigate('/admin/categorias')
        })
        .finally(() => setIsLoading(false))
    }
  }, [id, isEditing, form, navigate, toast])

  const generateSlug = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
  }

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSaving(true)
    try {
      if (isEditing && id) {
        await updateCategory(id, values)
        toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso' })
      } else {
        const all = await fetchCategories()
        const order = all.length > 0 ? Math.max(...all.map((c) => c.order || 0)) + 1 : 0
        await createCategory({ ...values, order })
        toast({ title: 'Sucesso', description: 'Categoria criada com sucesso' })
      }
      navigate('/admin/categorias')
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          form.setError(field as any, { message: msg as string })
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar a categoria',
          variant: 'destructive',
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 bg-brand-bg">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border border-brand-border bg-background bg-brand-surface px-6 shadow-sm">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/categorias">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="font-semibold text-lg text-foreground text-brand-textPrimary">
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Card className="bg-card bg-brand-surface border-border border-brand-border">
            <CardHeader>
              <CardTitle className="text-brand-textPrimary">Detalhes da Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-10 text-muted-foreground text-brand-textMuted">
                  Carregando...
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-textPrimary">
                            Nome (label público)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Pagamentos"
                              className="border-brand-border"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (!slugManuallyEdited && !isEditing) {
                                  form.setValue('slug', generateSlug(e.target.value), {
                                    shouldValidate: true,
                                  })
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-textPrimary">Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ex-pagamentos"
                              className="font-mono border-brand-border"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setSlugManuallyEdited(true)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-textPrimary">Ícone (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do ícone Lucide"
                              className="border-brand-border"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end gap-4 pt-4">
                      <Button variant="outline" type="button" asChild disabled={isSaving}>
                        <Link to="/admin/categorias">Cancelar</Link>
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary bg-brand-primary hover:bg-primary/90 hover:bg-brand-primaryHover"
                      >
                        {isSaving ? 'Salvando...' : 'Salvar Categoria'}
                        <Save className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
