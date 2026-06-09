'use client'

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  isValidElement,
  cloneElement,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../Utils/utils'
import { Box } from '../Box/Box'
import { dropdownMenuVariants } from './styles'

/**
 * THE 4 LAWS OF ACTION MENU ARCHITECTURE:
 * * 1. Law 1 Evolution (The Portal Escape): To survive strict `overflow: hidden` layouts (like Tables or Cards),
 * the menu physically detaches from the DOM tree and teleports to the end of `document.body`.
 * * 2. Law 2 (Click-Outside Physics): Must close on external clicks. Because of the portal,
 * we must check if the click happened outside BOTH the trigger and the floating menu.
 * * 3. Law 3 (Coordinate Tracking): The portal needs exact X/Y coordinates. We use `getBoundingClientRect`
 * to dynamically pin the floating menu to the trigger, adapting to scrolling and resizing.
 * * 4. Law 4 (Compound Agnostic): Unlike a Select, an Action Menu doesn't care about "values".
 * It just renders arbitrary children (like Buttons) that execute actions.
 */

export type DropdownMenuProps = {
  /** The element that opens the menu (e.g., an Icon Button) */
  trigger: React.ReactNode
  /** The content of the menu (e.g., a Stack of Buttons) */
  children: React.ReactNode
  /** Controlled State: Is the menu open? */
  isOpen?: boolean
  /** Controlled State: Fired when the menu should close */
  onClose?: () => void
  /** Controlled State: Fired when the menu should open */
  onOpen?: () => void
  /** Should the menu align to the left or right of the trigger? */
  align?: 'left' | 'right'
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (props, ref) => {
    const {
      trigger,
      children,
      isOpen: controlledIsOpen,
      onClose: controlledOnClose,
      onOpen: controlledOnOpen,
      align = 'left',
    } = props

    // Support both Controlled (from parent) and Uncontrolled (internal) modes
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const isOpen =
      controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

    const handleClose = useCallback(() => {
      if (controlledOnClose) controlledOnClose()
      else setInternalIsOpen(false)
    }, [controlledOnClose])

    // REFS
    // New: triggerContainerRef will be our internal source of truth for the DOM node
    const triggerContainerRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    // PORTAL COORDINATES
    const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 0 })

    const updateCoords = useCallback(() => {
      if (triggerContainerRef.current) {
        const rect = triggerContainerRef.current.getBoundingClientRect()

        setCoords({
          top: rect.bottom + window.scrollY + 8,
          left:
            align === 'left'
              ? rect.left + window.scrollX
              : rect.right + window.scrollX,
          minWidth: rect.width,
        })
      }
    }, [align])

    const handleToggle = () => {
      if (isOpen) {
        handleClose()
      } else {
        updateCoords()
        if (controlledOnOpen) controlledOnOpen()
        else setInternalIsOpen(true)
      }
    }

    // LAW 2: Click Outside & Physics Engine
    useEffect(() => {
      setMounted(true)

      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as Node
        const clickedOutsideTrigger =
          triggerContainerRef.current &&
          !triggerContainerRef.current.contains(target)
        const clickedOutsideMenu =
          menuRef.current && !menuRef.current.contains(target)

        if (isOpen && clickedOutsideTrigger && clickedOutsideMenu) {
          handleClose()
        }
      }

      if (isOpen) {
        updateCoords()
        document.addEventListener('mousedown', handleOutsideClick)
        window.addEventListener('resize', updateCoords)
        window.addEventListener('scroll', updateCoords, true)
      }

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick)
        window.removeEventListener('resize', updateCoords)
        window.removeEventListener('scroll', updateCoords, true)
      }
    }, [isOpen, handleClose, updateCoords])

    if (!mounted) return null

    return (
      /* New: Fixed 'ref is defined but never used' error.
          We manually merge the forwarded ref with our internal triggerContainerRef.
        */
      <div
        className="relative inline-block"
        ref={(node) => {
          // Set our internal ref for coordinate tracking
          ;(
            triggerContainerRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node
          // Forward the node to the external ref provided by the user
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
      >
        {/* New: Fixed 'Unexpected any' error.
                We cast the trigger to a ReactElement with an optional onClick handler.
            */}
        {isValidElement(trigger)
          ? cloneElement(
              trigger as React.ReactElement<{
                onClick?: React.MouseEventHandler
              }>,
              {
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  const triggerElement = trigger as React.ReactElement<{
                    onClick?: React.MouseEventHandler
                  }>

                  // Safely preserve and call the original onClick if it exists
                  if (triggerElement.props.onClick) {
                    triggerElement.props.onClick(e)
                  }
                  handleToggle()
                },
              }
            )
          : trigger}

        {isOpen &&
          createPortal(
            <Box
              ref={menuRef}
              className={cn(
                dropdownMenuVariants({ state: isOpen ? 'open' : 'closed' }),
                'absolute z-popover shadow-overlay border-border-default',
                align === 'right'
                  ? '-translate-x-full origin-top-right'
                  : 'origin-top-left'
              )}
              style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                minWidth: `${Math.max(coords.minWidth, 200)}px`,
              }}
              onClick={handleClose}
            >
              {children}
            </Box>,
            document.body
          )}
      </div>
    )
  }
)

DropdownMenu.displayName = 'DropdownMenu'
