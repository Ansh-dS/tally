import { Stack } from '@primitives/Stack/Stack'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { OptionsManager } from '@/containers/editor/common-functions'
import { ChangeTitle, RequiredFieldToggle } from '../../common-functions'

export function SelectSettings({
  block,
  updateBlock,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
}) {
  return (
    <Stack gap="lg" className="p-m">
      <ChangeTitle block={block} updateBlock={updateBlock} />

      <OptionsManager
        block={block}
        updateBlock={updateBlock}
        className="my-m"
      />

      <RequiredFieldToggle
        checked={block.required || false}
        onClick={() => updateBlock(block.id, { required: !block.required })}
        className="mt-s"
      />
    </Stack>
  )
}
