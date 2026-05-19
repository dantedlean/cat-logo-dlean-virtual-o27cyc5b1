import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { Product, GROUPS } from '@/lib/constants'
import productsData from '@/data/products.json'

interface CatalogState {
  products: Product[]
  editMode: boolean
  searchQuery: string
  selectedGroup: string
  selectedLine: string | null
  filteredProducts: Product[]
  setEditMode: (v: boolean) => void
  setSearchQuery: (v: string) => void
  setSelectedGroup: (v: string) => void
  setSelectedLine: (v: string | null) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addProduct: (p: Product) => void
}

const CatalogContext = createContext<CatalogState | undefined>(undefined)

export const CatalogProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(productsData as Product[])
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('Carrinhos')
  const [selectedLine, setSelectedLine] = useState<string | null>('Linha Leve')

  // Auto expiry for edit mode (30 mins)
  useEffect(() => {
    if (editMode) {
      const t = setTimeout(() => setEditMode(false), 30 * 60 * 1000)
      return () => clearTimeout(t)
    }
  }, [editMode])

  // Alert before leaving if edit mode is on
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editMode) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [editMode])

  const filteredProducts = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          Object.values(p.specs).some((val) => val.toLowerCase().includes(q)) ||
          (p.complementary && p.complementary.toLowerCase().includes(q)),
      )
    }
    const currentGroup = GROUPS.find((g) => g.id === selectedGroup)
    return products.filter(
      (p) => p.group === selectedGroup && (!currentGroup?.hasLines || p.line === selectedLine),
    )
  }, [products, searchQuery, selectedGroup, selectedLine])

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }

  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id))
  const addProduct = (p: Product) => setProducts((prev) => [p, ...prev])

  return React.createElement(
    CatalogContext.Provider,
    {
      value: {
        products,
        editMode,
        searchQuery,
        selectedGroup,
        selectedLine,
        filteredProducts,
        setEditMode,
        setSearchQuery,
        setSelectedGroup,
        setSelectedLine,
        updateProduct,
        deleteProduct,
        addProduct,
      },
    },
    children,
  )
}

export default function useCatalogStore() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('Must be used within CatalogProvider')
  return context
}
