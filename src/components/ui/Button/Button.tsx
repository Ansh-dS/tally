import React, {
  ButtonHTMLAttributes,
  useCallback,
  forwardRef,
  isValidElement,
  cloneElement,
} from 'react'
import { buttonVariants, ButtonVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Spinner } from '../Spinner/Spinner'
import { Text } from '../Text/Text'
import { TextVariantsType } from '../Text/styles'

/* Expands collapsed type information when hovering over a component,
   specifically at the point where it is imported. */
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type ButtonVariantProps = {
  variant?: ButtonVariantsType['variant']
  size?: ButtonVariantsType['size']
  fullWidth?: ButtonVariantsType['fullWidth']
}

/**
 * 1. Extending ButtonHTMLAttributes ensures we get all standard
 * button props like 'onClick', 'disabled', and 'type' for free.
 */
type ButtonCustomProps = {
  children?: React.ReactNode
  startIcon?: React.ReactNode /** Icon to display before the text */
  endIcon?: React.ReactNode /** Icon to display after the text */
  isLoading?: boolean /** Shows a loading state and disables interaction */
  text?: string
  /** if want to overide the color of text inside button. */
  color?: TextVariantsType['color']
  /** Explicit override for the icons and spinner color */
  iconColor?: TextVariantsType['color']
  collapsed?: boolean
}

type CleanProps = Prettify<
  ButtonCustomProps &
    ButtonVariantProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>
>

export type ButtonProps = CleanProps

const textColorMap: Record<NonNullable<TextVariantsType['color']>, string> = {
  primary: 'text-fg-primary',
  secondary: 'text-fg-secondary',
  brand: 'text-fg-brand',
  accent: 'text-fg-accent',
  disabled: 'text-fg-disabled',
  inverted: 'text-fg-inverted',
  success: 'text-status-success',
  warning: 'text-status-warning',
  danger: 'text-status-danger',
  info: 'text-status-info',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'primary', // Fallback to default to ensure our color logic works
      size,
      fullWidth,
      className,
      startIcon,
      endIcon,
      isLoading = false,
      children,
      disabled = false,
      onClick,
      text,
      color: textColorProp,
      iconColor: iconColorProp,
      collapsed = false,
      ...rest
    } = props

    // if loading or disabled enable the don't sumbit the click.
    // if not enabled then pass the event not the function which contians function
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isLoading || disabled) {
          e.preventDefault() // don't submit and refreah the page.
          return
        }
        if (onClick) onClick(e)
      },
      [isLoading, disabled, onClick]
    )

    const resolvedSize = collapsed ? 'icon' : (size ?? 'md')
    const isIconSize = resolvedSize === 'icon'
    const hasTextContent = Boolean(children || text)
    const hasEndIcon = Boolean(endIcon)
    const isStartIconOnly = Boolean(startIcon) && !hasTextContent && !hasEndIcon && !isLoading

    const textVariant =
      resolvedSize === 'xl' || resolvedSize === 'lg'
        ? 'body'
        : resolvedSize === 'sm'
          ? 'caption'
          : 'label'

    const iconSize =
      resolvedSize === 'xl' || resolvedSize === 'lg'
        ? 20
        : resolvedSize === 'sm'
          ? 14
          : 18

    /*
      1.isValidElement: 
          a. we want to pass props to already built element.
          b. we use clone element which  overides or adds new element.
      2.isValidate: 
          a. does the element user sent is valid or renderable element
    */
    const renderIcon = (icon: React.ReactNode) => {
      if (isValidElement(icon)) {
        return cloneElement(
          icon as React.ReactElement<{
            size: typeof iconSize
            className: string
          }>,
          {
            size: iconSize,
            className: cn('block', (icon.props as { className?: string }).className),
          }
        )
      }
      return icon
    }

    const spinnerSize =
      resolvedSize === 'xl' ? 'lg'
      : resolvedSize === 'lg' ? 'md'
      : resolvedSize === 'sm' ? 'xs'
      : 'sm'

    const contentGapClass =
      (collapsed || isIconSize || isStartIconOnly) ? 'gap-0'
      : resolvedSize === 'xl' ? 'gap-3'
      : resolvedSize === 'lg' ? 'gap-2.5'
      : resolvedSize === 'sm' ? 'gap-1.5'
      : 'gap-2'

    // maping button variants with text color.
    // inital value is primay as it also covers outline and ghost variants.
    let textColor: NonNullable<TextVariantsType['color']> =
      (textColorProp as NonNullable<TextVariantsType['color']>) || 'primary'

    // don't check the variant if we have textColor provided by user.
    if (!textColorProp) {
      if (variant === 'primary' || variant === 'destructive') {
        textColor = 'inverted'
      } else if (variant === 'secondary') {
        textColor = 'brand'
      }
    }

    // either explictly provide the icon color or defaults to text color.
    const resolvedIconColor =
      (iconColorProp as NonNullable<TextVariantsType['color']>) || textColor

    return (
      <button
        ref={ref} // 1. ref logic attached
        // 1. styling of button.
        onClick={handleClick}
        // any one must be true to disable button
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant, size: collapsed ? undefined : resolvedSize, fullWidth: collapsed ? false : fullWidth }),
          (collapsed || isIconSize || isStartIconOnly) && 'h-10 w-10 p-0! flex items-center justify-center justify-items-center',
          isLoading && 'cursor-wait opacity-90',
          !isLoading && 'active:scale-[0.98]',
          className
        )}
        {...rest}
      >
        {/* 3. the main three elements of button */}
        <div
          className={cn(
            'flex w-full h-full items-center justify-center',
            contentGapClass
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center shrink-0">
              <Spinner size={spinnerSize} color={resolvedIconColor} />
            </span>
          ) : (
            startIcon && (
              /* we shouldn't write the variable values inside className:
                 but we should use these kinds of map because:
                 these inline values( 'inline-flex shrink-0') comiples while building(pnpm build ) 
            */
              <span
                className={cn(
                  'flex items-center justify-center shrink-0',
                  textColorMap[resolvedIconColor]
                )}
              >
                {renderIcon(startIcon)}
              </span>
            )
          )}

          {/*
          1. nowrap: don't push the text in the new line.
          */}
          {hasTextContent && !isIconSize && !isStartIconOnly && (
            <Text
              as="span"
              variant={textVariant}
              color={textColor}
              weight="medium"
              className="truncate"
            >
              {children || text}
            </Text>
          )}

          {!collapsed && !isIconSize && !isStartIconOnly && !isLoading && endIcon && (
            <span
              className={cn(
                'flex items-center justify-center shrink-0',
                textColorMap[resolvedIconColor]
              )}
            >
              {renderIcon(endIcon)}
            </span>
          )}
        </div>
      </button>
    )
  }
)

Button.displayName = 'Button'