import { useState } from 'react'
import { Search, ArrowLeft, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import useCatalogStore from '@/stores/use-catalog-store'
import { useCms } from '@/stores/use-cms-store'
import { GROUPS } from '@/lib/constants'
import { HeroCarousel } from '@/components/HeroCarousel'
import { GroupProductsView } from '@/components/GroupProductsView'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

function HomeHeroView() {
  const { setSelectedGroup, setSelectedLine, editMode } = useCatalogStore()
  const { content, setContent } = useCms()
  const [uploadingGroup, setUploadingGroup] = useState<string | null>(null)

  const handleNav = (group: string) => {
    setSelectedGroup(group)
    setSelectedLine(null)
  }

  const handleImageUpload = async (groupId: string, file: File) => {
    setUploadingGroup(groupId)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `family-${groupId}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      await setContent(`family_img_${groupId}`, data.publicUrl, 'image', {})
      toast.success('Imagem atualizada com sucesso!')
    } catch (err) {
      toast.error('Erro ao fazer upload da imagem.')
    } finally {
      setUploadingGroup(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full pb-20 overflow-x-hidden">
      <section className="animate-fade-in-down w-full">
        <HeroCarousel />
      </section>

      <section className="animate-fade-in-up mt-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground tracking-tight flex items-center gap-3">
          <span>Qua é o seu desafio?</span>
        </h2>

        <div className="relative group/carousel px-0 sm:px-10">
          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
            <CarouselContent className="-ml-4">
              {GROUPS.map((group, idx) => {
                const familyImg =
                  content[`family_img_${group.id}`]?.value ||
                  `https://img.usecurling.com/p/800/600?q=${encodeURIComponent(group.id)}&color=gray`

                return (
                  <CarouselItem
                    key={group.id}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div
                      className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group/card shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-muted flex items-center justify-center animate-fade-in-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => handleNav(group.id)}
                    >
                      <img
                        src={familyImg}
                        alt={group.label}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover/card:via-black/50 transition-colors z-0" />
                      <h3 className="text-white text-2xl md:text-3xl font-bold drop-shadow-xl z-10 text-center px-4">
                        {group.label}
                      </h3>

                      {editMode && (
                        <label
                          className="absolute top-4 right-4 bg-black/80 p-2 rounded-full cursor-pointer opacity-0 group-hover/card:opacity-100 transition-opacity z-20 hover:bg-black"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {uploadingGroup === group.id ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          ) : (
                            <ImagePlus className="w-5 h-5 text-white" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(group.id, file)
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4 w-12 h-12" />
            <CarouselNext className="hidden sm:flex -right-4 w-12 h-12" />
          </Carousel>
        </div>
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
