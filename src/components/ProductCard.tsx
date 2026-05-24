import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Image as ImageIcon, Copy, Trash, MoveRight } from 'lucide-react'
import { EditableField } from './EditableField'
import { Product, GROUPS, LINES } from '@/lib/constants'
import useCatalogStore from '@/stores/use-catalog-store'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function ProductCard({ product }: { product: Product }) {
  const { editMode, updateProduct, deleteProduct, addProduct } = useCatalogStore()

  const getLineColor = (line: string | null) => {
    switch (line) {
      case 'Linha Leve':
        return 'bg-red-600 hover:bg-red-700'
      case 'Linha Média':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'Linha Pesada':
        return 'bg-emerald-500 hover:bg-emerald-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [moveGrp, setMoveGrp] = useState(product.group)
  const [moveLin, setMoveLin] = useState(product.line || '')
  const moveGroupHasLines = GROUPS.find((g) => g.id === moveGrp)?.hasLines

  const handleDuplicate = () => {
    const duplicated: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      code: `${product.code}-COPY`,
      name: `${product.name} (Cópia)`,
    }
    addProduct(duplicated)
  }

  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white border-muted relative">
      <div className="relative overflow-hidden aspect-[4/3] bg-muted flex items-center justify-center border-b group/image">
        {product.images && product.images.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {product.images.map((img, idx) => (
                <CarouselItem key={idx} className="h-full">
                  <div className="w-full h-full aspect-[4/3]">
                    <img
                      src={img}
                      alt={`${product.name} - Imagem ${idx + 1}`}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover/image:scale-105"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-white/70 hover:bg-white border-0 opacity-0 group-hover/image:opacity-100 transition-opacity w-8 h-8" />
                <CarouselNext className="right-2 bg-white/70 hover:bg-white border-0 opacity-0 group-hover/image:opacity-100 transition-opacity w-8 h-8" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        {editMode && (
          <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              className="bg-red-500 hover:bg-red-600 text-white shadow-sm h-8 w-8 p-0"
              title="Remover todas as imagens"
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Tem certeza que deseja remover todas as imagens?')) {
                  updateProduct(product.id, { images: [] })
                }
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
            <label
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm flex items-center justify-center h-8 w-8 rounded-md cursor-pointer"
              title="Adicionar imagem"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageIcon className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files
                  if (!files || files.length === 0) return
                  const toastId = toast.loading('Enviando imagens...')
                  try {
                    const newUrls: string[] = []
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i]
                      const ext = file.name.split('.').pop()
                      const fileName = `product-${product.id}-${Date.now()}-${i}.${ext}`
                      const { error } = await supabase.storage.from('images').upload(fileName, file)
                      if (error) throw error
                      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
                      newUrls.push(data.publicUrl)
                    }
                    updateProduct(product.id, { images: [...(product.images || []), ...newUrls] })
                    toast.success('Imagens enviadas com sucesso!', { id: toastId })
                  } catch (err) {
                    toast.error('Erro ao enviar imagens.', { id: toastId })
                  }
                }}
              />
            </label>
          </div>
        )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {product.line && (
            <Badge className={`${getLineColor(product.line)} text-white border-0`}>
              {product.line}
            </Badge>
          )}
          <Badge variant="outline" className="font-mono bg-background">
            <EditableField
              value={product.code}
              onSave={(v) => updateProduct(product.id, { code: v })}
              editMode={editMode}
            />
          </Badge>
        </div>

        <h3 className="font-bold text-lg mb-4 text-foreground">
          <EditableField
            value={product.name}
            onSave={(v) => updateProduct(product.id, { name: v })}
            editMode={editMode}
          />
        </h3>

        <table className="w-full text-sm mb-4">
          <tbody>
            {Object.entries(product.specs).map(([k, v]) => (
              <tr key={k} className="border-b border-muted last:border-0">
                <td className="py-2 text-muted-foreground w-1/3 align-top">{k}</td>
                <td className="py-2 text-right font-medium text-foreground align-top">
                  <EditableField
                    value={v}
                    onSave={(newVal) =>
                      updateProduct(product.id, { specs: { ...product.specs, [k]: newVal } })
                    }
                    editMode={editMode}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-auto pt-4 text-sm text-muted-foreground border-t border-muted">
          <EditableField
            multiline
            value={product.complementary || ''}
            placeholder="Adicionar informações complementares..."
            onSave={(v) => updateProduct(product.id, { complementary: v })}
            editMode={editMode}
          />
        </div>
      </CardContent>

      {editMode && (
        <CardFooter className="p-4 bg-muted/30 border-t flex justify-end gap-2">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="secondary" title="Mover Produto">
                <MoveRight className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 grid gap-4" side="top">
              <div className="font-semibold text-sm">Mover Produto</div>
              <Select
                value={moveGrp}
                onValueChange={(v) => {
                  setMoveGrp(v)
                  setMoveLin(GROUPS.find((g) => g.id === v)?.hasLines ? 'Linha Leve' : '')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Grupo" />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {moveGroupHasLines && (
                <Select value={moveLin} onValueChange={setMoveLin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a Linha" />
                  </SelectTrigger>
                  <SelectContent>
                    {LINES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                onClick={() => {
                  updateProduct(product.id, {
                    group: moveGrp,
                    line: moveGroupHasLines ? moveLin : null,
                  })
                  setPopoverOpen(false)
                }}
                className="w-full"
              >
                Salvar Movimentação
              </Button>
            </PopoverContent>
          </Popover>
          <Button size="icon" variant="outline" title="Duplicar" onClick={handleDuplicate}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            title="Deletar"
            onClick={() => deleteProduct(product.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
