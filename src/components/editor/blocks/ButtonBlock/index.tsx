import { MousePointer2 } from 'lucide-react'
import { Button, Stack, Box } from 'components'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { EditableTitle } from '@components/editor/common-functions'
import { ButtonSettings } from './ButtonSettings'
export const ButtonBlock = {
  label: 'Action Button',
  icon: MousePointer2,
  component: Button,
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
          defaultText="Submit Action"
        />
        <Button
          variant="primary"
          size="md"
          className="w-full pointer-events-none shadow-md"
        >
          {block?.data?.buttonText || 'Submit'}
        </Button>
      </Stack>
    </Box>
  ),
  settings: ButtonSettings,
}
