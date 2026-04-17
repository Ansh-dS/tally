'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signupHandler } from '@/lib/auth/service'
import {
  Stack,
  Box,
  Card,
  Text,
  Input,
  Button,
  SocialButton,
  Tooltip,
} from 'components'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  // STAFF FIX: State to capture and display browser validation messages
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // if we click agian, once we make make submit, nothing happens.

    // Prevent double-submissions
    if (isLoading) return

    setIsLoading(true)

    try {
      const result = await signupHandler({ email, password })
      if (result.status === 'failed' || result.status === 'error') {
        // You could also set a specific server error here
        return result
      }

      router.replace('./forms')
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Sign Up Card */}
        <Card
          variant="elevated"
          elevation="lg"
          className="p-2xl w-full border border-border-default bg-surface-sunken"
        >
          <Stack direction="vertical" gap="lg">
            {/* Title Zone */}
            <Stack direction="vertical" gap="sm">
              <Text variant="h2" weight="bold" color="primary">
                Create an account
              </Text>
              <Text variant="body" color="secondary">
                Start building forms for free.
              </Text>
            </Stack>

            {/* OAuth Zone */}
            <Stack direction="vertical" gap="md" className="w-full">
              <SocialButton
                provider="google"
                label="Continue with Google"
                className="w-full"
                size="sm"
                onClick={() => {
                  window.location.href = '/api/auth/google'
                }}
              />
              <SocialButton
                provider="github"
                label="Continue with GitHub"
                className="w-full"
                size="sm"
              />
            </Stack>

            {/* Divider Zone */}
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

            {/* Form Zone */}
            <Stack
              direction="vertical"
              gap="lg"
              as="form"
              onSubmit={handleSubmit}
              className="w-full"
            >
              {/* Email Input Group */}
              <Stack direction="vertical" gap="sm" className="w-full">
                <Text variant="label" weight="semibold" color="primary">
                  Work Email
                </Text>
                {/* STAFF FIX: Wrap input in Tooltip and force visible if error exists */}
                <Tooltip
                  content={emailError}
                  forceVisible={!!emailError}
                  position={'top'}
                  variant={'brand'}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError('') // Clear error on type
                    }}
                    onInvalid={(e) => {
                      e.preventDefault() // Block browser popup
                      setEmailError(e.currentTarget.validationMessage) // Grab browser message
                    }}
                    size="sm"
                    className="w-full"
                    required
                  />
                </Tooltip>
              </Stack>

              {/* Password Input Group */}
              <Stack direction="vertical" gap="sm" className="w-full">
                <Text variant="label" weight="semibold" color="primary">
                  Password
                </Text>
                {/* STAFF FIX: Identical interception logic for password */}
                <Tooltip
                  content={passwordError}
                  forceVisible={!!passwordError}
                  position={'top'}
                  variant={'brand'}
                >
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError('')
                    }}
                    onInvalid={(e) => {
                      e.preventDefault()
                      setPasswordError(e.currentTarget.validationMessage)
                    }}
                    size="sm"
                    className="w-full"
                    required
                  />
                </Tooltip>
              </Stack>

              {/* Sign Up Button - Primary Focal Point */}
              <Button
                variant="primary"
                size="md"
                className="w-full mt-s shadow-raised"
                isLoading={isLoading}
                type="submit"
              >
                Sign Up
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
            Already have an account?
          </Text>

          <Button
            variant="ghost"
            size="sm"
            className="px-xs"
            onClick={(e) => {
              router.push('./login')
            }}
            color="accent"
          >
            Log in
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
