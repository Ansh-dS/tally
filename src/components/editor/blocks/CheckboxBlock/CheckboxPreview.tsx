import { Stack, Box, Checkbox } from 'components'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import {
  EditableTitle,
  OptionsPreview,
} from '@components/editor/common-functions'

export const CheckboxPreview = (
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
        defaultText="Multiple Choice Question"
      />
      <OptionsPreview block={block} OptionWrapper={Checkbox} />
    </Stack>
  </Box>
)
