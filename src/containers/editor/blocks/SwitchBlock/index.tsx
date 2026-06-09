import { ToggleLeft } from 'lucide-react'
import { Switch } from '@primitives/Switch/Switch'
import { Box } from '@primitives/Box/Box'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { EditableTitle } from '@/containers/editor/common-functions'
import { SwitchSettings } from './SwitchSettings'
export const SwitchBlock = {
  label: 'Toggle Switch',
  icon: ToggleLeft,
  component: Switch,
  preview: (
    block?: FormBlock,
    isOverlay?: boolean,
    updateBlock?: UpdateBlockFn
  ) => (
    <Box
      className={`flex items-center justify-between w-full border-0  ${isOverlay ? 'opacity-80' : ''}`}
    >
      <EditableTitle
        block={block}
        isOverlay={isOverlay}
        updateBlock={updateBlock}
        defaultText="Toggle Question"
      />
      <Switch
        checked={block?.data?.defaultChecked || false}
        disabled
        className="pointer-events-none"
      />
    </Box>
  ),
  settings: SwitchSettings,
}
