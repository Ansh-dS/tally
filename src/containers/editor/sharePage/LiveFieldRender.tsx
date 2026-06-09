import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { Stack } from '@primitives/Stack/Stack'
import { Input } from '@primitives/Input/Input'
import { Button } from '@primitives/Button/Button'
import { Checkbox } from '@primitives/Checkbox/Checkbox'
import { Radio } from '@primitives/Radio/Radio'
import { Select } from '@primitives/Select/Select'
import { Switch } from '@primitives/Switch/Switch'
import { Alert } from '@primitives/Alert/Alert'
import { TextArea } from '@primitives/TextArea/TextArea'
import { FormBlock } from '@utils/store'

export function LiveFieldRenderer({ block, disabled = false }: { block: FormBlock; disabled?: boolean }) {
  const { type, label, required, data } = block

  const fieldLabel = (
    <Stack direction="horizontal" align="start" className="mb-s bg-transparent mt-1">
      <Text variant="subheader" weight="bold" color="primary" >
        {label || 'Untitled Question'}
      </Text>
      {required && (
        <Text color="accent" className="ml-1">
          *
        </Text>
      )}
    </Stack>
  )

  const containerClass = `w-full border-0 bg-transparent ${disabled ? 'cursor-not-allowed' : ''}`

  // 2. The Switch Statement: Routing to the correct UI component
  switch (type) {
    // if type is 'input' or 'email' then use same return.
    case 'input':
    case 'email':
      return (
        <Box className={containerClass}>
          {fieldLabel}
          <Input size={'md'} placeholder={data?.placeholder || 'Your answer'} disabled={disabled} />
        </Box>
      )

    case 'textarea':
    case 'textArea':
      return (
        <Box className={containerClass}>
          {fieldLabel}
          <TextArea
            placeholder={data?.placeholder || 'Your long answer'}
            rows={4}
            disabled={disabled}
          />
        </Box>
      )

    case 'checkbox':
      return (
        <Box className={containerClass}>
          {fieldLabel}
          <Stack gap="sm">
            {(data?.options || ['Option 1']).map((opt, idx) => (
              <Checkbox key={idx} label={opt} disabled={disabled} />
            ))}
          </Stack>
        </Box>
      )

    case 'radio':
      return (
        <Box className={containerClass}>
          {fieldLabel}
          <Stack gap="sm">
            {(data?.options || ['Option 1']).map((opt, idx) => (
              <Radio key={idx} label={opt} disabled={disabled} />
            ))}
          </Stack>
        </Box>
      )

    case 'select': {
      // map needs array, but data.options could be undefined so checking it.
      const rawOptions = Array.isArray(data?.options)
        ? data.options
        : ['Select an option']
      const selectOptions: Array<{ label: string; value: string | number }> =
        rawOptions.map((option) => ({
          label: String(option),
          value: String(option),
        }))

      return (
        <Box className={containerClass}>
          {fieldLabel}
          <Select options={selectOptions} disabled={disabled} />
        </Box>
      )
    }

    case 'switch':
      return (
        <Box className={containerClass}>
          <Stack
            direction="horizontal"
            className="justify-between"
            align="center"
          >
            {fieldLabel}
            <Switch checked={data?.defaultChecked || false} disabled={disabled} />
          </Stack>
        </Box>
      )

    case 'Button':
      return (
        <Box className={`w-full pt-4 border-0 px-m bg-transparent ${disabled ? 'cursor-not-allowed' : ''}`}>
          <Button variant="primary" size="md" fullWidth disabled={disabled}>
            {/* Buttons use children, not placeholder */}
            {data?.buttonText || 'Submit'}
          </Button>
        </Box>
      )

    case 'Alert':
      return (
        <Box className={containerClass}>
          <Alert
            severity={
              (data?.severity as
                | 'error'
                | 'info'
                | 'success'
                | 'warning'
                | undefined) || 'info'
            }
          >
            {/* Alerts usually wrap their text as children */}
            {(() => {
              const sev = (data?.severity as
                | 'error'
                | 'info'
                | 'success'
                | 'warning'
                | undefined) || 'info'

              const severityToTextColor: Record<string, string> = {
                error: 'danger',
                info: 'info',
                success: 'success',
                warning: 'warning',
              }

              const textColor = (severityToTextColor[sev] || 'info') as
                | 'danger'
                | 'info'
                | 'success'
                | 'warning'
                | 'primary'

              return (
                <Text
                  className="text-sm font-medium leading-relaxed"
                  color={textColor}
                >
                  {data?.placeholder || 'Please note this information.'}
                </Text>
              )
            })()}

          </Alert>
        </Box >
      )

    default:
      // Fallback for unknown block types to prevent crashing
      return null
  }
}
