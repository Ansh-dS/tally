import { Mail } from 'lucide-react'
import { Input, Stack, Box } from 'components'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { EditableTitle } from '@components/editor/common-functions'
import { EmailSettings } from './EmailSettings'
export const EmailBlock = {
  label: 'Email Field',
  icon: Mail,
  component: Input,
  preview: (
    block?: FormBlock,
    isOverlay?: boolean,
    updateBlock?: UpdateBlockFn
  ) => (
    <Box className={`w-full ${isOverlay ? 'opacity-80' : ''}`}>
      <Stack gap="sm">
        <EditableTitle
          block={block}
          isOverlay={isOverlay}
          updateBlock={updateBlock}
          defaultText="Email Address"
        />
        <Input
          type="email"
          placeholder={block?.data?.placeholder || 'name@example.com'}
          readOnly
          className="pointer-events-none opacity-60"
        />
      </Stack>
    </Box>
  ),
  settings: EmailSettings,
}
