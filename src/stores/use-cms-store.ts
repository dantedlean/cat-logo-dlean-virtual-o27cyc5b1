import { useSyncExternalStore, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export type CmsItem = { value: string; metadata: any }
type CmsContent = Record<string, CmsItem>

let content: CmsContent = {}
let loaded = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return content
}

async function setContent(id: string, value: string, type: string, metadata: any = {}) {
  content = { ...content, [id]: { value, metadata } }
  listeners.forEach((l) => l())
  await supabase.from('site_content').upsert({ id, value, type, metadata })
}

let loadingPromise: Promise<void> | null = null

async function loadContent() {
  if (loaded) return
  if (!loadingPromise) {
    loadingPromise = supabase
      .from('site_content')
      .select('*')
      .then(({ data }) => {
        if (data) {
          const newContent: CmsContent = {}
          data.forEach((item) => {
            newContent[item.id] = { value: item.value, metadata: item.metadata || {} }
          })
          content = newContent
          loaded = true
          listeners.forEach((l) => l())
        }
      })
  }
  return loadingPromise
}

export function useCms() {
  const currentContent = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (!loaded) {
      loadContent()
    }
  }, [])

  return {
    content: currentContent,
    setContent,
    loadContent,
  }
}
