import React, { forwardRef } from 'react'
import { headerVariants, HeaderVariantsType } from './styles'
import { cn } from '../Utils/utils'
// STAFF UPDATE: Importing your Text component to enforce typography standards
import { Text } from '../Text/Text' // Adjust this import path to match your folder structure

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type HeaderCustomProps = {
  logo?: React.ReactNode
  /** STAFF UPDATE: Added a title prop specifically for the Text element */
  title?: string
  actions?: React.ReactNode
  /** * 'left' = Tally Mode (Nav follows Logo)
   * 'center' = Riverside Mode (Nav is mathematically centered)
   */
  navPosition?: 'left' | 'center'
}

type CleanProps = Prettify<HeaderCustomProps & HeaderVariantsType>

// HTMLElement: it is a class in the Web/DOM API. which contains 'div', 'span'.
// HTMLAttributes: using this we fetch the in-general attributes and their 'type'.
export type HeaderProps = CleanProps & React.HTMLAttributes<HTMLElement>
// uses of ref:
// 1. so these are pointer to a DOM element which helps you do 'focus', 'scroling' and 'measuring'
// 2. they contians '.current' elemnet which can read or write but updating '.current' doesn't cause re-renders.
// HTMLElement is the'ref' here where 'HeaderProps' is where we are passing 'ref'
// We are sending useRef as 'ref' and values of headerProps as props
export const Header = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
  // ..rest: we are saying take everything out and name them as 'rest'.
  const {
    className,
    variant,
    logo,
    title, // STAFF UPDATE: Destructured the new title prop
    actions,
    children,
    navPosition = 'left',
    ...rest
  } = props

  // the '..rest' in below could be any of 'id, title, onClick, onMouseOver, ariaLabel...'
  // we are also pointing to 'ref' below.
  return (
    <header
      ref={ref}
      className={cn(headerVariants({ variant }), className)}
      {...rest}
    >
      {/* ZONE 1: Left Counterweight
        - Uses w-auto so the middle spring does the expanding.
        - justify-start keeps the logo (and 'left' nav) pinned to the edge.
      */}
      <div className="flex items-center justify-start w-auto shrink-0">
        <div className="flex items-center gap-xl shrink-0">
          {/*  Grouped Logo and Title together. We use the <Text> element 
              here to ensure the brand name scales correctly and handles overflow. */}
          <div className="flex items-center gap-s cursor-pointer">
            {logo}
            {title && (
              <Text
                variant="body"
                className="max-sm:font-medium max-sm:truncate max-sm:hidden block"
              >
                {title}
              </Text>
            )}
          </div>

          {navPosition === 'left' && (
            <nav className="hidden lg:flex gap-m">{children}</nav>
          )}
        </div>
      </div>

      {/* ZONE 2: The Focus Center
        - shrink-0 ensures navigation doesn't get compressed.
        - The wrapper ALWAYS renders to act as the flex-1 spring, but children render conditionally.
      */}
      <div className="flex flex-1 justify-center items-center px-4 min-w-px">
        {navPosition === 'center' && (
          <nav className="hidden lg:flex items-center justify-center shrink-0">
            {children}
          </nav>
        )}
      </div>

      {/* ZONE 3: Right Counterweight
        - w-auto shrink-wraps the actions.
        - justify-end pins the actions to the right edge.
        - why are we sending two "div's" isntead of one:
            user may can add Fragment which doesn't have any boundaries:
                so we provide a div to them first.
      */}
      <div className="flex items-center justify-end w-auto shrink-0">
        <div className="flex items-center gap-m shrink-0">
          {/* we don't want the elements to get shrink but our above div should expand if we space available*/}
          {actions}
        </div>
      </div>
    </header>
  )
})

// when we use 'forwardRef<>' React.devtool mark it as 'forwardRef'
// To display the correct name we use below.
Header.displayName = 'Header'
