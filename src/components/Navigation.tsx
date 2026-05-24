import { useNavigate } from 'react-router-dom'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import useCatalogStore from '@/stores/use-catalog-store'
import { GROUPS } from '@/lib/constants'

export function Navigation() {
  const { selectedGroup, setSelectedGroup, setSelectedLine, searchQuery } = useCatalogStore()
  const navigate = useNavigate()

  if (searchQuery) return null // Hide navigation during global search

  return (
    <div className="sticky top-16 z-40 bg-background border-b shadow-sm transition-all">
      {/* Level 1: Groups */}
      <ScrollArea className="w-full whitespace-nowrap border-b border-muted">
        <div className="flex w-max space-x-1 p-2 px-6">
          {GROUPS.map((g) => (
            <Button
              key={g.id}
              variant={selectedGroup === g.id ? 'default' : 'ghost'}
              onClick={() => {
                setSelectedGroup(g.id)
                setSelectedLine(null)
                navigate(`/family/${encodeURIComponent(g.id)}`)
              }}
              className={`rounded-full px-5 font-medium transition-colors ${selectedGroup === g.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {g.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
