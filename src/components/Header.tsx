import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Settings,
  Menu,
  LogOut,
  Upload,
  ChevronDown,
  ImagePlus,
  Loader2,
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import useCatalogStore from '@/stores/use-catalog-store'
import { GROUPS, LINES } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { useCms } from '@/stores/use-cms-store'
import { supabase } from '@/lib/supabase/client'

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
    importBatch,
  } = useCatalogStore()
  const { user, signIn, signOut } = useAuth()
  const { content, setContent } = useCms()
  const [pwdDialog, setPwdDialog] = useState(false)
  const [email, setEmail] = useState('dante@dlean.com.br')
  const [pwd, setPwd] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const activeGroup = GROUPS.find((g) => g.id === selectedGroup)
  const logoUrl =
    content['logo']?.value ||
    'https://skip-prod-storage.s3.amazonaws.com/attachments/1740058564030_download.png'

  const handleActivateEdit = async () => {
    const { error } = await signIn(email, pwd)
    if (!error) {
      setEditMode(true)
      setPwdDialog(false)
      setPwd('')
      toast.success('Login efetuado com sucesso! Modo edição ativado.')
    } else {
      toast.error('Credenciais inválidas')
    }
  }

  const handleLogout = async () => {
    await signOut()
    setEditMode(false)
    toast.success('Sessão encerrada')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) {
            await importBatch(parsed)
            toast.success(`${parsed.length} produtos importados!`)
          } else {
            toast.error('O arquivo JSON deve conter um array de produtos.')
          }
        } catch (err) {
          toast.error('Erro ao ler ou processar o arquivo.')
        }
      }
    }
    input.click()
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      await setContent('logo', data.publicUrl, 'logo', {})
      toast.success('Logo atualizado!')
    } catch (error) {
      toast.error('Erro ao atualizar logo')
    } finally {
      setUploadingLogo(false)
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
              <div className="mb-6">
                <img
                  src={logoUrl}
                  alt="D-Lean Solutions"
                  className="h-8 w-auto object-contain bg-white rounded p-1"
                />
              </div>
              <div className="grid gap-1 mb-6">
                <Button
                  variant={!selectedGroup && !searchQuery ? 'secondary' : 'ghost'}
                  className="justify-start font-medium"
                  onClick={() => {
                    setSelectedGroup(null)
                    setSearchQuery('')
                  }}
                >
                  Home
                </Button>
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
                      setSelectedLine(null)
                      setSearchQuery('')
                    }}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>

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
          onClick={() => {
            setSelectedGroup(null)
            setSearchQuery('')
          }}
          className="hidden sm:flex items-center gap-2 transition-transform hover:scale-[1.02] relative group"
        >
          <img
            src={logoUrl}
            alt="D-Lean Solutions"
            className="h-10 w-auto object-contain bg-white rounded p-1"
          />
          {editMode && (
            <label
              className="absolute -bottom-2 -right-2 bg-black/80 p-1 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {uploadingLogo ? (
                <Loader2 className="w-3 h-3 animate-spin text-white" />
              ) : (
                <ImagePlus className="w-3 h-3 text-white" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          )}
        </Link>

        {/* Superior Navigation Menu (Desktop) */}
        <div className="hidden lg:flex items-center ml-4 gap-1">
          <Button
            variant="ghost"
            className={`text-white hover:bg-white/20 font-medium ${!selectedGroup && !searchQuery ? 'bg-white/10' : ''}`}
            onClick={() => {
              setSelectedGroup(null)
              setSearchQuery('')
            }}
          >
            Home
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-white/20 font-medium">
                Produtos <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {GROUPS.map((g) => (
                <DropdownMenuItem
                  key={g.id}
                  onClick={() => {
                    setSelectedGroup(g.id)
                    setSelectedLine(null)
                    setSearchQuery('')
                  }}
                  className="cursor-pointer"
                >
                  {g.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        {editMode || user ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImport}
              className="text-white hover:bg-white/20 hidden md:flex"
              title="Importar Lote (JSON)"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-yellow-300 hover:text-yellow-400 hover:bg-white/10"
              title="Sair da Edição"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
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
                <DialogTitle className="text-xl">Acesso Restrito</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
