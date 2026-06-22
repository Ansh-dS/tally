'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box } from '@/components/ui/Box/Box'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'

export type FallbackPageProps = {
  // Structural Props
  title: string
  description?: string
  icon?: string | React.ReactNode

  // Custom Action Props
  actionLabel?: string
  onAction?: () => void
  showActionButton?: boolean // NEW: Control whether the main action button shows

  // Password Specific Props
  isPasswordProtected?: boolean
  onUnlock?: (password: string) => void | Promise<void>
}

export function FallbackPage({
  title,
  description,
  icon = 'TB', // Default icon/fallback
  actionLabel = 'Return to Home',
  onAction,
  showActionButton = true, // Defaults to true
  isPasswordProtected = false,
  onUnlock,
}: FallbackPageProps): React.ReactElement {
  const router = useRouter()
  const [password, setPassword] = useState('')

  const handleUnlock = useCallback(
    async (event?: React.SyntheticEvent) => {
      if (event) event.preventDefault()

      if (!onUnlock) return

      await onUnlock(password)
    },
    [onUnlock, password]
  )

  // Defaults to returning home if no custom onAction is provided
  const handleAction = useCallback(() => {
    if (onAction) {
      onAction()
    } else {
      router.replace('/')
    }
  }, [onAction, router])

  // Construct the action area to pass into the EmptyState
  const renderActions = () => {
    if (!isPasswordProtected && !showActionButton) return undefined

    return (
      <Stack
        direction="vertical"
        align="center"
        gap="md"
        className="w-full sm:min-w-[320px]"
      >
        {/* Password Logic (Isolated) */}
        {isPasswordProtected && (
          <Stack direction="vertical" gap="sm" className="w-full pb-4">
            <Input
              type="password"
              placeholder="Enter form password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleUnlock(event)
              }}
              className="w-full"
            />
            <Button variant="primary" fullWidth onClick={handleUnlock}>
              Unlock Form
            </Button>
          </Stack>
        )}

        {/* Dynamic Action Button */}
        {showActionButton && (
          <Button variant="ghost" fullWidth onClick={handleAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    )
  }

  return (
    <Stack
      direction="vertical"
      align="center"
      justify="center"
      className="min-h-screen w-screen bg-surface-sunken px-4 py-8"
    >
      <Box
        as="section"
        className="w-full max-w-120 border-0 bg-transparent p-4 shadow-none rounded-none"
      >
        {/* Replaced Card with your EmptyState Component */}
        <EmptyState
          variant="default"
          spacing="default"
          icon={icon} // EmptyState handles the circular styling automatically now
          title={title}
          description={description}
          action={renderActions()}
          className="p-10 shadow-overlay"
        />

        <Box className="mt-8 border-0 bg-transparent shadow-none flex justify-center">
          <Text variant="caption" color="secondary" align="center">
            Powered by TallyBuilder
          </Text>
        </Box>
      </Box>
    </Stack>
  )
}

export default FallbackPage
