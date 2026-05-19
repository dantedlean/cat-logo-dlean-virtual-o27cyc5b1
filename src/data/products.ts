export interface Product {
  id: string
  name: string
  code: string
  image: string
  category: string
  specs: Record<string, string>
  group: string
  line: string | null
  complementary?: string
}

export const GROUPS = [
  { id: 'Carrinhos', label: 'Carrinhos', hasLines: true },
  { id: 'Bancadas', label: 'Bancadas', hasLines: true },
  { id: 'Estantes', label: 'Estantes', hasLines: true },
  { id: 'Flow Racks', label: 'Flow Racks', hasLines: true },
  { id: 'Esteiras', label: 'Esteiras', hasLines: true },
  { id: 'Gestão Visual', label: 'Gestão Visual', hasLines: false },
  { id: 'Karakuri & Sistemas', label: 'Karakuri & Sistemas', hasLines: false },
]

export const LINES = ['Linha Leve', 'Linha Média', 'Linha Pesada']

export const initialProducts: Product[] = [
  {
    id: 'prod_001',
    name: '01- CARRINHO PICKING',
    code: 'CP-001',
    image: 'https://img.usecurling.com/p/400/400?q=trolley&color=blue',
    category: 'Carrinhos Lean Pipe',
    specs: {
      Material: 'Lean Pipe',
      Dimensões: '1500x600x1800mm',
      Capacidade: '150 Quilos',
      Acabamento: 'Revestido',
    },
    group: 'Carrinhos',
    line: 'Linha Leve',
    complementary: 'Este equipamento é ideal para o transporte de caixas padrão.',
  },
  {
    id: 'prod_002',
    name: '02- BANCADA DE MONTAGEM',
    code: 'BM-002',
    image: 'https://img.usecurling.com/p/400/400?q=workbench&color=gray',
    category: 'Bancadas Híbrido',
    specs: {
      Material: 'Híbrido',
      Dimensões: '2000x800x900mm',
      Capacidade: '300 Quilos',
      Acabamento: 'Inox',
    },
    group: 'Bancadas',
    line: 'Linha Média',
    complementary: 'Bancada robusta para montagem de peças.',
  },
  {
    id: 'prod_003',
    name: '03- ESTANTE DE ARMAZENAGEM',
    code: 'EA-003',
    image: 'https://img.usecurling.com/p/400/400?q=rack&color=green',
    category: 'Estantes Soldado',
    specs: {
      Material: 'Soldado',
      Dimensões: '3000x1000x2500mm',
      Capacidade: '1000 Quilos',
      Acabamento: 'Pintura Epóxi',
    },
    group: 'Estantes',
    line: 'Linha Pesada',
    complementary: 'Armazenamento de alta capacidade para estoque de paletes.',
  },
  {
    id: 'prod_004',
    name: 'QUADRO DE GESTÃO',
    code: 'QG-004',
    image: 'https://img.usecurling.com/p/400/400?q=whiteboard&color=white',
    category: 'Gestão Visual',
    specs: {
      Material: 'Acrílico',
      Dimensões: '1200x900mm',
      Capacidade: 'N/A',
      Acabamento: 'Liso',
    },
    group: 'Gestão Visual',
    line: null,
    complementary: 'Quadro para acompanhamento de métricas diárias.',
  },
]
