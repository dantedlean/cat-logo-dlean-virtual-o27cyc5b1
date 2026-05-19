import { useRef } from 'react'
import { ChevronRight, PlusCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import useCatalogStore from '@/stores/use-catalog-store'
import { toast } from 'sonner'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'

export default function CatalogPage() {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))
  const { filteredProducts, selectedGroup, selectedLine, searchQuery, editMode, addProduct } =
    useCatalogStore()

  const handleAddProduct = () => {
    const newId = `prod_${Date.now()}`
    addProduct({
      id: newId,
      name: 'Novo Produto',
      code: `CP-${Math.floor(Math.random() * 900) + 100}`,
      group: selectedGroup,
      line: selectedLine || '',
      images: ['https://img.usecurling.com/p/600/400?q=box&color=gray'],
      specs: {
        Material: 'Definir',
        Dimensões: '0x0x0mm',
        Capacidade: '0kg',
        Acabamento: 'Definir',
      },
      complementary: 'Informações adicionais do produto.',
    })
    toast.success('Novo produto em processamento...')
  }

  const heroImages = [
    {
      group: 'Soluções Integradas',
      image: 'https://img.usecurling.com/p/1600/600?q=manufacturing%20assembly%20line&color=blue',
      subtitle: 'Para processos lean',
    },
    {
      group: 'Eficiência e Ergonomia',
      image: 'https://img.usecurling.com/p/1600/600?q=modern%20warehouse&color=gray',
      subtitle: 'Otimização de espaço e tempo',
    },
    {
      group: 'Qualidade Garantida',
      image: 'https://img.usecurling.com/p/1600/600?q=industrial%20production&color=green',
      subtitle: 'Produtos testados e validados',
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
      {!searchQuery && (
        <Carousel
          plugins={[plugin.current]}
          className="w-full mb-8 rounded-2xl overflow-hidden shadow-lg animate-fade-in"
        >
          <CarouselContent>
            {heroImages.map((h, i) => (
              <CarouselItem key={i}>
                <div className="relative h-64 md:h-[400px] w-full bg-muted">
                  <img src={h.image} className="w-full h-full object-cover" alt={h.group} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end pb-12">
                    <h2 className="text-white text-3xl md:text-5xl font-extrabold tracking-wider mb-2 drop-shadow-lg">
                      {h.group}
                    </h2>
                    <p className="text-white/90 text-lg md:text-xl font-medium">{h.subtitle}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}

      {editMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 px-5 py-4 rounded-r-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm animate-fade-in-down gap-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">Modo Edição Ativo</h2>
            <p className="text-sm opacity-80">
              As alterações são salvas automaticamente na sessão atual.
            </p>
          </div>
          <Button
            onClick={handleAddProduct}
            className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Produto
          </Button>
        </div>
      )}

      <div className="mb-8 text-sm flex items-center gap-2 text-muted-foreground bg-white p-3 px-4 rounded-lg shadow-sm border">
        {searchQuery ? (
          <>
            <span>Busca global</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            <span className="font-semibold text-primary">"{searchQuery}"</span>
            <span className="ml-auto text-xs font-medium bg-muted px-2 py-1 rounded-full">
              {filteredProducts.length} resultados
            </span>
          </>
        ) : (
          <>
            <span className="font-medium">{selectedGroup}</span>
            {selectedLine && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                <span className="font-semibold text-primary">{selectedLine}</span>
              </>
            )}
            <span className="ml-auto text-xs font-medium bg-muted px-2 py-1 rounded-full">
              {filteredProducts.length} itens
            </span>
          </>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-in-up">
          <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Não encontramos itens que correspondam aos filtros selecionados ou à sua busca.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-10">
          {filteredProducts.map((p, i) => (
            <div
              key={p.id}
              className="animate-fade-in-up h-full"
              style={{ animationDelay: `${Math.min(i * 50, 500)}ms`, animationFillMode: 'both' }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
