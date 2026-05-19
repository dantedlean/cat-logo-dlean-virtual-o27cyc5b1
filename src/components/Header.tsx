import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Settings, Menu, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import useCatalogStore from '@/stores/use-catalog-store'
import { GROUPS, LINES } from '@/lib/constants'

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    editMode,
    setEditMode,
    selectedGroup,
    setSelectedGroup,
    selectedLine,
    setSelectedLine,
  } = useCatalogStore()
  const [pwdDialog, setPwdDialog] = useState(false)
  const [pwd, setPwd] = useState('')
  const activeGroup = GROUPS.find((g) => g.id === selectedGroup)

  const handleActivateEdit = () => {
    if (pwd === 'dlean2026') {
      setEditMode(true)
      setPwdDialog(false)
      setPwd('')
      toast.success('Modo edição ativado')
    } else {
      toast.error('Senha incorreta')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground h-16 flex items-center px-4 md:px-6 justify-between shadow-md">
      <div className="flex items-center gap-4">
        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background text-foreground w-[280px]">
              <div className="font-bold text-lg mb-6 tracking-tight text-primary">
                D-Lean Solutions
              </div>
              <div className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                Grupos
              </div>
              <div className="grid gap-1 mb-6">
                {GROUPS.map((g) => (
                  <Button
                    key={g.id}
                    variant={selectedGroup === g.id && !searchQuery ? 'secondary' : 'ghost'}
                    className="justify-start font-medium"
                    onClick={() => {
                      setSelectedGroup(g.id)
                      setSelectedLine(g.hasLines ? 'Linha Leve' : null)
                      setSearchQuery('')
                    }}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
              {activeGroup?.hasLines && !searchQuery && (
                <>
                  <div className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                    Linhas
                  </div>
                  <div className="grid gap-1">
                    {LINES.map((l) => (
                      <Button
                        key={l}
                        variant={selectedLine === l ? 'secondary' : 'ghost'}
                        className="justify-start font-medium"
                        onClick={() => setSelectedLine(l)}
                      >
                        {l}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-8 border-t pt-4">
                <Link
                  to="/index"
                  className="w-full flex justify-start px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                >
                  Índice Completo
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Link
          to="/"
          className="font-bold text-lg md:text-xl tracking-tight hidden sm:block whitespace-nowrap"
        >
          D-Lean Solutions
        </Link>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, código, material..."
            className="w-full pl-9 h-10 bg-black/10 border-transparent text-white placeholder:text-white/60 focus-visible:ring-white/30 focus-visible:bg-black/20 transition-all rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <Link
          to="/index"
          className="text-sm font-medium hover:text-white/80 transition-colors hidden md:block"
        >
          Índice
        </Link>
        {editMode ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditMode(false)
              toast.success('Modo edição desativado')
            }}
            className="text-yellow-300 hover:text-yellow-400 hover:bg-white/10"
            title="Desativar Edição"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Sair Edição</span>
          </Button>
        ) : (
          <Dialog open={pwdDialog} onOpenChange={setPwdDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Ativar Modo Edição</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleActivateEdit()}
                />
                <Button onClick={handleActivateEdit} className="w-full">
                  Entrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  )
}
