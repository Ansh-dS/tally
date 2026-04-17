import { Stack, Text, Input } from 'components'
import { type FormBlock } from '@utils/store'
import {ChangeTitle} from '../../common-functions'

export function ButtonSettings({ block, updateBlock }: { block: FormBlock, updateBlock: any }) {
  return (
    <Stack gap="lg" className="p-m">
      <Stack gap="sm">
        <Text variant="label" weight="semibold">Button Text</Text>
        <Input 
          value={block.data?.buttonText || ''} 
          onChange={(e) => updateBlock(block.id, { data: { ...block.data, buttonText: e.target.value } })} 
          placeholder="e.g. Submit" 
        />
      </Stack>
            
      <ChangeTitle block={block } updateBlock={updateBlock} />
    </Stack>
  )
}