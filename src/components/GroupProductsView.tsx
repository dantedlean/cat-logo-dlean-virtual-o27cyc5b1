import { useMemo, useState } from 'react'
import { ArrowLeft, Search, PlusCircle, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import useCatalogStore from '@/stores/use-catalog-store'
import { useCms } from '@/stores/use-cms-store'
import { GROUPS, LINES } from '@/lib/constants'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export function GroupProductsView() {
  const {
    products,
    selectedGroup,
    selectedLine,
    setSelectedLine,
    editMode,
    addProduct,
    setFilters,
  } = useCatalogStore()
  const { content, setContent } = useCms()
  const activeGroupInfo = GROUPS.find((g) => g.id === selectedGroup)
  const [uploadingLine, setUploadingLine] = useState<string | null>(null)

  const groupProducts = useMemo(
    () => products.filter((p) => p.group === selectedGroup),
    [products, selectedGroup],
  )

  const lineProducts = useMemo(
    () => groupProducts.filter((p) => p.line === selectedLine),
    [groupProducts, selectedLine],
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

  const handleImageUpload = async (line: string, file: File) => {
    setUploadingLine(line)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `line-${line.replace(/\s+/g, '').toLowerCase()}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      await setContent(`line_img_${line}`, data.publicUrl, 'image', {})
      toast.success('Imagem da linha atualizada!')
    } catch (err) {
      toast.error('Erro ao fazer upload da imagem.')
    } finally {
      setUploadingLine(null)
    }
  }

  // Level 2: Bridge (Select Line)
  if (activeGroupInfo.hasLines && !selectedLine) {
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
            {selectedGroup} - Selecione uma Linha
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {LINES.map((line, idx) => {
            const lineImg =
              content[`line_img_${line}`]?.value ||
              `https://img.usecurling.com/p/800/600?q=${encodeURIComponent(line)}&color=gray`
            return (
              <div
                key={line}
                className="relative h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden cursor-pointer group/card shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-muted flex items-center justify-center animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => setSelectedLine(line)}
              >
                <img
                  src={lineImg}
                  alt={line}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover/card:via-black/50 transition-colors z-0" />
                <h3 className="text-white text-3xl md:text-4xl font-bold drop-shadow-xl z-10 text-center px-4">
                  {line}
                </h3>

                {editMode && (
                  <label
                    className="absolute top-4 right-4 bg-black/80 p-3 rounded-full cursor-pointer opacity-0 group-hover/card:opacity-100 transition-opacity z-20 hover:bg-black"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {uploadingLine === line ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(line, file)
                      }}
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Level 3: Products Grid
  const productsToDisplay = activeGroupInfo.hasLines ? lineProducts : groupProducts

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8 pb-20 animate-fade-in-up">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            activeGroupInfo.hasLines ? setSelectedLine(null) : setFilters(null, null, '')
          }
          className="rounded-full shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          {selectedGroup} {activeGroupInfo.hasLines && selectedLine ? `- ${selectedLine}` : ''}
        </h2>
      </div>

      {editMode && (
        <div className="bg-primary/10 border-l-4 border-primary text-primary px-5 py-4 rounded-r-md flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">Modo Edição Ativo</h2>
            <p className="text-sm opacity-80">
              Gerencie os produtos da categoria {selectedGroup}{' '}
              {selectedLine ? `(${selectedLine})` : ''}.
            </p>
          </div>
          <Button
            onClick={() => handleAddProduct(activeGroupInfo.hasLines ? selectedLine : null)}
            className="shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Produto
          </Button>
        </div>
      )}

      {productsToDisplay.length === 0 && !editMode && (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productsToDisplay.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
