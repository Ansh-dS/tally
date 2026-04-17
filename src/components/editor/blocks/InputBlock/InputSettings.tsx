import { Stack, Text, Input } from 'components'
import { type FormBlock } from '@utils/store'
import {ChangeTitle} from '../../common-functions'
export function InputSettings({ block, updateBlock }: { block: FormBlock, updateBlock: any }) {
  return (
    <Stack gap="lg" className="p-m">
      <Stack gap="sm">
        <Text variant="label" weight="semibold">Placeholder Text</Text>
        <Input value={block.data?.placeholder || ''} onChange={(e) => updateBlock(block.id, { data: { ...block.data, placeholder: e.target.value } })} placeholder="e.g. John Doe" />
      </Stack>
      <ChangeTitle block={block } updateBlock={updateBlock} />
    </Stack>
  )
}
