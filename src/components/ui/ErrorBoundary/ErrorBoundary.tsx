/*
why did we use class component over functional component? 
   if a component crashes:
    means it hasn't render yet, so you can't use 'useState' etc etc. 
    but using lifecycle function you you can change the states. 

function: wrap this arround a componet so if it throws an error then catched by 'getDerivedStateFromError'. 
*/

import { Component, ErrorInfo, ReactNode } from 'react'
import { fallbackVariants, FallbackVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'
import { Button } from '../Button/Button'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type ErrorBoundaryCustomProps = {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

type CleanProps = Prettify<ErrorBoundaryCustomProps & FallbackVariantsType>

export type ErrorBoundaryProps = CleanProps

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props) // used super as we can change them or not going to change theme internally.
    this.state = { hasError: false, error: null } // these states are going to change.
  }

  /* 
    static: 
        a. property/funciton which belongs to class not instance. 
        b. to access this function we need can't use 'this' we have to use 'class Name'
      so ouside class a person can able to use it. 
  */

  //  The below are the lifecyle functions of class components.

  // render phase: changing the defective component by changing the state.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  /* commit phase:
        just for developers so they can undertand see the error.
  */

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    const { hasError, error } = this.state
    const { fallback, children, className, variant } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div className={cn(fallbackVariants({ variant }), className)}>
          <Text variant="h3" color="danger" className="font-semibold">
            Something went wrong.
          </Text>

          <Text variant="body" color="secondary">
            {error?.message || 'An unexpected rendering error occurred.'}
          </Text>

          <Button
            variant="secondary"
            size="md"
            className="mt-m"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      )
    }

    return children
  }
}
