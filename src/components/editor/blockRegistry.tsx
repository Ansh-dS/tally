import React from 'react'
import { type BlockType, type FormBlock } from '@utils/store'

// 1. Import your new Modular Blocks
import { InputBlock } from './blocks/InputBlock'
import { TextAreaBlock } from './blocks/TextAreaBlock'
import { EmailBlock } from './blocks/EmailBlock'
import { SwitchBlock } from './blocks/SwitchBlock'
import { ButtonBlock } from './blocks/ButtonBlock'
import { AlertBlock } from './blocks/AlertBlock'
import { RadioBlock } from './blocks/RadioBlock'
import { CheckboxBlock } from './blocks/CheckboxBlock'
import { SelectBlock } from './blocks/SelectBlock'

// --- THE REGISTRY HUB ---
/*
  React.ComponentType(prop={MyComponent}): when we are passing the component as a prop where we aren't providing the values/props of the component itself.
    we are letting the parent/wrapper decide the props for this compoenent

  React.ReactNode(prop={<MyComponent />}): here we need to pass all the props first then send it to the wrapper/paraent.
*/
export const BLOCK_REGISTRY: Record<
  BlockType,
  {
    label: string
    icon: React.ComponentType<any>
    component: React.ComponentType<any>
    preview: (block?: FormBlock, isOverlay?: boolean, updateBlock?: any) => React.ReactNode
    settings:React.ComponentType<any>
  }
> = {
  // --- MODULAR CORE BLOCKS ---
  input: InputBlock,
  textArea: TextAreaBlock,
  textarea: TextAreaBlock, // Catching the duplicate from your original file
  email: EmailBlock,
  radio: RadioBlock,
  checkbox: CheckboxBlock,
  select: SelectBlock,
  switch: SwitchBlock,
  Button: ButtonBlock,
  Alert: AlertBlock,
}