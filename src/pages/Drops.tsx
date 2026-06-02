import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Search, PlayCircle } from 'lucide-react'
import { Drop, getPublishedDrops } from '@/services/drops'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DropCard } from '@/components/DropCard'
import { DropPlayerDialog } from '@/components/DropPlayerDialog'

export default function Drops() {
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    getPublishedDrops()
      .then(setDrops)
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const cats = new Map<string, any>()
    drops.forEach((d) => {
      if (d.expand?.category) {
        cats.set(d.expand.category.id, d.expand.category)
      }
    })
    return Array.from(cats.values()).sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [drops])

  const filteredDrops = useMemo(() => {
    return drops.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase())
      const matchCategory = category === 'all' || d.expand?.category?.id === category
      return matchSearch && matchCategory
    })
  }, [drops, search, category])

  const groupedDrops = useMemo(() => {
    const groups = new Map<string, Drop[]>()

    categories.forEach((c) => groups.set(c.id, []))
    groups.set('uncategorized', [])

    filteredDrops.forEach((d) => {
      const catId = d.expand?.category?.id || 'uncategorized'
      if (!groups.has(catId)) groups.set(catId, [])
      groups.get(catId)!.push(d)
    })

    return Array.from(groups.entries())
      .map(([id, items]) => {
        const cat = categories.find((c) => c.id === id)
        return {
          id,
          label: cat?.label || 'Outros',
          order: cat?.order || 9999,
          items,
        }
      })
      .filter((g) => g.items.length > 0)
      .sort((a, b) => a.order - b.order)
  }, [filteredDrops, categories])

  const selectedDrop = useMemo(() => drops.find((d) => d.slug === slug), [drops, slug])

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent mb-4">
          Drops
        </h1>
        <p className="text-lg text-brand-textSecondary">
          Short tutorials from Skip. Aprenda como resolver situações da plataforma com tutoriais
          visuais curtos.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar drops..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      ) : filteredDrops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PlayCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Nenhum drop encontrado</h3>
          <p className="text-muted-foreground">
            Tente buscar com outros termos ou altere a categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-12 animate-fade-in-up">
          {groupedDrops.map((group) => (
            <div key={group.id}>
              <h2 className="text-2xl font-semibold mb-6">{group.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((drop) => (
                  <DropCard
                    key={drop.id}
                    drop={drop}
                    onClick={() => navigate(`/drops/${drop.slug}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDrop && (
        <DropPlayerDialog
          drop={selectedDrop}
          open={!!selectedDrop}
          onOpenChange={(open) => {
            if (!open) navigate('/drops')
          }}
        />
      )}
    </div>
  )
}
