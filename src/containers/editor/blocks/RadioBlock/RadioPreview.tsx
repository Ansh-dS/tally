import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Radio } from '@primitives/Radio/Radio'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import {
  EditableTitle,
  OptionsPreview,
} from '@/containers/editor/common-functions'

export const RadioPreview = (
  block?: FormBlock,
  isOverlay?: boolean,
  updateBlock?: UpdateBlockFn
) => (
  <Box className={`w-full border-0  ${isOverlay ? 'opacity-80' : ''}`}>
    <Stack gap="sm">
      <EditableTitle
        block={block}
        isOverlay={isOverlay}
        updateBlock={updateBlock}
        defaultText="Single Choice Question"
      />
      <OptionsPreview block={block} OptionWrapper={Radio} />
    </Stack>
  </Box>
)
