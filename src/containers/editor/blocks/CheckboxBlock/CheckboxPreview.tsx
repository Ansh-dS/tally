import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Checkbox } from '@primitives/Checkbox/Checkbox'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import {
  EditableTitle,
  OptionsPreview,
} from '@/containers/editor/common-functions'

export const CheckboxPreview = (
  block?: FormBlock,
  isOverlay?: boolean,
  updateBlock?: UpdateBlockFn
) => (
  <Box className={`w-full border-0 ${isOverlay ? 'opacity-80' : ''}`}>
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
