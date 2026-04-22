import React from 'react'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { Input, Text, Button, Stack } from 'components'
import { X, Plus } from 'lucide-react'

export const EditableTitle = ({
  block,
  isOverlay,
  defaultText,
}: {
  block?: FormBlock
  isOverlay?: boolean
  updateBlock?: UpdateBlockFn
  defaultText: string
}) => {
  // Ghost State (Dragging)
  if (isOverlay) {
    return (
      <div className="flex items-center gap-1 w-full">
        <Text
          variant="label"
          color="primary"
          weight="medium"
          className="opacity-70"
        >
          {block?.label || defaultText}
        </Text>
        {block?.required && (
          <Text color="accent" variant="body" className="font-bold">
            *
          </Text>
        )}
      </div>
    )
  }

  // Active State (Canvas) - Now read-only to prevent confusion
  return (
    <Stack direction={'horizontal'}>
      <Text
        variant="label"
        color="primary"
        weight="medium"
        className="text-primary truncate py-1"
      >
        {block?.label || defaultText}
      </Text>
      {block?.required && (
        <Text color="accent" variant="body" className="font-bold shrink-0">
          *
        </Text>
      )}
    </Stack>
  )
}
// --- CANVAS VERSION: Read-only visual list ---
export const OptionsPreview = ({
  block,
  OptionWrapper,
}: {
  block?: FormBlock
  OptionWrapper: React.ElementType
}) => {
  const options = block?.options || ['Option 1', 'Option 2']
  return (
    <div className="flex flex-col gap-2 pointer-events-none opacity-80">
      {options.map((opt, i) => (
        <OptionWrapper key={i} checked={i === 0} readOnly label={opt} />
      ))}
    </div>
  )
}

// --- SETTINGS VERSION: Interactive list editor ---
export const OptionsManager = ({
  block,
  updateBlock,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
}) => {
  const options = block?.options || ['Option 1', 'Option 2']

  return (
    <Stack gap="sm">
      <Text variant="label" weight="semibold">
        Choices
      </Text>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <Input
              value={opt}
              onChange={(e) => {
                const newOptions = [...options]
                newOptions[i] = e.target.value
                updateBlock(block.id, { options: newOptions })
              }}
              className="text-sm h-9"
              placeholder={`Option ${i + 1}`}
            />
            {options.length > 1 && (
              <button
                onClick={() => {
                  const newOptions = options.filter((_, index) => index !== i)
                  updateBlock(block.id, { options: newOptions })
                }}
                className="text-fg-secondary hover:text-red-500 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="w-fit mt-1"
          onClick={() =>
            updateBlock(block.id, {
              options: [...options, `Option ${options.length + 1}`],
            })
          }
        >
          <Plus size={14} className="mr-1" /> Add Option
        </Button>
      </div>
    </Stack>
  )
}
// if we take single props object then only we can use <ChangeTitle/> as a function.
// as it destructes the porps first.
export const ChangeTitle = ({
  block,
  updateBlock,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
}) => {
  return (
    <Stack gap="sm">
      <Text variant="label" weight="semibold">
        Question Label
      </Text>
      <Input
        value={block.label}
        onChange={(e) => updateBlock(block.id, { label: e.target.value })}
        placeholder="e.g. What is your name?"
      />
    </Stack>
  )
}
