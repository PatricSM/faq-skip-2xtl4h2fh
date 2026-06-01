import { useEffect, useState, useMemo } from 'react'
import { Sparkles, Search, FileQuestion, Loader2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { fetchPublishedQuestions, Category, Question } from '@/services/faq'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

export default function Index() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        const qs = await fetchPublishedQuestions()
        setQuestions(qs)
      } catch (err: any) {
        setError(err.message || 'Falha ao carregar as perguntas frequentes.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesCategory = selectedCategory ? q.category === selectedCategory : true
      const searchLower = debouncedSearch.toLowerCase()
      const matchesSearch =
        q.question.toLowerCase().includes(searchLower) ||
        q.answer.toLowerCase().includes(searchLower)
      return matchesCategory && matchesSearch
    })
  }, [questions, selectedCategory, debouncedSearch])

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, { category: Category; questions: Question[] }> = {}
    filteredQuestions.forEach((q) => {
      if (!q.expand?.category) return
      const cat = q.expand.category
      if (!groups[cat.id]) {
        groups[cat.id] = { category: cat, questions: [] }
      }
      groups[cat.id].questions.push(q)
    })
    return Object.values(groups).sort((a, b) => {
      if (a.category.order !== b.category.order) return a.category.order - b.category.order
      return a.category.label.localeCompare(b.category.label)
    })
  }, [filteredQuestions])

  const availableCategories = useMemo(() => {
    const catsMap = new Map<string, Category>()
    questions.forEach((q) => {
      if (q.expand?.category) {
        catsMap.set(q.category, q.expand.category)
      }
    })
    return Array.from(catsMap.values()).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.label.localeCompare(b.label)
    })
  }, [questions])

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl flex flex-col flex-1">
      <div className="flex flex-col items-center text-center mb-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primarySoft border border-brand-primary/30 mb-8">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-semibold text-brand-textPrimary uppercase tracking-wider">
            Plataforma de Perguntas Frequentes
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-textPrimary tracking-tight mb-6 max-w-3xl leading-tight">
          Como podemos{' '}
          <span className="bg-brand-gradient bg-clip-text text-transparent">
            ajudar?
          </span>
        </h1>

        <p className="text-lg md:text-xl text-brand-textSecondary max-w-2xl mx-auto font-medium leading-relaxed">
          Respostas validadas para as perguntas mais frequentes sobre o Skip Cloud.
        </p>
      </div>

      <div
        className="relative w-full max-w-2xl mx-auto mb-10 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-textMuted" />
        <Input
          type="text"
          placeholder="Buscar por palavra-chave..."
          className="pl-12 h-14 bg-white/[0.03] border border-brand-border text-brand-textPrimary placeholder:text-brand-textMuted rounded-xl text-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary/40 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand-textMuted animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-primary" />
          <p>Carregando perguntas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center animate-fade-in">
          {error}
        </div>
      ) : (
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                  selectedCategory === null
                    ? 'bg-brand-primarySoft border-brand-primary/40 text-brand-primary'
                    : 'bg-white/[0.03] border-brand-border text-brand-textSecondary hover:text-brand-textPrimary hover:border-white/15',
                )}
              >
                Todas
              </button>
              {availableCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                    selectedCategory === c.id
                      ? 'bg-brand-primarySoft border-brand-primary/40 text-brand-primary'
                      : 'bg-white/[0.03] border-brand-border text-brand-textSecondary hover:text-brand-textPrimary hover:border-white/15',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {groupedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-textMuted text-center">
              <FileQuestion className="w-12 h-12 mb-4 opacity-50" />
              <p>Nenhuma pergunta encontrada com os filtros atuais.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {groupedQuestions.map((group) => (
                <div key={group.category.id} className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-brand-textPrimary">
                      {group.category.label}
                    </h2>
                    <span className="bg-white/[0.04] text-brand-textSecondary text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-border">
                      {group.questions.length}
                    </span>
                  </div>
                  <Accordion type="multiple" className="space-y-3">
                    {group.questions.map((q) => (
                      <AccordionItem
                        key={q.id}
                        value={q.id}
                        className="bg-white/[0.03] border border-brand-border rounded-xl px-6 data-[state=open]:border-brand-primary/40 data-[state=open]:bg-brand-primarySoft/30 transition-all overflow-hidden"
                      >
                        <AccordionTrigger className="text-left text-brand-textPrimary hover:no-underline hover:text-brand-primary transition-colors py-5">
                          {q.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-brand-textSecondary text-base leading-relaxed pb-6">
                          <div
                            className="whitespace-pre-wrap prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: q.answer }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
