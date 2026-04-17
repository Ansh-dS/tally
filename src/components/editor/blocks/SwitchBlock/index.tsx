import { ToggleLeft } from 'lucide-react'
import { Switch, Box } from 'components'
import { type FormBlock } from '@utils/store'
import { EditableTitle } from '@components/editor/common-functions'
import { SwitchSettings} from './SwitchSettings'
export const SwitchBlock = {
  label: 'Toggle Switch',
  icon: ToggleLeft,
  component: Switch,
  preview: (block?: FormBlock, isOverlay?: boolean, updateBlock?: any) => (
    <Box className={`flex items-center justify-between w-full ${isOverlay ? 'opacity-80' : ''}`}>
      <EditableTitle block={block} isOverlay={isOverlay} updateBlock={updateBlock} defaultText="Toggle Question" />
      <Switch checked={block?.data?.defaultChecked || false} disabled className="pointer-events-none" />
    </Box>
  ),
  settings: SwitchSettings
}
