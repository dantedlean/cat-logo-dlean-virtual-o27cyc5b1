import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import ProductIndexPage from './pages/ProductIndex'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { CatalogProvider } from '@/stores/use-catalog-store'
import { AuthProvider } from '@/hooks/use-auth'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <CatalogProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" richColors />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/index" element={<ProductIndexPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </CatalogProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
