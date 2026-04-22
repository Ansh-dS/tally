import { Stack, Box, Radio } from 'components'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import {
  EditableTitle,
  OptionsPreview,
} from '@components/editor/common-functions'

export const SelectPreview = (
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
        defaultText="Select Menu"
      />
      {/* Visual only version */}
      <OptionsPreview block={block} OptionWrapper={Radio} />
    </Stack>
  </Box>
)
