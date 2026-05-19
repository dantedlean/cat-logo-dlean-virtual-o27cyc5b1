export interface Product {
  id: string
  name: string
  code: string
  images: string[]
  group: string
  line: string | null
  specs: Record<string, string>
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
