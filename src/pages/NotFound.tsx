import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-8xl md:text-9xl font-extrabold text-brand-primary mb-4 drop-shadow-sm">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-brand-textPrimary mb-4">
          Página não encontrada
        </h2>
        <p className="text-brand-textSecondary mb-10 max-w-md mx-auto text-lg">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primaryHover transition-colors shadow-lg shadow-brand-primary/25"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  )
}
