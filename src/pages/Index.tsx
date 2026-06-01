import { Sparkles } from 'lucide-react'

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl flex flex-col items-center flex-1 justify-center">
      <div className="flex flex-col items-center text-center mb-16 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
            Plataforma de Perguntas Frequentes
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-textPrimary tracking-tight mb-6 max-w-3xl leading-tight">
          Como podemos <span className="text-brand-primary">ajudar?</span>
        </h1>

        <p className="text-lg md:text-xl text-brand-textSecondary max-w-2xl mx-auto font-medium leading-relaxed">
          Respostas validadas para as perguntas mais frequentes sobre o Skip Cloud. Em breve
          disponível.
        </p>
      </div>

      <div
        className="w-full p-12 border-2 border-dashed border-brand-border rounded-2xl bg-brand-surface/30 flex items-center justify-center animate-fade-in"
        style={{ animationDelay: '150ms' }}
      >
        <p className="text-brand-textMuted text-lg font-medium text-center">
          Listagem de perguntas será implementada na Fase 2.
        </p>
      </div>
    </div>
  )
}
