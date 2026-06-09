import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Input } from '@primitives/Input/Input'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { ChangeTitle } from '../../common-functions'

export function ButtonSettings({
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
          Button Text
        </Text>
        <Input
          value={block.data?.buttonText || ''}
          onChange={(e) =>
            updateBlock(block.id, {
              data: { ...block.data, buttonText: e.target.value },
            })
          }
          placeholder="e.g. Submit"
        />
      </Stack>
    </Stack>
  )
}
