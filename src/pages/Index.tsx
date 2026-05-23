import { useMemo } from 'react'
import { Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import useCatalogStore from '@/stores/use-catalog-store'
import { GROUPS } from '@/lib/constants'
import { HeroCarousel } from '@/components/HeroCarousel'
import { GroupProductsView } from '@/components/GroupProductsView'

function HomeHeroView() {
  const { products, setSelectedGroup, setSelectedLine } = useCatalogStore()

  const groups = useMemo(() => {
    const dynamicGroups = products.map((p) => p.group)
    const allGroups = new Set([...GROUPS.map((g) => g.id), ...dynamicGroups])
    return Array.from(allGroups).sort((a, b) => {
      if (a === b) return 0
      if (a === 'Outras Soluções') return 1
      if (b === 'Outras Soluções') return -1
      if (a === 'Sistemas') return 1
      if (b === 'Sistemas') return -1
      return a.localeCompare(b)
    })
  }, [products])

  const handleNav = (group: string) => {
    setSelectedGroup(group)
    setSelectedLine(null)
  }

  return (
    <div className="flex-1 flex flex-col w-full pb-20 overflow-x-hidden">
      <section className="animate-fade-in-down w-full">
        <HeroCarousel />
      </section>

      <section className="animate-fade-in-up mt-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground tracking-tight flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-full hidden sm:block"></div>
          Explorar Famílias
        </h2>

        {groups.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed text-muted-foreground">
            Nenhum produto cadastrado no catálogo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {groups.map((group, idx) => (
              <div
                key={group}
                className="relative h-48 md:h-64 rounded-3xl overflow-hidden cursor-pointer group/card shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-muted flex items-center justify-center animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => handleNav(group)}
              >
                <img
                  src={`https://img.usecurling.com/p/800/600?q=${encodeURIComponent(group)}&color=gray`}
                  alt={group}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover/card:via-black/50 transition-colors z-0" />
                <h3 className="text-white text-3xl md:text-4xl font-bold drop-shadow-xl z-10">
                  {group}
                </h3>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function GlobalSearchResults() {
  const { searchQuery, setSearchQuery, filteredProducts } = useCatalogStore()

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 px-4 rounded-lg shadow-sm border gap-4">
        <div className="text-sm flex items-center gap-2 text-muted-foreground w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-2 rounded-full shrink-0"
            onClick={() => setSearchQuery('')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span>Busca global</span>
          <span className="font-semibold text-primary">"{searchQuery}"</span>
        </div>
        <span className="text-xs font-medium bg-muted px-3 py-1.5 rounded-full text-foreground/80 whitespace-nowrap">
          {filteredProducts.length} itens encontrados
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in-up">
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-md w-full">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Não encontramos itens que correspondam à sua busca.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-10">
          {filteredProducts.map((p, i) => (
            <div
              key={p.id}
              className="animate-fade-in-up h-full"
              style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CatalogPage() {
  const { selectedGroup, searchQuery } = useCatalogStore()

  if (searchQuery) return <GlobalSearchResults />
  if (selectedGroup) return <GroupProductsView />
  return <HomeHeroView />
}
