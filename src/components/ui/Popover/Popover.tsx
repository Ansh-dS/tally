import React, { useState, useRef, useEffect } from 'react'
import { popoverVariants, PopoverVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type PopoverCustomProps = {
  content: React.ReactNode /** The content rendered inside the floating popover */
  open?: boolean /** Controlled state: Forces the popover to remain open or closed */
  initialState?: boolean /** Uncontrolled state: we aren't forcing to open or close but providing default value */
  onOpenChange?: (
    open: boolean
  ) => void /** the event emitted when closes or opens */
  closeOnOutsideClick?: boolean /** 'click-away' functionality to close the panel */
}

type CleanProps = Prettify<PopoverCustomProps & PopoverVariantsType>

export type PopoverProps = CleanProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>

export function Popover(props: PopoverProps): React.ReactElement {
  const {
    content,
    children,
    align,
    variant,
    open: controlledState,
    initialState = false,
    onOpenChange,
    closeOnOutsideClick = true, // we are asking weather we want to make this feature avail to person or not.
    className,
    ...rest
  } = props

  // internalState: Tracks the toggle status when no 'open' prop is provided.
  // isVisible: The computed source of truth (Controlled vs. Uncontrolled pattern)
  // anchorRef: Reference to the main container to detect boundary-crossing clicks
  const [internalState, setInternalState] = useState(initialState)
  const isVisible =
    controlledState == undefined ? internalState : controlledState
  const anchorRef = useRef<HTMLDivElement>(null)

  /** Handles state updates and fires external callbacks */
  const toggleVisibility = (nextState: boolean) => {
    setInternalState(nextState)
    if (onOpenChange) onOpenChange(nextState)
  }

  // it's handelling the outside click.
  useEffect(() => {
    // before closing check pop-over opened or not.
    // if not visible then gets true.
    // if clicking outside feature not available.
    if (!closeOnOutsideClick || !isVisible) return

    // 1. pop-over is open.
    // 2. outside click is avaiable
    // so 'event' means mouseEvent.

    // if the user clicked outside our anchor boundary then change the states.
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        // manages other states.
        toggleVisibility(false)
      }
    }

    // mousedown: listens to the mouse clicks over the whole page.
    // if clicked handleOutsideClick exectues.
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
    // we remove the listner when we close the pop-over.
    // so function doesn't executes again.
  }, [closeOnOutsideClick, isVisible, onOpenChange])

  // relative: Defines the position of the inside children.
  // inline-block:
  //      a. our current element takes up that much space which their children takes (like span):
  //            so arranges the elements side-by-side.
  //      b. but you still can change their hieght and weidth(like div)
  // cursor-pointer: makes your cursor looks like hand to let use know it is interactive or clickable.
  return (
    <div className="relative inline-block cursor-progress" ref={anchorRef}>
      {/* Using div to avoid button-in-button errors, but keeping accessibility */}
      {/* we are inheriting the cursor... to reach this property to children 
          when we use inline-block parent redues it's size to child so it always behind the child and we hover we can't see 'hand' from cursor progress.
          using 'inherit' we are open the pipeline to reach 'cursor' to the child and child's child and so on. 
          */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isVisible}
        aria-haspopup="true"
        onClick={() => toggleVisibility(!isVisible)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleVisibility(!isVisible)
          }
        }}
        className="inline-block cursor-inherit"
      >
        {children}
      </div>

      {/* Floating Panel */}
      {isVisible && (
        <div
          className={cn(
            popoverVariants({ align, variant }),
            'mt-2 top-full',
            className
          )}
          {...rest}
        >
          {content}
        </div>
      )}
    </div>
  )
}
