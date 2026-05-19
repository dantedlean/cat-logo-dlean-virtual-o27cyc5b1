import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const STATIC_VARIATIONS = [
  {
    title: 'Variação 1 (Flow Rack Padrão)',
    desc: 'Abastecimento contínuo traseiro: A logística repõe, a produção consome, sem cruzamento de fluxos.',
    fallbackImg: 'https://img.usecurling.com/p/800/600?q=industrial%20rack&color=blue',
  },
  {
    title: 'Variação 2 (Mini Flow Rack de Bancada)',
    desc: 'Compacto e ergonômico: Acesso rápido a componentes pequenos e kits diretamente no posto de trabalho.',
    fallbackImg: 'https://img.usecurling.com/p/800/600?q=workbench%20rack&color=blue',
  },
  {
    title: 'Variação 3 (Flow Rack com Retorno)',
    desc: 'Eficiência em dobro: Nível superior para abastecimento e trilho reverso inferior para devolução imediata de caixas vazias.',
    fallbackImg: 'https://img.usecurling.com/p/800/600?q=return%20rack&color=blue',
  },
  {
    title: 'Variação 4 (Flow Rack Super Pesado)',
    desc: 'Tubos reforçados e roletes duplos para movimentação gravitacional de peças de alta densidade.',
    fallbackImg: 'https://img.usecurling.com/p/800/600?q=heavy%20rack&color=blue',
  },
]

export function FlowRackLanding() {
  const [dbImages, setDbImages] = useState<string[]>([])

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase
        .from('products')
        .select('images, code')
        .eq('line', 'Flow Rack')
        .order('code', { ascending: true })
        .limit(4)

      if (data && !error) {
        const imgs = data.map((p) => {
          if (Array.isArray(p.images) && p.images.length > 0) {
            return p.images[0] as string
          }
          return ''
        })
        if (imgs.some((img) => img !== '')) {
          setDbImages(imgs)
        }
      }
    }
    fetchImages()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Block 1: Header / Cabeçalho de Impacto */}
      <section className="relative h-[600px] w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1600/900?q=flow%20rack%20industrial%20warehouse&color=black"
            alt="Flow Rack Hero"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Giro Perfeito: Organização Automática com Sistemas FIFO e Flow Racks
          </h1>
          <p className="text-xl md:text-3xl text-zinc-300 font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-backwards">
            O primeiro que entra é o primeiro que sai
          </p>
        </div>
      </section>

      {/* Block 2: Texto Mestre */}
      <section className="py-24 bg-background px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-6">
              O Fim das Paradas e das Perdas de Validade
            </h2>
            <div className="text-muted-foreground text-lg leading-relaxed space-y-6">
              <p>
                Na logística de alto desempenho e em linhas de montagem ágeis, um componente fora do
                lugar significa tempo e dinheiro perdidos. Os sistemas Flow Rack D-Lean utilizam o
                fluxo por gravidade para garantir o princípio{' '}
                <strong className="text-foreground">FIFO (First In, First Out)</strong>.
              </p>
              <p>
                O material abastecido na parte traseira desliza automaticamente para a frente,
                garantindo que o operador tenha sempre a peça certa, no tempo exato, sem precisar
                interromper o processo para buscar material.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-2xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-primary">O DNA D-Lean:</span> Diferenciais Técnicos
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-foreground text-lg mb-1">
                    Roletes de Alta Performance
                  </strong>
                  <span className="text-muted-foreground text-sm">
                    Deslizamento suave e contínuo, projetado para suportar tráfego intenso de caixas
                    plásticas, KLTs ou papelão.
                  </span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-foreground text-lg mb-1">Ajuste Milimétrico</strong>
                  <span className="text-muted-foreground text-sm">
                    Níveis e inclinações totalmente configuráveis. Se a sua caixa mudar de tamanho
                    amanhã, o seu Flow Rack se adapta no mesmo dia, sem necessidade de solda ou
                    descarte.
                  </span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-foreground text-lg mb-1">Carga Comprovada</strong>
                  <span className="text-muted-foreground text-sm">
                    Estruturas modulares que suportam até 140 kg (em vãos de 450mm), garantindo
                    estabilidade absoluta para componentes pesados.
                  </span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-foreground text-lg mb-1">Proteção Total</strong>
                  <span className="text-muted-foreground text-sm">
                    Opções em aço Inox e sistemas antiestáticos (ESD), atendendo às rigorosas normas
                    dos setores eletrônico e farmacêutico.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Block 3: A Vitrine Dinâmica (O Carrossel) */}
      <section className="py-24 bg-muted/30 px-4 md:px-6 border-t border-b border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Soluções Adaptáveis
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conheça as variações do nosso sistema e como elas podem transformar o seu layout
              produtivo.
            </p>
          </div>

          <Carousel className="w-full max-w-4xl mx-auto" opts={{ align: 'start', loop: true }}>
            <CarouselContent>
              {STATIC_VARIATIONS.map((variation, index) => {
                const imgSrc =
                  dbImages[index] && dbImages[index] !== ''
                    ? dbImages[index]
                    : variation.fallbackImg
                return (
                  <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
                    <div className="p-1">
                      <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm group">
                        <div className="aspect-[16/9] relative bg-muted overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={variation.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-8 text-center bg-card">
                          <h3 className="text-2xl font-bold mb-3 text-primary">
                            {variation.title}
                          </h3>
                          <p className="text-muted-foreground text-lg leading-relaxed">
                            {variation.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 w-12 h-12" />
            <CarouselNext className="hidden md:flex -right-12 w-12 h-12" />
          </Carousel>
        </div>
      </section>

      {/* Block 4: Call to Action */}
      <section className="bg-orange-600 text-white py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Cada fábrica tem um layout único. Sua solução também deve ter.
          </h2>
          <p className="text-xl md:text-2xl text-orange-100 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
            Nossas estruturas são 100% reutilizáveis e projetadas para eliminar os gargalos da sua
            operação. Não encontrou a medida exata nas fotos?
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg h-14 px-8 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            asChild
          >
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              Fale com a Engenharia D-Lean
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
