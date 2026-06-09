import { CheckSquare } from 'lucide-react'
import { Checkbox } from '@primitives/Checkbox/Checkbox'
import { CheckboxPreview } from './CheckboxPreview'
import { CheckboxSettings } from './CheckboxSettings'
export const CheckboxBlock = {
  label: 'Multiple Choice',
  icon: CheckSquare,
  component: Checkbox,
  preview: CheckboxPreview,
  settings: CheckboxSettings,
}
