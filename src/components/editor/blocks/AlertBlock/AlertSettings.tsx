import { Stack, Text, Select, TextArea } from 'components'
import { type FormBlock } from '@utils/store'
import { ChangeTitle } from '../../common-functions'
interface AlertSettingsProps {
  block: FormBlock
  updateBlock: (id: string, updates: Partial<FormBlock>) => void
}

export function AlertSettings({ block, updateBlock }: AlertSettingsProps) {
  return (
    <Stack gap="lg" className="p-m">
      <Stack gap="sm">
        <Text variant="label" weight="semibold">
          Alert Message
        </Text>
        <TextArea
          onChange={(e) =>
            updateBlock(block.id, {
              data: { ...block.data, placeholder: e.target.value },
            })
          }
          placeholder="Enter the notice message..."
          rows={3}
        />

        <ChangeTitle block={block} updateBlock={updateBlock} />
      </Stack>

      <Stack gap="sm">
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
