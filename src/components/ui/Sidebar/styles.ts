import { cva, type VariantProps } from 'class-variance-authority'

export const sidebarVariants = cva(
  [
    // Base scaffolding: Flex column, smooth width transitions.
    'flex flex-col transition-[width] duration-200 ease-out z-nav min-w-0 shrink-0 h-full',
  ],
  {
    variants: {
      /* LAW 1 APPLIED: Surface Adaptability (Material only) */
      variant: {
        default: 'bg-surface-base',
        sunken: 'bg-surface-sunken',
        glass: 'bg-surface-base/15 backdrop-blur-md',
        // Inset is a material variant that carries its own border/shape logic
        inset: 'bg-surface-base border border-border-default rounded-large',
      },
      // FIX 3: Emptied these completely. All width logic is handled safely in compoundVariants now.
      collapsed: { true: '', false: '' },
      collapseMode: { iconStrip: '', hide: '' },
      size: { narrow: '', wide: '' },

      layout: {
       
        docked: 'sticky top-0 ',
        // Made overlay distinctly different from docked so it truly floats
        overlay: 'fixed top-0 bottom-0 z-50 shadow-2xl',

      },
      position: {
        left: '',
        right: '',
      },
    },
    compoundVariants: [
      {
        variant: ['default', 'sunken', 'glass'],
        position: 'left',
        className: 'border-r border-border-default',
      },
      {
        variant: ['default', 'sunken', 'glass'],
        position: 'right',
        className: 'border-l border-border-default',
      },
      { layout: 'overlay', position: 'left', className: 'left-0' },
      { layout: 'overlay', position: 'right', className: 'right-0' },

      // --- THE ABSOLUTE WIDTH CONTROLLERS ---
      {
        collapsed: true,
        collapseMode: 'iconStrip',
        className: 'w-16',
      },
      {
        collapsed: true,
        collapseMode: 'hide',
        className: 'w-0 min-w-0 overflow-hidden border-none',
      },
      // Because we cleared the base variants above, twMerge will never strip these!
      { collapsed: false, size: 'narrow', className: 'w-64' },
      { collapsed: false, size: 'wide', className: 'w-80' },
    ],
    defaultVariants: {
      variant: 'default',
      collapsed: false,
      collapseMode: 'iconStrip',
      layout: 'docked',
      position: 'left',
      size: 'wide',
    },
  }
)

export type SidebarVariantsType = VariantProps<typeof sidebarVariants>