import { AlignLeft } from 'lucide-react'
import { TextArea, Stack, Box, Text } from 'components'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { EditableTitle } from '@components/editor/common-functions'
import { TextAreaSettings } from './TextAreaSettings'
export const TextAreaBlock = {
  label: 'Long Text',
  icon: AlignLeft,
  component: TextArea,
  preview: (
    block?: FormBlock,
    isOverlay?: boolean,
    updateBlock?: UpdateBlockFn
  ) => (
    <Box className={`w-full ${isOverlay ? 'opacity-80' : ''}`}>
      <Stack gap="sm">
        <Stack direction={'horizontal'}>
          <EditableTitle
            block={block}
            isOverlay={isOverlay}
            updateBlock={updateBlock}
            defaultText="Long Text Question"
          />
          {block?.required && (
            <Text color={'accent'} variant={'caption'} className="ml-s">
              *
            </Text>
          )}
        </Stack>
        <TextArea
          placeholder={block?.data?.placeholder || 'Write your answer here...'}
          readOnly
          rows={3}
          className="pointer-events-none opacity-60"
        />
      </Stack>
    </Box>
  ),
  settings: TextAreaSettings,
}
