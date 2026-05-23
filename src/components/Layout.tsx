import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Navigation } from './Navigation'
import { useCms } from '@/stores/use-cms-store'

export default function Layout() {
  const { loadContent } = useCms()

  useEffect(() => {
    loadContent()
  }, [loadContent])

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 font-sans text-foreground selection:bg-primary/20">
      <Header />
      <Navigation />
      <main className="flex-1 flex flex-col relative w-full max-w-[1600px] mx-auto">
        <Outlet />
      </main>
      <footer className="bg-white py-8 text-center text-sm text-muted-foreground border-t mt-auto">
        <div className="container mx-auto px-4">
          <p className="font-medium text-foreground/80 mb-2">
            D-Lean Solutions - Especialistas em Intralogística
          </p>
          <p>
            &copy; {new Date().getFullYear()} Catálogo Técnico Interativo. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
