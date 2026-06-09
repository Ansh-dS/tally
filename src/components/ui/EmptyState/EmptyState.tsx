import React, { cloneElement, forwardRef, isValidElement } from 'react'
import { emptyStateVariants, EmptyStateVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type TextVariant = NonNullable<React.ComponentProps<typeof Text>['variant']>

type ActionElementProps = {
  size?: 'sm' | 'md' | 'lg'
}

type EmptyStateSizeConfig = {
  title: TextVariant
  body: TextVariant
  iconText: string
  iconBg: string
  btn: 'sm' | 'md' | 'lg'
}

type EmptyStateCustomProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

type CleanProps = Prettify<EmptyStateCustomProps & EmptyStateVariantsType>

export type EmptyStateProps = CleanProps & React.HTMLAttributes<HTMLDivElement>

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (props, ref) => {
    const {
      className,
      variant,
      spacing = 'default',
      fullWidth,
      icon,
      title,
      description,
      action,
      ...rest
    } = props

    const sizeMapBySpacing = {
      compact: {
        title: 'label',
        body: 'caption',
        iconText: 'text-subheader',
        iconBg: 'p-s',
        btn: 'sm',
      },
      default: {
        title: 'h3',
        body: 'body',
        iconText: 'text-h2',
        iconBg: 'p-m',
        btn: 'md',
      },
      spacious: {
        title: 'h2',
        body: 'subheader',
        iconText: 'text-display',
        iconBg: 'p-l',
        btn: 'lg',
      },
    } satisfies Record<
      NonNullable<EmptyStateVariantsType['spacing']>,
      EmptyStateSizeConfig
    >

    const sizeMap = sizeMapBySpacing[spacing ?? 'default']

    return (
      <div
        ref={ref}
        className={cn(
          emptyStateVariants({ variant, spacing, fullWidth }),
          className
        )}
        {...rest}
      >
        {/* LAW 1 & 4 APPLIED: The Anchor scales perfectly using padding */}
        {icon && (
          <div
            className={cn(
              'bg-surface-sunken rounded-full flex items-center justify-center shrink-0 aspect-square ',
              sizeMap.iconBg,
              sizeMap.iconText
            )}
          >
            {icon}
          </div>
        )}

        {/* LAW 2 & 3 APPLIED: Proximity grouping with a constrained 'Measure' */}
        <div className="flex flex-col gap-xs max-w-md items-center">
          <Text
            variant={sizeMap.title}
            color="primary"
            className="font-semibold leading-heading"
          >
            {title}
          </Text>

          {description && (
            <Text
              variant={sizeMap.body}
              color="secondary"
              className="leading-body"
            >
              {description}
            </Text>
          )}
        </div>

        {/* LAW 4 APPLIED: Proportional action scaling */}
        {action && (
          <div className="mt-s">
            {isValidElement<ActionElementProps>(action)
              ? cloneElement(action, { size: sizeMap.btn })
              : action}
          </div>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
