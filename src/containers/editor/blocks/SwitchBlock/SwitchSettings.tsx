import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Switch } from '@primitives/Switch/Switch'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { ChangeTitle, RequiredFieldToggle } from '../../common-functions'

export function SwitchSettings({
  block,
  updateBlock,
}: {
  block: FormBlock
  updateBlock: UpdateBlockFn
}) {
  return (
    <Stack gap="lg" className="p-m">
      <ChangeTitle block={block} updateBlock={updateBlock} />

      <Stack
        direction="horizontal"
        className="w-full items-center justify-between mt-s"
      >
        <Text variant="label" weight="semibold" className="my-s">
          Checked by Default
        </Text>
        <Switch
          checked={block.data?.defaultChecked || false}
          onClick={() =>
            updateBlock(block.id, {
              data: {
                ...block.data,
                defaultChecked: !block.data?.defaultChecked,
              },
            })
          }
        />
      </Stack>

      <RequiredFieldToggle
        checked={block.required || false}
        onClick={() => updateBlock(block.id, { required: !block.required })}
        className="mt-s"
      />
    </Stack>
  )
}
