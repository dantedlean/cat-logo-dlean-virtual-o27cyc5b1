import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import useCatalogStore from '@/stores/use-catalog-store'
import { GROUPS, LINES } from '@/lib/constants'

export function Navigation() {
  const { selectedGroup, setSelectedGroup, selectedLine, setSelectedLine, searchQuery } =
    useCatalogStore()
  const activeGroup = GROUPS.find((g) => g.id === selectedGroup)

  if (searchQuery) return null // Hide navigation during global search
  if (!selectedGroup) return null // Hide on Home page since Header has menu

  return (
    <div className="sticky top-16 z-40 bg-background border-b shadow-sm hidden md:block transition-all">
      {/* Level 1: Groups */}
      <ScrollArea className="w-full whitespace-nowrap border-b border-muted">
        <div className="flex w-max space-x-1 p-2 px-6">
          {GROUPS.map((g) => (
            <Button
              key={g.id}
              variant={selectedGroup === g.id ? 'default' : 'ghost'}
              onClick={() => {
                setSelectedGroup(g.id)
                setSelectedLine(g.hasLines ? 'Linha Leve' : null)
              }}
              className={`rounded-full px-5 font-medium transition-colors ${selectedGroup === g.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {g.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {/* Level 2: Lines */}
      {activeGroup?.hasLines && (
        <ScrollArea className="w-full whitespace-nowrap bg-muted/40">
          <div className="flex w-max space-x-6 p-0 px-8 text-sm">
            {LINES.map((l) => (
              <button
                key={l}
                className={`py-3 border-b-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm ${selectedLine === l ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'}`}
                onClick={() => setSelectedLine(l)}
              >
                {l}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      )}
    </div>
  )
}
