import {
  ChevronRight,
  PlusCircle,
  Search,
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Trash,
  Images,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import useCatalogStore, { Product } from '@/stores/use-catalog-store'
import { toast } from 'sonner'
import { CmsText } from '@/components/CmsText'
import { useMemo, useRef, useState, useEffect } from 'react'
import { GROUPS, LINES } from '@/lib/constants'
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { useCms } from '@/stores/use-cms-store'
import { supabase } from '@/lib/supabase/client'
import { useSearchParams } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

function HomeHeroCarousel() {
  const { editMode, products } = useCatalogStore()
  const { content, setContent } = useCms()

  const [uploading, setUploading] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allProductImages = Array.from(new Set(products.flatMap((p) => p.images || [])))

  const rawHeroData = content['home_hero']
  let heroImages: string[] = []
  try {
    heroImages = rawHeroData ? JSON.parse(rawHeroData) : []
  } catch {
    /* intentionally ignored */
  }

  const hasImages = heroImages.length > 0
  const plugins = useMemo(() => {
    return [Autoplay({ delay: 5000, stopOnInteraction: true, playOnInit: false })]
  }, [hasImages])

  if (!hasImages && !editMode) {
    return null
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)

    let newImageUrls: string[] = []

    for (const file of files) {
      try {
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
        const { error } = await supabase.storage.from('images').upload(fileName, file)
        if (error) throw error
        const { data } = supabase.storage.from('images').getPublicUrl(fileName)
        newImageUrls.push(data.publicUrl)
      } catch (error) {
        toast.error('Erro ao enviar imagem')
      }
    }

    if (newImageUrls.length > 0) {
      const updatedImages = [...heroImages, ...newImageUrls]
      await setContent('home_hero', JSON.stringify(updatedImages), 'text')
      toast.success('Imagem(ns) hero adicionada(s)!')
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addFromGallery = async (imgUrl: string) => {
    const updatedImages = [...heroImages, imgUrl]
    await setContent('home_hero', JSON.stringify(updatedImages), 'text')
    toast.success('Imagem hero adicionada com sucesso!')
    setIsGalleryOpen(false)
  }

  const removeImage = async (idxToRemove: number) => {
    const imgUrl = heroImages[idxToRemove]
    const updatedImages = heroImages.filter((_, i) => i !== idxToRemove)
    await setContent('home_hero', JSON.stringify(updatedImages), 'text')

    try {
      if (imgUrl.includes('/storage/v1/object/public/images/')) {
        const fileName = imgUrl.split('/').pop()
        if (fileName) {
          await supabase.storage.from('images').remove([fileName])
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const moveImage = async (idx: number, dir: number) => {
    const updatedImages = [...heroImages]
    const temp = updatedImages[idx]
    updatedImages[idx] = updatedImages[idx + dir]
    updatedImages[idx + dir] = temp
    await setContent('home_hero', JSON.stringify(updatedImages), 'text')
  }

  return (
    <div className="w-full relative mb-10 group/hero">
      {hasImages ? (
        <Carousel
          opts={{ loop: true }}
          plugins={plugins}
          className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-lg"
        >
          <CarouselContent className="h-full">
            {heroImages.map((img, idx) => (
              <CarouselItem key={idx} className="h-full relative">
                <img src={img} alt={`Hero ${idx}`} className="w-full h-full object-cover" />

                {editMode && (
                  <div className="absolute top-4 left-4 flex gap-2 z-30 bg-zinc-900/90 p-2 rounded-xl backdrop-blur-md shadow-xl border border-white/10">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-10 w-10 shadow-sm bg-red-600 hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(idx)
                      }}
                    >
                      <Trash className="w-5 h-5 text-white" />
                    </Button>
                    {idx > 0 && (
                      <Button
                        size="icon"
                        className="h-10 w-10 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveImage(idx, -1)
                        }}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                    )}
                    {idx < heroImages.length - 1 && (
                      <Button
                        size="icon"
                        className="h-10 w-10 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveImage(idx, 1)
                        }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="w-full h-[300px] md:h-[400px] rounded-3xl bg-muted border-2 border-dashed flex items-center justify-center text-muted-foreground shadow-sm">
          Nenhuma imagem de destaque cadastrada.
        </div>
      )}

      {editMode && (
        <>
          <div className="absolute top-4 right-4 z-40 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-xl flex items-center gap-2 font-bold bg-zinc-900 hover:bg-zinc-800 text-white border-0"
              onClick={() => setIsGalleryOpen(true)}
              title="Escolher imagem do catálogo"
            >
              <Images className="w-4 h-4" />
              Galeria
            </Button>
            <Button
              size="sm"
              className="shadow-xl flex items-center gap-2 font-bold bg-zinc-900 hover:bg-zinc-800 text-white border-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
              Upload
            </Button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
          </div>

          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Selecionar Imagem Hero para a Página Inicial</DialogTitle>
                <DialogDescription>
                  Escolha uma imagem do catálogo de produtos para adicionar ao carrossel principal.
                </DialogDescription>
              </DialogHeader>
              {allProductImages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma imagem de produto encontrada no catálogo.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                  {allProductImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary/50 group/gal"
                      onClick={() => addFromGallery(img)}
                    >
                      <img
                        src={img}
                        alt={`Opção ${idx}`}
                        className="w-full h-full object-cover transition-transform group-hover/gal:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

function GroupCard({
  group,
  products,
  index,
  onNavigate,
}: {
  group: string
  products: Product[]
  index: number
  onNavigate: (g: string) => void
}) {
  const [api, setApi] = useState<CarouselApi>()
  const { editMode } = useCatalogStore()
  const { content, setContent } = useCms()
  const [uploading, setUploading] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const heroKey = `hero_img_group_${group}`
  const heroImage = content[heroKey]

  const hasHero = !!heroImage
  const plugins = useMemo(() => {
    return [Autoplay({ delay: 3000 + index * 500, stopOnInteraction: true, playOnInit: false })]
  }, [hasHero, index])

  const allImages = Array.from(new Set(products.flatMap((p) => p.images || [])))
  const displayImages = heroImage
    ? [heroImage]
    : allImages.length > 0
      ? allImages.slice(0, 5)
      : [
          `https://img.usecurling.com/p/800/800?q=industry&color=${['blue', 'gray', 'green', 'orange', 'red'][index % 5]}`,
        ]

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      await setContent(heroKey, data.publicUrl, 'image')
      toast.success('Imagem hero atualizada!')
    } catch (error) {
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <div
        className="relative h-72 md:h-96 rounded-3xl overflow-hidden cursor-pointer group/card shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => onNavigate(group)}
        onMouseEnter={() => {
          if (!heroImage && api) {
            try {
              // Engine Availability Check
              if (typeof api.internalEngine === 'function' && !api.internalEngine()) return
              const autoplay = api.plugins()?.autoplay as any
              if (autoplay) autoplay.stop()
            } catch {
              /* intentionally ignored */
            }
          }
        }}
        onMouseLeave={() => {
          if (!heroImage && api) {
            try {
              // Engine Availability Check
              if (typeof api.internalEngine === 'function' && !api.internalEngine()) return
              // Safe Visibility Check wrapper for interaction
              const documentIsHidden = typeof document !== 'undefined' ? document.hidden : false
              if (documentIsHidden) return
              const autoplay = api.plugins()?.autoplay as any
              if (autoplay) autoplay.play()
            } catch {
              /* intentionally ignored */
            }
          }
        }}
      >
        {heroImage ? (
          <img src={heroImage} alt={group} className="w-full h-full object-cover" />
        ) : (
          <Carousel
            setApi={setApi}
            opts={{ loop: true }}
            plugins={plugins}
            className="w-full h-full pointer-events-none"
          >
            <CarouselContent className="h-full">
              {displayImages.map((img, idx) => (
                <CarouselItem key={idx} className="h-full">
                  <img src={img} alt={`${group} ${idx}`} className="w-full h-full object-cover" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        {editMode && (
          <div
            className="absolute top-4 right-4 z-30 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="secondary"
              className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md border-0 h-9 w-9 rounded-md"
              onClick={() => setIsGalleryOpen(true)}
              title="Escolher da Galeria"
            >
              <Images className="w-4 h-4" />
            </Button>
            <label className="cursor-pointer">
              <div
                className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md h-9 w-9 rounded-md flex items-center justify-center transition-colors"
                title="Upload Imagem Hero"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover/card:via-black/40 transition-colors flex flex-col justify-end p-8 pointer-events-none z-10">
          <h3 className="text-white text-3xl font-bold drop-shadow-lg mb-2">{group}</h3>
          <div className="flex items-center text-white/80 font-medium text-sm group-hover/card:text-white transition-colors">
            Ver {products.length} {products.length === 1 ? 'produto' : 'produtos'}{' '}
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>

      {editMode && (
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Selecionar Imagem Hero para {group}</DialogTitle>
              <DialogDescription>
                Escolha uma imagem para ser a capa oficial desta categoria.
              </DialogDescription>
            </DialogHeader>
            {allImages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma imagem de produto encontrada nesta categoria.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group/gal ${heroImage === img ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-primary/50'}`}
                    onClick={() => {
                      setContent(heroKey, img, 'image')
                      setIsGalleryOpen(false)
                      toast.success('Imagem hero atualizada com sucesso!')
                    }}
                  >
                    <img
                      src={img}
                      alt={`Opção ${idx}`}
                      className="w-full h-full object-cover transition-transform group-hover/gal:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function HomeHeroView() {
  const { products, setFilters } = useCatalogStore()

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
    setFilters(group, null, '')
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col gap-14 pb-20">
      <section className="animate-fade-in-up w-full">
        <HomeHeroCarousel />
      </section>

      <section className="animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground tracking-tight">
          <CmsText id="hero_title_main" defaultText="Nossas Famílias de Produtos" />
        </h2>

        {groups.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed text-muted-foreground">
            Nenhum produto cadastrado no catálogo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {groups.map((group, i) => (
              <GroupCard
                key={group}
                group={group}
                products={products.filter((p) => p.group === group)}
                index={i}
                onNavigate={handleNav}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function LineSelectionView({
  group,
  onNavigate,
}: {
  group: string
  onNavigate: (l: string | null) => void
}) {
  const { setFilters, editMode, products } = useCatalogStore()
  const { content, setContent } = useCms()
  const [uploading, setUploading] = useState<string | null>(null)
  const [galleryForLine, setGalleryForLine] = useState<string | null>(null)

  const lines = [
    {
      id: 'Linha Leve',
      defaultImage: 'https://img.usecurling.com/p/800/600?q=light%20industry&color=gray',
    },
    {
      id: 'Linha Média',
      defaultImage: 'https://img.usecurling.com/p/800/600?q=factory&color=blue',
    },
    {
      id: 'Linha Pesada',
      defaultImage: 'https://img.usecurling.com/p/800/600?q=heavy%20industry&color=red',
    },
  ]

  const handleUpload = async (lineId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(lineId)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      await setContent(`hero_img_line_${lineId}`, data.publicUrl, 'image')
      toast.success(`Imagem da ${lineId} atualizada!`)
    } catch (error) {
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(null)
    }
  }

  // Get images specific to the selected line modal
  const lineImages = galleryForLine
    ? Array.from(
        new Set(
          products
            .filter((p) => p.group === group && p.line === galleryForLine)
            .flatMap((p) => p.images || []),
        ),
      )
    : []

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8 pb-20 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFilters(null, null, '')}
          className="rounded-full shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          {group} - Selecione a Linha
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {lines.map((line) => {
          const heroKey = `hero_img_line_${line.id}`
          const displayImage = content[heroKey] || line.defaultImage

          return (
            <div
              key={line.id}
              className="relative h-72 md:h-96 rounded-3xl overflow-hidden cursor-pointer group/card shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => onNavigate(line.id)}
            >
              <img
                src={displayImage}
                alt={line.id}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
              />

              {editMode && (
                <div
                  className="absolute top-4 right-4 z-30 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md border-0 h-9 w-9 rounded-md"
                    onClick={() => setGalleryForLine(line.id)}
                    title={`Escolher da Galeria para ${line.id}`}
                  >
                    <Images className="w-4 h-4" />
                  </Button>
                  <label className="cursor-pointer">
                    <div
                      className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md h-9 w-9 rounded-md flex items-center justify-center transition-colors"
                      title={`Upload Imagem para ${line.id}`}
                    >
                      {uploading === line.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImagePlus className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleUpload(line.id, e)}
                    />
                  </label>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover/card:via-black/50 transition-colors flex flex-col justify-end p-8 pointer-events-none z-10">
                <h3 className="text-white text-3xl font-bold drop-shadow-lg mb-2">{line.id}</h3>
                <div className="flex items-center text-white/80 font-medium text-sm group-hover/card:text-white transition-colors">
                  Ver produtos <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editMode && (
        <Dialog open={!!galleryForLine} onOpenChange={(open) => !open && setGalleryForLine(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Selecionar Imagem Hero para {galleryForLine}</DialogTitle>
              <DialogDescription>
                Escolha uma imagem de produto cadastrado nesta linha para servir como capa.
              </DialogDescription>
            </DialogHeader>
            {lineImages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma imagem de produto encontrada nesta linha.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {lineImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all group/gal"
                    onClick={() => {
                      if (galleryForLine) {
                        setContent(`hero_img_line_${galleryForLine}`, img, 'image')
                        setGalleryForLine(null)
                        toast.success('Imagem hero da linha atualizada com sucesso!')
                      }
                    }}
                  >
                    <img
                      src={img}
                      alt={`Opção ${idx}`}
                      className="w-full h-full object-cover transition-transform group-hover/gal:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onNavigate('ALL')}
          className="rounded-full px-8"
        >
          Ver todos os produtos de {group}
        </Button>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const {
    products,
    isLoading,
    selectedGroup,
    selectedLine,
    searchQuery,
    filteredProducts,
    editMode,
    setSearchQuery,
    setSelectedGroup,
    setSelectedLine,
    setFilters,
    addProduct,
  } = useCatalogStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const isSyncing = useRef(false)

  // Sync URL to Store
  useEffect(() => {
    const urlGroup = searchParams.get('group')
    const urlLine = searchParams.get('line')
    const urlSearch = searchParams.get('q') || ''

    if (urlGroup !== selectedGroup || urlLine !== selectedLine || urlSearch !== searchQuery) {
      isSyncing.current = true
      setFilters(urlGroup, urlLine, urlSearch)
      setTimeout(() => {
        isSyncing.current = false
      }, 50)
    }
  }, [searchParams])

  // Sync Store to URL
  useEffect(() => {
    if (isSyncing.current) return
    const params = new URLSearchParams()
    if (selectedGroup) params.set('group', selectedGroup)
    if (selectedLine) params.set('line', selectedLine)
    if (searchQuery) params.set('q', searchQuery)

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params)
    }
  }, [selectedGroup, selectedLine, searchQuery])

  const activeGroupInfo = GROUPS.find((g) => g.id === selectedGroup)
  const activeGroupLines = useMemo(() => {
    if (!selectedGroup) return []
    const lines = new Set<string>()
    if (activeGroupInfo?.hasLines) {
      LINES.forEach((l) => lines.add(l))
    }
    products.forEach((p) => {
      if (p.group === selectedGroup && p.line) lines.add(p.line)
    })
    return Array.from(lines).sort((a, b) => a.localeCompare(b))
  }, [selectedGroup, activeGroupInfo, products])

  if (isLoading && products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Carregando catálogo...</p>
      </div>
    )
  }

  if (!selectedGroup && !searchQuery) {
    return <HomeHeroView />
  }

  if (selectedGroup && !searchQuery && !selectedLine && activeGroupInfo?.hasLines) {
    return <LineSelectionView group={selectedGroup} onNavigate={(l) => setSelectedLine(l)} />
  }

  const handleAddProduct = () => {
    const newId = `prod_${Date.now()}`
    addProduct({
      id: newId,
      name: 'Novo Produto',
      code: `CP-${Math.floor(Math.random() * 900) + 100}`,
      group: selectedGroup || 'Bancadas',
      line: selectedLine || null,
      images: ['https://img.usecurling.com/p/600/400?q=box&color=gray'],
      specs: {
        Material: 'Definir',
        Dimensões: '0x0x0mm',
        Capacidade: '0kg',
        Acabamento: 'Definir',
      },
      complementary: 'Informações adicionais do produto.',
    })
    toast.success('Novo produto adicionado!')
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
      {editMode && (
        <div className="bg-primary/10 border-l-4 border-primary text-primary px-5 py-4 rounded-r-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm animate-fade-in-down gap-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">Modo Edição Ativo</h2>
            <p className="text-sm opacity-80">
              Gerencie os produtos da categoria atual. Clique nos textos ou ícones para editar.
            </p>
          </div>
          <Button onClick={handleAddProduct} className="shadow-sm shrink-0">
            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Produto
          </Button>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 px-4 rounded-lg shadow-sm border gap-4">
        <div className="text-sm flex items-center flex-wrap gap-2 text-muted-foreground w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-2 rounded-full shrink-0"
            onClick={() => {
              if (searchQuery) {
                setSearchQuery('')
              } else if (
                activeGroupInfo?.hasLines &&
                selectedLine !== null &&
                selectedLine !== 'ALL'
              ) {
                setSelectedLine(null)
              } else {
                setFilters(null, null, '')
              }
            }}
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {searchQuery ? (
            <>
              <span>Busca global</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              <span className="font-semibold text-primary">"{searchQuery}"</span>
            </>
          ) : (
            <>
              <span className="font-medium text-foreground text-lg">{selectedGroup}</span>
              {activeGroupLines.length > 0 && (
                <div className="flex gap-1 ml-2 flex-wrap">
                  <Button
                    variant={
                      selectedLine === 'ALL' || selectedLine === null ? 'secondary' : 'ghost'
                    }
                    size="sm"
                    className="h-7 text-xs rounded-full"
                    onClick={() => setSelectedLine('ALL')}
                  >
                    Todas as Linhas
                  </Button>
                  {activeGroupLines.map((l) => (
                    <Button
                      key={l}
                      variant={selectedLine === l ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs rounded-full"
                      onClick={() => setSelectedLine(l)}
                    >
                      {l}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
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
