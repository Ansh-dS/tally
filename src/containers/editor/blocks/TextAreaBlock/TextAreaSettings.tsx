import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Input } from '@primitives/Input/Input'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { ChangeTitle } from '../../common-functions'

export function TextAreaSettings({
  block,
  updateBlock,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
}) {
  return (
    <Stack gap="lg" className="p-m">
      <ChangeTitle block={block} updateBlock={updateBlock} />

      <Stack gap="sm" className="mt-s">
        <Text variant="label" weight="semibold">
          Placeholder Text
        </Text>
        <Input
          value={block.data?.placeholder || ''}
          onChange={(e) =>
            updateBlock(block.id, {
              data: { ...block.data, placeholder: e.target.value },
            })
          }
          className="text-sm h-9"
          placeholder="e.g. Please describe your issue..."
        />
      </Stack>
    </Stack>
  )
}
