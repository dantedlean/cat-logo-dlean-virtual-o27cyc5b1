import { useSyncExternalStore } from 'react'

type CmsContent = Record<string, string>

let content: CmsContent = {}
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return content
}

async function setContent(id: string, value: string, type: 'text' | 'image') {
  content = { ...content, [id]: value }
  listeners.forEach((l) => l())
}

async function loadContent() {
  // Placeholder for content loading
}

export function useCms() {
  const currentContent = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return {
    content: currentContent,
    setContent,
    loadContent,
  }
}
