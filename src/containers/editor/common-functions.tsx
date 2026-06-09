import React from 'react'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { Input } from '@primitives/Input/Input'
import { Text } from '@primitives/Text/Text'
import { Button } from '@primitives/Button/Button'
import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Switch } from '@primitives/Switch/Switch'
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
        weight="semibold"
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
  const options = block?.data?.options || ['Option 1', 'Option 2']
  return (
    <div className="flex flex-col gap-2.5 pointer-events-none opacity-80 border-0">
      {options.map((opt, i) => (
        <OptionWrapper
          key={i}
          checked={i === 0}
          readOnly
          label={opt}
          className="gap-3"
        />
      ))}
    </div>
  )
}

// --- SETTINGS VERSION: Interactive list editor ---
export const OptionsManager = ({
  block,
  updateBlock,
  className: style,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
  className?: string
}) => {
  const options = block?.data?.options || ['Option 1', 'Option 2']

  return (
    <Stack gap="sm" className={style}>
      <Text variant="label" weight="semibold">
        Choices
      </Text>
      <Box className="border-0 w-full bg-trasparent flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          color={'success'}
          className="bg-status-success/5 active:bg-status-success/30 hover:bg-status-success/15 rounded-full"
          onClick={() =>
            updateBlock(block.id, {
              data: {
                ...block.data,
                options: [...options, `Option ${options.length + 1}`],
              },
            })
          }
          startIcon={<Plus />}
        ></Button>
      </Box>

      <Stack gap={'sm'}>
        {options.map((opt, i) => (
          <Stack key={i} gap={'sm'} direction={'horizontal'}>
            <Input
              value={opt}
              onChange={(e) => {
                const newOptions = [...options]
                newOptions[i] = e.target.value
                updateBlock(block.id, {
                  data: { ...block.data, options: newOptions },
                })
              }}
              className="text-sm h-9"
              placeholder={`Option ${i + 1}`}
            />
            {options.length > 1 && (
              <Button
                size={'icon'}
                onClick={() => {
                  const newOptions = options.filter((_, index) => index !== i)
                  updateBlock(block.id, {
                    data: { ...block.data, options: newOptions },
                  })
                }}
                color={'danger'}
                className="bg-trasparent active:bg-status-danger/30 hover:bg-status-danger/15 rounded-full "
                startIcon={<X />}
              ></Button>
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
// if we take single props object then only we can use <ChangeTitle/> as a function.
// as it destructes the porps first.
export const ChangeTitle = ({
  block,
  updateBlock,
  className: style,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
  className?: string
}) => {
  return (
    <Stack gap="sm" className={style}>
      <Text variant="label" weight="semibold">
        Question Label
      </Text>
      <Input
        className="text-sm h-9"
        value={block.label}
        onChange={(e) => updateBlock(block.id, { label: e.target.value })}
        placeholder="e.g. What is your name?"
      />
    </Stack>
  )
}

export const RequiredFieldToggle = ({
  checked,
  onClick,
  label = 'Required Field',
  className,
}: {
  checked: boolean
  onClick: () => void
  label?: string
  className?: string
}) => {
  return (
    <Stack
      direction="horizontal"
      gap="md"
      className={`w-full items-center justify-between ${className ?? ''}`}
    >
      <Text variant="label" weight="semibold">
        {label}
      </Text>
      <Switch checked={checked} onClick={onClick} />
    </Stack>
  )
}
