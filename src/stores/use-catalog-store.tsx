import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { Product, GROUPS } from '@/lib/constants'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type { Product } from '@/lib/constants'

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
  setFilters: (group: string | null, line: string | null, search: string) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addProduct: (p: Product) => void
  importBatch: (batch: Partial<Product>[]) => void
}

const CatalogContext = createContext<CatalogState | undefined>(undefined)

export const CatalogProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('Carrinhos')
  const [selectedLine, setSelectedLine] = useState<string | null>('Linha Leve')

  const setFilters = (group: string | null, line: string | null, search: string) => {
    setSelectedGroup(group || '')
    setSelectedLine(line)
    setSearchQuery(search || '')
  }

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setProducts(
        data.map((d) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          group: d.product_group,
          line: d.line,
          images: d.images as string[],
          specs: d.specs as Record<string, string>,
          complementary: d.complementary || undefined,
        })),
      )
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (editMode) {
      const t = setTimeout(() => setEditMode(false), 30 * 60 * 1000)
      return () => clearTimeout(t)
    }
  }, [editMode])

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

  const updateProduct = async (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
    const payload: any = { ...data }
    if (data.group) {
      payload.product_group = data.group
      delete payload.group
    }
    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) {
      toast.error('Erro ao salvar produto')
      fetchProducts()
    }
  }

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao deletar produto')
      fetchProducts()
    }
  }

  const addProduct = async (p: Product) => {
    const tempId = `temp_${Date.now()}`
    const tempProduct = { ...p, id: tempId }
    setProducts((prev) => [tempProduct, ...prev])

    const { id, group, ...rest } = p
    const payload: any = {
      ...rest,
      product_group: group,
    }

    if (payload.id && (payload.id.startsWith('prod_') || payload.id.startsWith('temp_'))) {
      delete payload.id
    }

    const { data, error } = await supabase.from('products').insert(payload).select().single()

    if (data && !error) {
      const newProduct = {
        id: data.id,
        code: data.code,
        name: data.name,
        group: data.product_group,
        line: data.line,
        images: data.images as string[],
        specs: data.specs as Record<string, string>,
        complementary: data.complementary || undefined,
      }
      setProducts((prev) => prev.map((prod) => (prod.id === tempId ? newProduct : prod)))
    } else {
      toast.error('Erro ao adicionar produto')
      fetchProducts()
    }
  }

  const importBatch = async (batch: Partial<Product>[]) => {
    const payloads = batch.map((p) => ({
      code: p.code || `TMP-${Math.floor(Math.random() * 90000)}`,
      name: p.name || 'Produto sem nome',
      product_group: p.group || 'Carrinhos',
      line: p.line || null,
      images: p.images || [],
      specs: p.specs || {},
      complementary: p.complementary || '',
    }))

    const { error } = await supabase.from('products').insert(payloads)
    if (!error) {
      await fetchProducts()
    } else {
      toast.error('Erro ao importar produtos')
    }
  }

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
        setFilters,
        updateProduct,
        deleteProduct,
        addProduct,
        importBatch,
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
