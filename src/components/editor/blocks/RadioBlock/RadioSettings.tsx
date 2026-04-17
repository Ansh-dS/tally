import { Stack, Text, Switch } from 'components'
import { type FormBlock } from '@utils/store'
import { OptionsManager, ChangeTitle } from '../../common-functions'
export function RadioSettings({ block, updateBlock }: { block: FormBlock, updateBlock: any }) {
  return (
    <Stack gap="lg" className="p-m">
      <div className="flex items-center justify-between">
        <Text variant="label" weight="semibold">Required Field</Text>
        <Switch 
          checked={block.required || false} 
          onClick={() => updateBlock(block.id, { required: !block.required })} 
        />
      </div>
      <OptionsManager block={block} updateBlock={updateBlock}/>
      <ChangeTitle block={block } updateBlock={updateBlock} />
    </Stack>
  )
}