import React from 'react'
import { avatarVariants, AvatarVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type AvatarCustomProps = {
  fallback?: React.ReactNode
}

type CleanProps = Prettify<AvatarCustomProps & AvatarVariantsType>

export type AvatarProps = CleanProps &
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'size'>

export function Avatar(props: AvatarProps): React.ReactElement {
  const { size, src, alt, className, fallback, ...rest } = props
  return (
    <span className={cn(avatarVariants({ size }), className)}>
      {src ? (
        /*object-cover: resize an element's content to cover its container*/
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          {...rest}
        />
      ) : (
        <span className="font-medium uppercase tracking-tighter select-none">
          {fallback}
        </span>
      )}
    </span>
  )
}
