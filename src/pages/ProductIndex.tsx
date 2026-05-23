import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ExternalLink } from 'lucide-react'
import useCatalogStore from '@/stores/use-catalog-store'

export default function ProductIndexPage() {
  const { products, setSelectedGroup, setSelectedLine, setSearchQuery } = useCatalogStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.code.toLowerCase().includes(q.toLowerCase()),
  )

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

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Índice Geral de Produtos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Total de {products.length} equipamentos cadastrados
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar tabela..."
              className="pl-9 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[120px]">Código</TableHead>
                <TableHead>Nome do Produto</TableHead>
                <TableHead>Grupo Principal</TableHead>
                <TableHead>Linha Técnica</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhum resultado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50 group"
                    onClick={() => {
                      setSelectedGroup(p.group)
                      setSelectedLine(null)
                      setSearchQuery(p.code) // Quick jump to it via search
                      navigate('/')
                    }}
                  >
                    <TableCell className="font-mono font-medium text-primary">{p.code}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.group}</TableCell>
                    <TableCell>
                      {p.line ? (
                        <Badge className={`${getLineColor(p.line)} text-white border-0`}>
                          {p.line}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ExternalLink className="inline-block w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
