import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface EditableFieldProps {
  value: string
  onSave: (val: string) => void
  multiline?: boolean
  editMode?: boolean
  className?: string
  placeholder?: string
}

export function EditableField({
  value,
  onSave,
  multiline,
  editMode,
  className,
  placeholder = 'Vazio',
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempVal, setTempVal] = useState(value)

  if (!editMode) {
    return <span className={className}>{value || '-'}</span>
  }

  if (isEditing) {
    const Component = multiline ? Textarea : Input
    const handleSave = () => {
      onSave(tempVal)
      setIsEditing(false)
    }

    return (
      <Component
        autoFocus
        value={tempVal}
        onChange={(e) => setTempVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !multiline) handleSave()
          if (e.key === 'Escape') {
            setTempVal(value)
            setIsEditing(false)
          }
        }}
        className="w-full min-h-[32px] p-1 text-sm bg-background border-yellow-400 focus-visible:ring-yellow-400"
      />
    )
  }

  return (
    <span
      className={cn(
        'cursor-pointer rounded-sm border border-transparent transition-colors px-1 -mx-1 block w-full',
        editMode && 'hover:bg-yellow-100 hover:border-yellow-300 min-h-[24px]',
        className,
      )}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-muted-foreground italic text-sm">{placeholder}</span>}
    </span>
  )
}
