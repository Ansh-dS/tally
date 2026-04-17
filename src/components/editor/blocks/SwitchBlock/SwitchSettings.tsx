import { Stack, Text, Switch as SwitchComponent } from 'components'
import { type FormBlock } from '@utils/store'
  import {ChangeTitle} from '../../common-functions'
export function SwitchSettings({ block, updateBlock }: { block: FormBlock, updateBlock: any }) {
  return (
    <Stack gap="lg" className="p-m">
      <div className="flex items-center justify-between">
        <Text variant="label" weight="semibold">Required Field</Text>
        <SwitchComponent 
          checked={block.required || false} 
          onClick={() => updateBlock(block.id, { required: !block.required })} 
        />
      </div>

      <div className="flex items-center justify-between">
        <Text variant="label" weight="semibold">Checked by Default</Text>
        <SwitchComponent 
          checked={block.data?.defaultChecked || false} 
          onClick={() => updateBlock(block.id, { data: { ...block.data, defaultChecked: !block.data?.defaultChecked } })} 
        />
      </div>
    
      <ChangeTitle block={block } updateBlock={updateBlock} />
    </Stack>
  )
}