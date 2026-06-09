import React, { forwardRef } from 'react'
import { footerVariants, FooterVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type FooterCustomProps = {
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}

type CleanProps = Prettify<FooterCustomProps & FooterVariantsType>

export type FooterProps = CleanProps & React.HTMLAttributes<HTMLElement>

// We are trying to expand mid element more than left and right.
// left and right stays upto their content.
export const Footer = forwardRef<HTMLElement, FooterProps>((props, ref) => {
  const {
    className,
    variant,
    sticky,
    leftContent,
    rightContent,
    children,
    ...rest
  } = props

  return (
    <footer
      ref={ref}
      className={cn(footerVariants({ variant, sticky }), className)}
      {...rest}
    >
      {/* 1. Left Section (e.g., Back Button, Brand Logo) */}
      {leftContent && (
        <div className="max-sm:flex max-sm:items-center max-sm:justify-center max-sm:gap-m max-sm:w-full justify-start w-auto">
          {leftContent}
        </div>
      )}

      {/* 2. Middle Section (e.g., Pagination, Terms Links) */}

      <div className="flex-1 justify-center flex  max-sm:w-full">
        {children}
      </div>

      {/* 
        3.Right Section (e.g., Primary Action Buttons) 
          w-full: takes the whole width of parent content.( make the inside content feels like stack.)
          w-auto: takes the space upto the content 

      */}

      {rightContent && (
        <div className="max-sm:flex max-sm:items-center max-sm:justify-center max-sm:gap-m max-sm:w-full w-auto">
          {rightContent}
        </div>
      )}
    </footer>
  )
})

Footer.displayName = 'Footer'
