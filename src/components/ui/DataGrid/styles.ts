import { cva, type VariantProps } from 'class-variance-authority'

/* 
  1. we didn't apply styles here as we need to the prop-drilling for this.
  2. as we are defining these styles at dataGrid(top) for tb and th but both of them are too inside:
      so we need to use '!' so no style got surpass them. 
  3. border-collapse: Adjacent cell borders merge into one shared border.
        defautlly we have 'separated' 
*/
export const dataGridVariants = cva('w-full text-left border-collapse', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type DataGridVariantsType = VariantProps<typeof dataGridVariants>
