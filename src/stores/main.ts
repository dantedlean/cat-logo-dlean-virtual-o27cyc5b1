import { useSyncExternalStore } from 'react'
import { Product, initialProducts } from '@/data/products'

type StoreState = {
  products: Product[]
  selectedGroup: string
  selectedLine: string | null
  searchTerm: string
  editMode: boolean
}

let state: StoreState = {
  products: initialProducts,
  selectedGroup: 'Carrinhos',
  selectedLine: 'Linha Leve',
  searchTerm: '',
  editMode: false,
}

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state

export const actions = {
  setProducts: (products: Product[]) => {
    state = { ...state, products }
    listeners.forEach((l) => l())
  },
  updateProduct: (id: string, updates: Partial<Product>) => {
    state = {
      ...state,
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }
    listeners.forEach((l) => l())
  },
  deleteProduct: (id: string) => {
    state = { ...state, products: state.products.filter((p) => p.id !== id) }
    listeners.forEach((l) => l())
  },
  setSelectedGroup: (selectedGroup: string) => {
    state = { ...state, selectedGroup }
    listeners.forEach((l) => l())
  },
  setSelectedLine: (selectedLine: string | null) => {
    state = { ...state, selectedLine }
    listeners.forEach((l) => l())
  },
  setSearchTerm: (searchTerm: string) => {
    state = { ...state, searchTerm }
    listeners.forEach((l) => l())
  },
  setEditMode: (editMode: boolean) => {
    state = { ...state, editMode }
    listeners.forEach((l) => l())
  },
}

export default function useMainStore() {
  const storeState = useSyncExternalStore(subscribe, getSnapshot)
  return { ...storeState, ...actions }
}
