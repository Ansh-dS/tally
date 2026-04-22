import { create } from 'zustand'

// types of dragables.
export type BlockType =
  | 'input'
  | 'email'
  | 'textarea'
  | 'textArea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'switch'
  | 'Button'
  | 'Alert'

// type for each component includig the data we are storing.
export interface FormBlock {
  id: string
  type: BlockType
  label: string
  required: boolean
  placeholder?: string
  options?: string[] // only for some blocks
  data?: {
    placeholder?: string
    buttonText?: string
    severity?: string
    defaultChecked?: boolean
    [key: string]: string | boolean | number | undefined
  }
}

export type UpdateBlockFn = (id: string, updates: Partial<FormBlock>) => void

// Store Architecture
interface FormState {
  blocks: FormBlock[]

  // O(1) Array Operations
  addBlock: (type: BlockType, label: string) => void
  removeBlock: (id: string) => void
  updateBlock: (id: string, updates: Partial<FormBlock>) => void

  // O(n) Array Traversals
  reorderBlocks: (sourceIndex: number, targetIndex: number) => void
  setBlocks: (blocks: FormBlock[]) => void
}

//  Initializing Global Store
export const useFormStore = create<FormState>((set) => ({
  // Initial Data Structure
  blocks: [],

  // we are saying our data would be stored in an array of json where each json have the below type.
  addBlock: (type, label) => {
    set((state) => {
      const newBlock: FormBlock = {
        id: crypto.randomUUID(), // Generates a secure, DB-ready unique ID
        type,
        label,
        required: false, // Default state
        data: {}, // Initialize the data object safely
      }

      // we need options if having below type.
      if (['dropdown', 'checkbox', 'radio', 'select'].includes(type)) {
        newBlock.options = ['Option 1', 'Option 2']
      }

      // Push to the end of the array
      return { blocks: [...state.blocks, newBlock] }
    })
  },

  // Filter: if we return false when the id mathes then that block doesn't include in our array.
  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    })),

  // Merges new settings (like making a field required) into an existing node
  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    })),

  // swap two blocks by index.
  reorderBlocks: (sourceIndex, targetIndex) =>
    set((state) => {
      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex >= state.blocks.length ||
        targetIndex >= state.blocks.length ||
        sourceIndex === targetIndex
      ) {
        return state
      }

      const blocks = [...state.blocks]
      ;[blocks[sourceIndex], blocks[targetIndex]] = [
        blocks[targetIndex],
        blocks[sourceIndex],
      ]

      return { blocks }
    }),

  // if we have data in database, which we are fetching and storing in blocks/storage of zustand.
  setBlocks: (blocks) => set({ blocks }),
}))
