import React, { forwardRef, createContext, useContext } from 'react'
import {
  breadcrumbContainerVariants,
  breadcrumbLinkVariants,
  BreadcrumbLinkVariantsType,
} from './styles'
import { cn } from '../Utils/utils'
import { ChevronRight } from 'lucide-react'

type Prettify<T> = { [K in keyof T]: T[K] } & {}

/*
    trasform: pull or push the image near to farther away.
    scale: makes the size of thing bigger.
*/

/* -------------------------------------------------------------------------- */
/* CONTEXT (The Secret to Compound Components)                                */
/* -------------------------------------------------------------------------- */
type BreadcrumbContextValue = {
  variant?: BreadcrumbLinkVariantsType['variant']
  size?: BreadcrumbLinkVariantsType['size']
}
const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  variant: 'default',
  size: 'md',
})

/* -------------------------------------------------------------------------- */
/* BREADCRUMB CONTAINER                                                       */
/* -------------------------------------------------------------------------- */
//aria-label: screen readers and accessibility.
type BreadcrumbProps = Prettify<
  React.HTMLAttributes<HTMLElement> & BreadcrumbContextValue
>

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (props, ref) => {
    const {
      className,
      variant = 'default',
      size = 'md',
      children,
      ...rest
    } = props

    return (
      // We wrap the children in the context provider
      <BreadcrumbContext.Provider value={{ variant, size }}>
        <nav ref={ref} aria-label="breadcrumb" className={className} {...rest}>
          <ol className={cn(breadcrumbContainerVariants({ size }))}>
            {children}
          </ol>
        </nav>
      </BreadcrumbContext.Provider>
    )
  }
)
// for React Developer Tools and debugging clarity
Breadcrumb.displayName = 'Breadcrumb'

/* -------------------------------------------------------------------------- */
/* BREADCRUMB ITEM (Wrapper for each segment)                                 */
/* -------------------------------------------------------------------------- */
export type BreadcrumbItemProps = React.HTMLAttributes<HTMLLIElement>

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (props, ref) => {
    const { className, ...rest } = props
    return (
      <li
        ref={ref}
        className={cn('inline-flex items-center', className)}
        {...rest}
      />
    )
  }
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

/* -------------------------------------------------------------------------- */
/* BREADCRUMB LINK (The clickable path elements)                              */
/* -------------------------------------------------------------------------- */
// isCurrentPage: this tab contains a link or not.
type BreadcrumbLinkProps = React.AnchorHTMLAttributes<HTMLElement> & {
  isCurrentPage?: boolean
  as?: React.ElementType
  to?: string // Support for React Router
}

/*
we are providing two ways to enter a link prop:
    1. href (Native HTML / Next.js)
    2. to (React Router)
*/
export const BreadcrumbLink = forwardRef<HTMLElement, BreadcrumbLinkProps>(
  (props, ref) => {
    const {
      className,
      isCurrentPage = false,
      as: Component, // Removed default 'a' to dynamically calculate the correct tag
      to,
      href,
      children,
      ...rest
    } = props

    // Consume the context so we know what size/variant we are
    const { variant, size } = useContext(BreadcrumbContext)

    /* 
      1. changing the component type with whatever we pass in "as".
          it could be a "anchor" tag, a "Link" commpoenent etc etc. 
    */
    let FinalComponent: React.ElementType =
      Component || (to || href ? 'a' : 'span')
    if (isCurrentPage) FinalComponent = 'span'

    /* 
      Storing a key value pair of to/herf and path:
        example
         to: "./forms"
         href: "./forms"
    */
    const routingProps: Record<string, unknown> = {}

    // 2. the component is anchor then use href.
    if (FinalComponent === 'a') {
      routingProps.href = href || to
    }

    // if component is something else then check "to" first.
    else if (FinalComponent !== 'span') {
      // link could be in herf ro to.
      if (to) routingProps.to = to
      if (href) routingProps.href = href
    }

    return (
      <FinalComponent
        ref={ref}
        aria-current={isCurrentPage ? 'page' : undefined}
        className={cn(
          breadcrumbLinkVariants({ variant, size, isCurrentPage }),
          className
        )}
        {...routingProps}
        {...rest}
      >
        {children}
      </FinalComponent>
    )
  }
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

/* -------------------------------------------------------------------------- */
/* BREADCRUMB SEPARATOR (The static connector)                                */
/* -------------------------------------------------------------------------- */
export type BreadcrumbSeparatorProps = React.HTMLAttributes<HTMLSpanElement>

export const BreadcrumbSeparator = forwardRef<
  HTMLSpanElement,
  BreadcrumbSeparatorProps
>((props, ref) => {
  const { children, className, ...rest } = props
  const { size } = useContext(BreadcrumbContext)

  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      // dynamically handling the size of separator.
      className={cn(
        'text-fg-tertiary flex items-center justify-center select-none',
        size === 'sm'
          ? '[&>svg]:w-3 [&>svg]:h-3 mx-0.5'
          : '[&>svg]:w-4 [&>svg]:h-4 mx-1',
        className
      )}
      {...rest}
    >
      {children ?? <ChevronRight />}
    </span>
  )
})
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'
