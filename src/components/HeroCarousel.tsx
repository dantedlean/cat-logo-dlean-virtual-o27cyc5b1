import { useState, useEffect } from 'react'
import { useCms } from '@/stores/use-cms-store'
import useCatalogStore from '@/stores/use-catalog-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel'
import { ImagePlus, Loader2, Plus, Trash } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function HeroCarousel() {
  const { content, setContent } = useCms()
  const { editMode, setSelectedGroup, setSelectedLine } = useCatalogStore()
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const defaultSlides = [
    {
      title: 'Bancadas',
      description: 'Bancadas de alta performance',
      image: 'https://img.usecurling.com/p/1600/900?q=industry&color=blue',
      link: 'Bancadas',
    },
    {
      title: 'Carrinhos',
      description: 'Soluções logísticas para movimentação',
      image: 'https://img.usecurling.com/p/1600/900?q=warehouse&color=gray',
      link: 'Carrinhos',
    },
    {
      title: 'Estantes',
      description: 'Armazenamento eficiente e flexível',
      image: 'https://img.usecurling.com/p/1600/900?q=shelves&color=orange',
      link: 'Estantes',
    },
  ]

  const carouselData = content['hero_carousel']
  const slides =
    carouselData?.metadata &&
    Array.isArray(carouselData.metadata) &&
    carouselData.metadata.length > 0
      ? carouselData.metadata
      : defaultSlides

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on('select', () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  useEffect(() => {
    if (!api) return
    const timer = setInterval(() => {
      if (!document.hidden && api.canScrollNext()) api.scrollNext()
      else if (!document.hidden) api.scrollTo(0)
    }, 5000)
    return () => clearInterval(timer)
  }, [api])

  return (
    <div className="w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black mb-10 shadow-xl border-b border-border group/hero">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        className="w-full h-[350px] md:h-[500px] lg:h-[600px] overflow-hidden"
      >
        <CarouselContent className="h-full">
          {slides.map((slide, idx) => (
            <CarouselItem
              key={idx}
              className="h-full relative cursor-pointer flex-[0_0_100%] min-w-0"
              onClick={() => {
                setSelectedGroup(slide.link)
                setSelectedLine(null)
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-20 pb-16 md:pb-24">
                <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8">
                  <h2 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-2xl">
                    {slide.title}
                  </h2>
                  <p className="text-white/90 text-lg md:text-2xl mt-4 font-medium drop-shadow-lg max-w-2xl">
                    {slide.description}
                  </p>
                  <Button
                    variant="default"
                    size="lg"
                    className="mt-8 shadow-xl text-lg px-8 rounded-full pointer-events-none"
                  >
                    Explorar
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-md ${current === idx ? 'bg-primary scale-125' : 'bg-white/50'}`}
          />
        ))}
      </div>

      {editMode && (
        <div
          className="absolute top-4 right-4 z-40 opacity-0 group-hover/hero:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <ManageCarouselDialog
            initialSlides={slides}
            onSave={(newSlides) => setContent('hero_carousel', 'active', 'carousel', newSlides)}
          />
        </div>
      )}
    </div>
  )
}

function ManageCarouselDialog({
  initialSlides,
  onSave,
}: {
  initialSlides: any[]
  onSave: (s: any[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [slides, setSlides] = useState(initialSlides)
  const [uploading, setUploading] = useState<number | null>(null)

  const handleUpload = async (index: number, file: File) => {
    setUploading(index)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      const newSlides = [...slides]
      newSlides[index].image = data.publicUrl
      setSlides(newSlides)
      toast.success('Imagem carregada!')
    } catch {
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) setSlides(initialSlides)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-zinc-900/90 text-white hover:bg-zinc-800 border border-white/10 shadow-xl"
        >
          Gerenciar Carousel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Slides do Carousel</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="border p-4 rounded-lg flex flex-col gap-3 relative bg-muted/30"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 z-10"
                onClick={() => setSlides(slides.filter((_, i) => i !== idx))}
              >
                <Trash className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
                <div className="relative aspect-video md:aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center border border-dashed">
                  {slide.image ? (
                    <img src={slide.image} className="w-full h-full object-cover" alt="Slide" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem Imagem</span>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                    {uploading === idx ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-white" />
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleUpload(idx, e.target.files[0])}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    value={slide.title}
                    onChange={(e) => {
                      const n = [...slides]
                      n[idx].title = e.target.value
                      setSlides(n)
                    }}
                    placeholder="Título principal"
                  />
                  <Input
                    value={slide.link}
                    onChange={(e) => {
                      const n = [...slides]
                      n[idx].link = e.target.value
                      setSlides(n)
                    }}
                    placeholder="Link exatos (Ex: Bancadas)"
                  />
                  <Textarea
                    value={slide.description}
                    onChange={(e) => {
                      const n = [...slides]
                      n[idx].description = e.target.value
                      setSlides(n)
                    }}
                    placeholder="Descrição curta"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="border-dashed"
            onClick={() =>
              setSlides([...slides, { title: '', description: '', image: '', link: '' }])
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Slide
          </Button>
          <Button
            onClick={() => {
              onSave(slides)
              setOpen(false)
              toast.success('Carousel salvo!')
            }}
          >
            Salvar Carousel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
