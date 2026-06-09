'use client'

import { Suspense, useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginHandler } from '@/action/authentication'

/*
The use of (folder-name):
    while using the url in browser. if we use '(folder-name)' we ignore that folder and we can use the after path directly like below: 
    src/app/(auth)/login/page.tsx as /login
*/

/*
    1. our eyes go form 'Display' content to  this card as they are of equal size. 
    2. boldness isn't contribute to visual heirarchy that much but size do. 
    3. we are grouping the similar things using 'Stack' like 
*/
import { Box } from '@primitives/Box/Box'
import { Button } from '@primitives/Button/Button'
import { Card } from '@primitives/Card/Card'
import { Input } from '@primitives/Input/Input'
import { SocialButton } from '@primitives/SocialButton/SocialButton'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Tooltip } from '@primitives/Tooltip/Tooltip'

function LoginPageContent() {
  // in next js 'router' doesn't gets re-cerated even if we render the page again and again.
  // so without worry we can include it in our dependency list(useCalback, useEffect, etc) too
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  /**
   * form submission handler: for the Login view.
   * Action: Prevents default submission, triggers the loginHandler, and securely normalizes the callback URL.
   * Output: Redirects the user to their originally requested path (or default /forms), managing loading states.
   */

  // Memoizing the handler to prevent re-creation on re-renders.
  // This is good practice for stable performance in larger component trees.
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      console.log('hi i am handlerSubmit')
      e.preventDefault()

      // Prevent multiple submissions if already loading
      if (isLoading) return

      setIsLoading(true)

      try {
        const result = await loginHandler({ email, password })
        console.log(result)
        if (result.status === 'failed' || result.status === 'error') {
          // Here you would typically trigger a Toast or Alert component
          return result
        }

        // If authorized then push the user to the page which user were trying to access.
        const path = searchParams.get('callbackUrl')

        const normalizePath = (raw: string | null): string => {
          if (!raw) return '/forms'

          const decoded = decodeURIComponent(raw)

          // Prevent open redirects by disallowing full absolute URL destinations
          if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
            return '/forms'
          }

          // Convert relative paths to absolute /forms-like format
          if (decoded.startsWith('./')) {
            return '/' + decoded.slice(2)
          }

          if (decoded.startsWith('/')) {
            return decoded
          }

          // safeguard: fallback to /forms
          return '/forms'
        }

        const redirectPath = normalizePath(path)
        console.log('Redirecting to:', redirectPath)
        router.replace(redirectPath)
      } finally {
        /* 
            finally: whatever the outcome you must set this. 
                Ensures loading stops regardless of success or failure
            */
        setIsLoading(false)
      }
    },
    [email, password, isLoading, router, searchParams]
  )

  /* 
  why to include 'router' in dependency array: 
    1.  if we are using a hook inside useEffect, usecalback etc:
        then it's good practice to include it in dependency array
    2.  so we can say our function gets more stable.
  */
  const handleGoogleLogin = useCallback(() => {
    // removing the current path form the browsers stack so if we move back it doesn't reaches to tht login again.
    router.replace('/forms')
  }, [router])

  return (
    <Stack
      direction="vertical"
      align="center"
      justify="center"
      className="min-h-screen w-screen bg-surface-base"
    >
      {/* Main Container */}
      <Stack
        direction="vertical"
        align="center"
        gap="lg"
        className="w-full max-w-100"
      >
        {/* Header - Brand Identity */}
        <Text
          variant="display"
          weight="bold"
          color="brand"
          align="center"
          className="mb-lg bg-surface-raised/10 px-s rounded-small"
        >
          TallyBuilder
        </Text>

        {/* Login Card */}
        <Card
          variant="elevated"
          elevation="lg"
          className="p-2xl w-full border border-border-default bg-surface-sunken"
        >
          <Stack direction="vertical" gap="lg">
            {/* Title Zone */}
            <Stack direction="vertical" gap="sm">
              <Text variant="h2" weight="bold" color="primary">
                Welcome back
              </Text>
              <Text variant="body" color="secondary">
                Log in to your account to continue.
              </Text>
            </Stack>

            {/* OAuth Zone */}
            <Stack direction="vertical" gap="md" className="w-full">
              <SocialButton
                provider="google"
                label="Continue with Google"
                className="w-full"
                size="sm"
                onClick={handleGoogleLogin}
              />
              <SocialButton
                provider="github"
                label="Continue with GitHub"
                className="w-full"
                size="sm"
              />
            </Stack>

            {/* Divider Line */}
            <Stack
              direction="horizontal"
              align="center"
              gap="md"
              className="w-full"
            >
              <Box className="flex-1 h-px bg-border-default" />
              <Text variant="caption" color="disabled" weight="medium">
                OR
              </Text>
              <Box className="flex-1 h-px bg-border-default" />
            </Stack>

            {/* as='form': if i don't write as='form' then i can't use 'enter' to submit the request. */}
            {/* if we add 'type-submit' in button(inside the form) then we can also add 'handleSubmit' at the form.*/}
            <Stack
              direction="vertical"
              gap="lg"
              className="w-full"
              as="form"
              onSubmit={handleSubmit}
            >
              {/* Email Input Group */}
              <Stack direction="vertical" gap="sm" className="w-full">
                <Text variant="label" weight="semibold" color="primary">
                  Work Email
                </Text>
                {/*first '!' converts string into opposite boolean whereas second converts into orignal boolean*/}
                <Tooltip
                  content={emailError}
                  forceVisible={!!emailError}
                  position={'top'}
                  variant={'brand'}
                >
                  {/*
                                        a. required: so handle submit doesn't run even if we click on it.
                                        b. OnInvalid: use when input expects something else. 
                                        c. type: email=> good to write it take care of input values. 
                                    */}

                  <Input
                    type="email"
                    placeholder="name@company.com"
                    size="sm"
                    className="w-full"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError('') // Clear error when user starts typing again
                    }}
                    onInvalid={(e) => {
                      e.preventDefault() // Stop native popup: as re-rendering of html elemnet stops.
                      setEmailError(e.currentTarget.validationMessage) // Steal native message
                    }}
                    required
                  />
                </Tooltip>
              </Stack>

              {/* Password Input Group */}
              <Stack direction="vertical" gap="sm" className="w-full">
                <Stack
                  direction="horizontal"
                  className="flex justify-between"
                  align="center"
                >
                  <Text variant="label" weight="semibold" color="primary">
                    Password
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    color="accent"
                    text="Forgot password?"
                  />
                </Stack>
                <Tooltip
                  content={passwordError}
                  forceVisible={!!passwordError}
                  position={'top'}
                  variant={'dark'}
                >
                  <Input
                    type="password"
                    placeholder="••••••••"
                    size="sm"
                    className="w-full"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError('')
                    }}
                    required
                  />
                </Tooltip>
              </Stack>

              {/* Login Button - Primary Focal Point */}
              <Button
                variant="primary"
                size="md"
                className="w-full mt-s shadow-raised"
                isLoading={isLoading}
                type="submit"
                onClick={() => {
                  console.log('hi i am button')
                }}
              >
                Log In
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* Footer Links */}
        <Stack
          direction="horizontal"
          justify="center"
          align="center"
          gap="sm"
          className="mt-md bg-surface-raised/10 px-s rounded-small"
        >
          <Text variant="caption" color="secondary">
            Don&apos;t have an account?
          </Text>
          <Button
            variant="ghost"
            size="sm"
            className="px-xs"
            text="Sign up"
            color="accent"
            onClick={() => {
              router.push('/signup')
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

// Suspense: until react component is not ready render fallback
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
