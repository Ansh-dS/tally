import React from 'react'
import {
  type BlockType,
  type FormBlock,
  type UpdateBlockFn,
} from '@utils/store'

// 1. Import your new Modular Blocks
import { InputBlock } from './InputBlock'
import { TextAreaBlock } from './TextAreaBlock'
import { EmailBlock } from './EmailBlock'
import { SwitchBlock } from './SwitchBlock'
import { ButtonBlock } from './ButtonBlock'
import { AlertBlock } from './AlertBlock'
import { RadioBlock } from './RadioBlock'
import { CheckboxBlock } from './CheckboxBlock'
import { SelectBlock } from './SelectBlock'

// --- THE REGISTRY HUB ---
/*
  React.ComponentType(prop={MyComponent}): when we are passing the component as a prop where we aren't providing the values/props of the component itself.
    we are letting the parent/wrapper decide the props for this compoenent.
  
  inside componentType= ComponentType<> => what are the types of props it's going to accept.

  React.ReactNode(prop={<MyComponent />}): here we need to pass all the props first then send it to the wrapper/paraent.
*/
export const BLOCK_REGISTRY: Record<
  BlockType,
  {
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    component: React.ElementType

    preview: (
      block?: FormBlock,
      isOverlay?: boolean,
      updateBlock?: UpdateBlockFn
    ) => React.ReactNode

    settings: React.ComponentType<{
      block: FormBlock
      updateBlock: UpdateBlockFn
    }>
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
