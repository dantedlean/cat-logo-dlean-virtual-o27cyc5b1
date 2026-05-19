import { ChevronRight, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import useCatalogStore from '@/stores/use-catalog-store'
import { toast } from 'sonner'

export default function CatalogPage() {
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
      image: 'https://img.usecurling.com/p/600/400?q=box&color=gray',
      specs: {
        Material: 'Definir',
        Dimensões: '0x0x0mm',
        Capacidade: '0kg',
        Acabamento: 'Definir',
      },
      complementary: 'Informações adicionais do produto.',
    })
    toast.success('Novo produto adicionado à visualização atual.')
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
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

// Temporary inline import for the missing icon above
import { Search } from 'lucide-react'
