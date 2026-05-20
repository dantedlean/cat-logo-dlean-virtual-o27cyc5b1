import { useCms } from '@/stores/use-cms-store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useCatalogStore from '@/stores/use-catalog-store'
import { useState, useEffect } from 'react'

interface CmsTextProps {
  id: string
  defaultText: string
  multiline?: boolean
}

export function CmsText({ id, defaultText, multiline = false }: CmsTextProps) {
  const { content, setContent } = useCms()
  const { editMode } = useCatalogStore()
  const [value, setValue] = useState(content[id] || defaultText)

  useEffect(() => {
    setValue(content[id] || defaultText)
  }, [content, id, defaultText])

  if (editMode) {
    if (multiline) {
      return (
        <Textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          onBlur={() => {
            setContent(id, value, 'text')
          }}
          className="w-full text-inherit bg-transparent border-dashed border-2 hover:border-primary/50 focus:border-primary min-h-[100px]"
        />
      )
    }
    return (
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        onBlur={() => {
          setContent(id, value, 'text')
        }}
        className="w-full text-inherit bg-transparent border-dashed border-2 hover:border-primary/50 focus:border-primary"
      />
    )
  }

  return <>{content[id] || defaultText}</>
}
