import { Stack, Text, Input, Switch } from 'components'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'

import { ChangeTitle } from '../../common-functions'
export function EmailSettings({
  block,
  updateBlock,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
}) {
  return (
    <Stack gap="lg" className="p-m">
      <Stack gap="sm">
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
          placeholder="name@example.com"
        />
      </Stack>

      <div className="flex items-center justify-between">
        <Text variant="label" weight="semibold">
          Required Field
        </Text>
        <Switch
          checked={block.required || false}
          onClick={() => updateBlock(block.id, { required: !block.required })}
        />
      </div>

      <ChangeTitle block={block} updateBlock={updateBlock} />
    </Stack>
  )
}
