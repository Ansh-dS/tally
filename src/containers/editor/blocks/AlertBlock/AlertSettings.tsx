import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Select } from '@primitives/Select/Select'
import { TextArea } from '@primitives/TextArea/TextArea'
import { type FormBlock } from '@utils/store'
import { ChangeTitle } from '../../common-functions'

interface AlertSettingsProps {
  block: FormBlock
  updateBlock: (id: string, updates: Partial<FormBlock>) => void
}

export function AlertSettings({ block, updateBlock }: AlertSettingsProps) {
  return (
    <Stack gap="lg" className="p-m">
      <ChangeTitle block={block} updateBlock={updateBlock} className="mb-s" />

      <Stack gap="sm" className="my-s">
        <Text variant="label" weight="semibold">
          Alert Message
        </Text>
        <TextArea
          value={block.data?.placeholder || ''}
          onChange={(e) =>
            updateBlock(block.id, {
              data: { ...block.data, placeholder: e.target.value },
            })
          }
          placeholder="Enter the notice message..."
          rows={3}
        />
      </Stack>

      <Stack gap="sm" className="mt-s">
        <Text variant="label" weight="semibold">
          Severity Level
        </Text>
        <Select
          value={block.data?.severity || 'info'}
          onChange={(event) =>
            updateBlock(block.id, {
              data: { ...block.data, severity: event.target.value },
            })
          }
          options={[
            { label: 'Information', value: 'info' },
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Critical', value: 'error' },
          ]}
        />
      </Stack>
    </Stack>
  )
}
