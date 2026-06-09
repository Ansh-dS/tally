import { List } from 'lucide-react'
import { Select } from '@primitives/Select/Select'
import { SelectPreview } from './SelectPreview'
import { SelectSettings } from './SelectSettings'
export const SelectBlock = {
  label: 'Select Menu',
  icon: List,
  component: Select,
  preview: SelectPreview,
  settings: SelectSettings,
}
