import React, { forwardRef } from 'react'
import { sidebarVariants, SidebarVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary'
import { Button, ButtonProps } from '../Button/Button'
import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { TextVariantsType } from '../Text/styles'
import { ChevronLeft, ChevronRight } from 'lucide-react' // Added for default icons

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * THE 4 LAWS OF SIDEBAR ARCHITECTURE:
 * 1. Law 1 (Fixed Scaffolding): The sidebar must act as a fixed structural anchor.
 * 2. Law 2 (Internal Rhythm): The Header and Footer must remain permanently pinned.
 * 3. Law 3 (Fluid Width): State transitions must be smooth and mathematically predictable.
 * 4. Law 4 (Surface Depth): The sidebar must visually separate itself from the main canvas.
 */

type SidebarCustomProps = {
  header?: React.ReactNode
  footer?: React.ReactNode

  /** * STEP 1: POSITION & TOGGLE API
   * We introduce 'position' to handle left/right border logic, and 'onToggle'
   * to give the developer a built-in way to collapse the sidebar without building custom buttons.
   */
  position?: 'left' | 'right'
  onToggle?: () => void
  showToggle?: boolean
  collapseMode?: 'iconStrip' | 'hide'

  /** * NEW FOOTER LOGIC:
   * By separating footerIcon, we let the developer decide if an anchor
   * stays visible during collapse. If they don't provide it, everything vanishes.
   */
  footerIcon?: React.ReactNode
}

type CleanProps = Prettify<SidebarCustomProps & SidebarVariantsType>

export type SidebarProps = CleanProps & React.HTMLAttributes<HTMLElement>

export const Sidebar = forwardRef<HTMLElement, SidebarProps>((props, ref) => {
  const {
    className,
    variant,
    size,
    collapsed,
    collapseMode,
    layout,
    header,
    footer,
    children,
    position = 'left', // Default to left sidebar
    onToggle,
    showToggle = false,
    footerIcon,
    ...rest
  } = props

  /**
   * STEP 2: DYNAMIC ICON DIRECTION
   * The arrow direction depends on two things: is it collapsed, and is it on the left or right?
   * If it's on the left and expanded, arrow points left (to close).
   * If it's on the left and collapsed, arrow points right (to open).
   */
  const ToggleIcon =
    position === 'left'
      ? collapsed
        ? ChevronRight
        : ChevronLeft
      : collapsed
        ? ChevronLeft
        : ChevronRight

  // NEW: changing the shape of 'arrow' button when collapsed.
  // We are changing the shape so we can give more visual weight to the collapsed sidebar.
  // we adjust right, left border and heights accordingly.
  const isFullyHidden = collapsed && collapseMode === 'hide'

  return (
    <aside
      ref={ref}
      className={cn(
        /**
         * VISUAL SHUTTER STEP 2: REDUCING WIDTH
         * The CVA variants handle the physical width transition (w-64 -> w-16 or w-0).
         */
        sidebarVariants({
          collapsed,
          variant,
          size,
          layout,
          position,
          collapseMode,
        }),

        // STEP 3: DYNAMIC BORDERS
        // Depending on the position, we only want a border on the side touching the canvas.
        // FIX: Removed 'relative' from here so it doesn't break the sticky/fixed layout variants!
        'border-border-default overflow-visible',

        className
      )}
      {...rest}
    >
      {/* STEP 4: THE FLOATING EDGE GRIP
          If the developer opts-in (showToggle) and provides a function (onToggle),
          we render a modern absolute-positioned button on the border edge.
      */}
      {showToggle && onToggle && (
        <Button
          variant="ghost"
          onClick={onToggle}
          className={cn(
            /* FIX: Button is OUTSIDE the content wrapper below, so it never disappears. */
            'absolute top-6 z-toast flex items-center justify-center border border-border-default bg-surface-base p-0 shadow-md hover:bg-surface-elevated hover:text-fg-primary cursor-pointer pointer-events-auto',

            // Position the button perfectly on the dividing line
            // 1. SHAPE MORPHING: Circle when open, Elongated Tab when fully hidden
            isFullyHidden ? 'h-10 w-5' : 'h-6 w-6 rounded-full',

            // 2. POSITION: LEFT SIDEBAR
            position === 'left' &&
            (isFullyHidden
              ? '-right-5 rounded-r-md border-l-0' // Fuses flat to the left screen edge
              : '-right-3'), // Floats on the dividing line

            // 3. POSITION: RIGHT SIDEBAR
            position === 'right' &&
            (isFullyHidden
              ? '-left-5 rounded-l-md border-r-0' // Fuses flat to the right screen edge
              : '-left-5') // Floats over the scrollbar
          )}
        >
          <ToggleIcon size={14} className="text-fg-secondary" />
        </Button>
      )}

      {/* NEW ARCHITECTURE: THE CONTENT SHUTTER */}
      <div
        className={cn(
          /**
           * VISUAL SHUTTER STEP 1: MAKING CONTENT INVISIBLE
           * We fade the opacity to 0 so the user doesn't see text squashing.
           * * VISUAL SHUTTER STEP 3: MAKING EVERYTHING HIDDEN
           * 'pointer-events-none' ensures the user can't click invisible buttons.
           * how to make the sidebar doesn't feel laggy, by :
           * 1. recduing the time to open collapsed sidebar
           * 2. telling "what will change" to the sidebar so it already prepare himself.
           */
          'flex flex-col flex-1 w-full min-h-0 overflow-hidden transition-opacity duration-150 ease-out will-change-[opacity]',

          collapsed && collapseMode === 'hide'
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        )}
      >
        {/* LAW 2 APPLIED: Header pinned to top */}
        {header && (
          <Stack
            direction="horizontal"
            align="center"
            className={cn(
              "w-full border-b border-border-default gap-s shrink-0 overflow-hidden bg-transparent border-0",
              collapsed ? 'px-1 py-4 justify-center' : 'p-m'
            )}
          >
            {/* The Logo/Icon always stays visible */}
            <Box className="border-0 bg-transparent shrink-0">{header}</Box>
          </Stack>
        )}

        {/* LAW 2 APPLIED: Independent internal scroll zone. */}
        {/*
          Keep horizontal clipping only while collapsed so expanded content can be fully seen.
        */}
        <Stack
          direction="vertical"
          className={cn(
            'flex-1 min-h-0 w-full overflow-y-auto gap-s bg-transparent border-0',
            collapsed ? 'px-1 py-4 overflow-x-hidden items-center' : 'p-m overflow-x-auto'
          )}
        >
          <ErrorBoundary variant="minimal">{children}</ErrorBoundary>
        </Stack>

        {/* LAW 2 UPDATED: THE FLEXIBLE FOOTER
            If footerIcon is provided, it stays centered.
            If not, the CollapsibleContent handles the total disappearance of the footer text.
        */}
        {(footer || footerIcon) && (
          <Stack
            direction="horizontal"
            align="center"
            justify={collapsed ? 'center' : 'start'}
            className={cn(
              'w-full border-t border-border-default shrink-0 overflow-hidden bg-transparent border-0',
              collapsed ? 'p-2' : 'p-m gap-m'
            )}
          >
            {/* Only show if the user explicitly provided an icon */}
            {footerIcon && (
              <Box className="border-0 bg-transparent shrink-0">
                {footerIcon}
              </Box>
            )}

            <CollapsibleContent collapsed={collapsed ?? false}>
              {footer}
            </CollapsibleContent>
          </Stack>
        )}
      </div>
    </aside>
  )
})

/* -------------------------------------------------------------------------- */
/* SIDEBAR ITEM                                                               */
/* -------------------------------------------------------------------------- */

type SidebarItemCustomProps = {
  icon: React.ReactNode
  label: string
  active?: boolean
  collapsed?: boolean
  badge?: string | number
  color?: TextVariantsType['color']
}

type CleanPropsItems = Prettify<SidebarItemCustomProps>

export type SidebarItemProps = CleanPropsItems &
  Omit<ButtonProps, 'children' | 'text' | 'startIcon'>

export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  (props, ref) => {
    const {
      icon,
      size,
      label,
      active,
      collapsed,
      badge,
      color,
      className,
      isLoading = false,
      ...rest
    } = props

    const resolvedTextColor = color || (active ? 'brand' : 'secondary')
    const resolvedSize = size ?? 'md'
    
    const resolvedIconSize =
      resolvedSize === 'xl' ? 20
      : resolvedSize === 'lg' ? 18
      : resolvedSize === 'sm' ? 14
      : 16

    const sizedIcon = React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
          size: resolvedIconSize,
        })
      : icon

    const resolvedTextVariant =
      resolvedSize === 'xl' || resolvedSize === 'lg' ? 'body'
      : resolvedSize === 'sm' ? 'caption'
      : 'label'

    const resolvedTextWeight =
      resolvedSize === 'xl' ? 'semibold' : active ? 'semibold' : 'medium'

    return (
      <Button
        ref={ref}
        variant="ghost"
        isLoading={isLoading}
        color={resolvedTextColor}
        iconColor={resolvedTextColor}
        fullWidth={!collapsed}
        size={collapsed ? 'icon' : resolvedSize}
        collapsed={!!collapsed}
        className={cn(
          'border-none transition-all duration-300 overflow-hidden',

          // FIXED STEP: Your precise structural alignment target location applied.
          collapsed
            ? 'justify-center'
            : 'justify-start [&>div]:justify-start [&>div]:w-full px-m',

          active
            ? 'bg-action-primary-subtle hover:bg-action-primary-hover-subtle'
            : 'bg-transparent hover:bg-action-ghost-hover',

          className
        )}
        startIcon={
          <Box
            className={cn(
              // Added duration-300 so the icon slides into center at the exact same speed the sidebar collapses!
              'transition-transform duration-300 border-0 bg-transparent shrink-0 flex items-center justify-center',
              active ? 'scale-110' : 'group-hover:scale-110',
              collapsed ? 'translate-x-0' : 'translate-x-0'
            )}
          >
            {sizedIcon}
          </Box>
        }
        {...rest}
      >
        <CollapsibleContent collapsed={collapsed || false}>
          <Stack
            direction="horizontal"
            align="center"
            justify="start"
            className="flex-1 w-full bg-transparent border-0"
          >
            {/* NEw code:  old => weight={active ? 'semibold' : 'medium'}
              color={resolvedTextColor}*/}
            <Text
              variant={resolvedTextVariant}
              weight={resolvedTextWeight}
              color={resolvedTextColor}
              className="truncate"
            >
              {label}
            </Text>

            {badge && (
              <Box
                as="span"
                className="bg-action-primary text-fg-inverted border-0 text-[10px] px-xs py-0.5 rounded-pill font-bold shrink-0 ml-xs"
              >
                {badge}
              </Box>
            )}
          </Stack>
        </CollapsibleContent>
      </Button>
    )
  }
)

SidebarItem.displayName = 'SidebarItem'


/**
 * THE "PHANTOM TEXT" FIX: CollapsibleContent Utility
 * * Why this over { !collapsed && children }?
 * 1. Animation: React's conditional rendering deletes the node instantly, making it "jump."
 * 2. Layout: This keeps the text in the DOM but uses CSS to "shutter" it closed.
 */
export const CollapsibleContent = ({
  children,
  collapsed,
}: {
  children: React.ReactNode
  collapsed: boolean
}) => (
  <Box
    data-collapsed-content // Added this so the Negative Margin Engine can target it directly
    className={cn(
      /* STEP 1: THE ANIMATION ENGINE
         - overflow-hidden: Acts as a "shutter." It clips any text that tries to leak out as the width shrinks.
         - whitespace-nowrap: CRITICAL. Prevents text from wrapping/stacking into a vertical mess during the transition.
      */
      'flex-1 transition-all duration-300 border-0 bg-transparent ease-in-out overflow-hidden whitespace-nowrap',

      collapsed
        ? /* VISUAL SHUTTER STEP 1, 2, & 3 COMBINED FOR ITEMS
           - opacity-0: Fade content. (Step 1)
           - w-0: Shrink container. (Step 2)
           - invisible: Shutter lock/Clipping. (Step 3)
        */
          'opacity-0 w-0 invisible -translate-x-2'
        : 'opacity-100 w-auto visible translate-x-0'
    )}
  >
    {children}
  </Box>
)