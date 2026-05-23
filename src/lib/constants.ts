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
  { id: 'Carrinhos', label: 'Carrinhos', hasLines: true },
  { id: 'Sistemas', label: 'Sistemas', hasLines: false },
  { id: 'Outras Soluções', label: 'Outras Soluções', hasLines: false },
]

export const LINES = ['Linha Leve', 'Linha Média', 'Linha Pesada']
