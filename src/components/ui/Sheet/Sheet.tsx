import React, { forwardRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  sheetOverlayVariants,
  sheetContentVariants,
  SheetVariantsType,
} from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type SheetCustomProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  bgClassName?: string
}

type CleanProps = Prettify<SheetCustomProps & SheetVariantsType>

export type SheetProps = CleanProps & React.HTMLAttributes<HTMLDivElement>

export const Sheet = forwardRef<HTMLDivElement, SheetProps>((props, ref) => {
  const {
    className,
    side,
    isOpen,
    onClose,
    title,
    description,
    children,
    bgClassName,
    ...rest
  } = props

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="relative">
      <div
        className={cn(sheetOverlayVariants(), bgClassName)}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        data-state={isOpen ? 'open' : 'closed'}
        className={cn(sheetContentVariants({ side }), className)}
        {...rest}
      >
        {(title || description) && (
          <div className="flex flex-col gap-xs p-l border-b border-border-default">
            {title && (
              <h2 className="text-h3 font-weight-semibold text-fg-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-body text-fg-secondary">{description}</p>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-l">{children}</div>
      </div>
    </div>,
    document.body
  )
})

Sheet.displayName = 'Sheet'
