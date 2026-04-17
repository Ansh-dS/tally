import { CircleDot } from 'lucide-react'
import { Radio } from 'components'
import { RadioPreview } from './RadioPreview'
import { RadioSettings } from './RadioSettings'
export const RadioBlock = {
  label: 'Single Choice',
  icon: CircleDot,
  component: Radio,
  preview: RadioPreview,
  settings: RadioSettings
}
