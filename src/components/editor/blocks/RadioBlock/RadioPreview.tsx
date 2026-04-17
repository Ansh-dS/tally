import { Stack, Box, Radio } from 'components'
import { type FormBlock } from '@utils/store'
import { EditableTitle, OptionsPreview } from '@components/editor/common-functions'

export const RadioPreview = (block?: FormBlock, isOverlay?: boolean, updateBlock?: any) => (
  <Box className={`w-full ${isOverlay ? 'opacity-80' : ''}`}>
    <Stack gap="sm">
      <EditableTitle block={block} isOverlay={isOverlay} updateBlock={updateBlock} defaultText="Single Choice Question" />
      <OptionsPreview block={block}  OptionWrapper={Radio} />
    </Stack>
  </Box>
)
