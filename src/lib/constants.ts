export interface Product {
  id: string
  code: string
  name: string
  group: string
  line: string | null
  images: string[]
  specs: Record<string, string>
  complementary?: string
}

export const GROUPS = [
  { id: 'Bancadas', label: 'Bancadas', hasLines: true },
  { id: 'Carrinhos-Estantes', label: 'Carrinhos-Estantes', hasLines: true },
  { id: 'Esteiras', label: 'Esteiras', hasLines: true },
  { id: 'Flow Racks', label: 'Flow Racks', hasLines: true },
  { id: 'Gestão Visual', label: 'Gestão Visual', hasLines: false },
  { id: 'Karakuri', label: 'Karakuri', hasLines: false },
  { id: 'Sistemas', label: 'Sistemas', hasLines: false },
  { id: 'Outras Soluções', label: 'Outras Soluções', hasLines: false },
]

export const LINES = ['Linha Leve', 'Linha Média', 'Linha Pesada']
