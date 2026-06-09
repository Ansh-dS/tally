import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Configure tailwind-merge to recognize your Atomic Design tokens
// we are defining text-abc and text-xyz are different. by defining:
// 'font-size' and 'text-color'.
// 1. EXTRACTING YOUR TOKENS
// We list every value defined in your global.css to ensure perfect matching.

const colorTokens = [
  // Surfaces
  'surface-base',
  'surface-sunken',
  'surface-raised',
  'surface-overlay',
  // Actions
  'action-primary',
  'action-primary-hover',
  'action-primary-pressed',
  'action-secondary',
  'action-secondary-hover',
  'action-secondary-pressed',
  // Status
  'status-success',
  'status-warning',
  'status-danger',
  'status-info',
  // Borders
  'border-default',
  'border-focused',
  // Text (Foregrounds)
  'fg-primary',
  'fg-secondary',
  'fg-brand',
  'fg-inverted',
  'fg-disabled',
  // Raw Palettes
  'gray-100',
  'gray-200',
  'gray-300',
  'gray-500',
  'gray-700',
  'gray-900',
]

const fontSizeTokens = [
  'caption',
  'label',
  'body',
  'subheader',
  'h3',
  'h2',
  'h1',
  'display',
]

const spacingTokens = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl']

const radiusTokens = ['none', 'small', 'medium', 'large', 'pill']

const shadowTokens = ['raised', 'overlay', 'modal']

const fontFamilyTokens = ['base', 'document', 'mono']

const lineHeightTokens = ['heading', 'ui', 'body']

const animationTokens = ['duration-fast', 'duration-normal', 'duration-slow']

// 2. CONFIGURING TAILWIND-MERGE
const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Mapping COLORS allows them to work with text-*, bg-*, border-*, ring-*, etc.
      // bucketName| prefix=text(here) | postFix(mentioned in the variable(colorToken)).
      color: colorTokens,

      // Mapping FONT SIZE fixes the "text-body vs text-fg-brand" conflict.
      text: fontSizeTokens,

      // Mapping SPACING updates p-*, m-*, w-*, h-*, gap-*, top-*, etc.
      spacing: spacingTokens,

      // Other Categories
      shadow: shadowTokens, // shadow-*
      leading: lineHeightTokens, // leading-*
    },
    classGroups: {
      // This tells twMerge that 'rounded-medium' belongs to the 'rounded' bucket
      // bucketName| prefix| postFix.
      rounded: [{ rounded: radiusTokens }],

      // Ensure 'font-base' doesn't conflict with other font-family classes.
      // bucketName| prefix| postFix.
      'font-family': [{ font: fontFamilyTokens }],

      // Animations & Transitions
      // @ts-expect-error: this was creating type errors
      'animate-duration': [{ animate: animationTokens }], // animate-*
    },
  },
})

// mostly contains className and button variants/component tokens
export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
