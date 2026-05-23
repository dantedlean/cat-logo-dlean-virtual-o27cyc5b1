import { useMemo } from 'react'
import { ArrowLeft, Search, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import useCatalogStore from '@/stores/use-catalog-store'
import { GROUPS, LINES } from '@/lib/constants'
import { toast } from 'sonner'

export function GroupProductsView() {
  const { products, selectedGroup, editMode, addProduct, setFilters } = useCatalogStore()
  const activeGroupInfo = GROUPS.find((g) => g.id === selectedGroup)

  const groupProducts = useMemo(
    () => products.filter((p) => p.group === selectedGroup),
    [products, selectedGroup],
  )

  if (!activeGroupInfo) return null

  const handleAddProduct = (line: string | null) => {
    const newId = `prod_${Date.now()}`
    addProduct({
      id: newId,
      code: `CP-${Math.floor(Math.random() * 900) + 100}`,
      name: 'Novo Produto',
      group: selectedGroup || 'Bancadas',
      line: line,
      images: ['https://img.usecurling.com/p/600/400?q=box&color=gray'],
      specs: { Material: 'Definir', Dimensões: '0x0x0mm' },
      complementary: 'Informações adicionais do produto.',
    })
    toast.success('Novo produto adicionado!')
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8 pb-20 animate-fade-in-up">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFilters(null, null, '')}
          className="rounded-full shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          {selectedGroup}
        </h2>
      </div>

      {editMode && (
        <div className="bg-primary/10 border-l-4 border-primary text-primary px-5 py-4 rounded-r-md flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">Modo Edição Ativo</h2>
            <p className="text-sm opacity-80">
              Gerencie os produtos da categoria {selectedGroup}. Clique em adicionar para inserir
              novos itens.
            </p>
          </div>
          {!activeGroupInfo.hasLines && (
            <Button onClick={() => handleAddProduct(null)} className="shadow-sm shrink-0">
              <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Produto
            </Button>
          )}
        </div>
      )}

      {groupProducts.length === 0 && !editMode && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-md w-full">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground">
              Esta categoria ainda não possui produtos publicados.
            </p>
          </div>
        </div>
      )}

      {activeGroupInfo.hasLines ? (
        <div className="flex flex-col gap-12">
          {LINES.map((line) => {
            const lineProducts = groupProducts.filter((p) => p.line === line)
            if (!editMode && lineProducts.length === 0) return null

            return (
              <div key={line} className="flex flex-col gap-4 animate-fade-in-up">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-2xl font-bold text-foreground">{line}</h3>
                  {editMode && (
                    <Button size="sm" variant="outline" onClick={() => handleAddProduct(line)}>
                      <PlusCircle className="w-4 h-4 mr-2" /> Adicionar em {line}
                    </Button>
                  )}
                </div>
                {lineProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lineProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-4 bg-muted/30 text-center rounded-lg border border-dashed">
                    Nenhum produto cadastrado na {line}.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groupProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
