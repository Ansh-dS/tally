'use client'
import { Avatar } from '@primitives/Avatar/Avatar'
import { Badge } from '@primitives/Badge/Badge'
import { Box } from '@primitives/Box/Box'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@primitives/Breadcrumb/Breadcrumb'
import { Button } from '@primitives/Button/Button'
import { Header } from '@primitives/Header/Header'
import { DropdownMenu } from '@/components/ui/DropDown/DropDown'
import { Stack } from '@primitives/Stack/Stack'
import { Tabs, TabsList, TabsTrigger } from '@primitives/Tabs/Tabs'
import { Text } from '@primitives/Text/Text'
import { Spinner } from '@primitives/Spinner/Spinner'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LogOut, Settings } from 'lucide-react'
import { useStore } from '@utils/store'
import { logout } from '../../action/dashboard'
import { handlePreview } from '@/containers/feedback/previewPage'
import { useCallback, useState, useEffect } from 'react'
import { publishForm } from '@actions/form'
import { useToast } from '@/components/ui/ToastProvider/ToastProvider'
import hashPassword from '@utils/hash'
import type { EditorForm } from '@/lib/utils/data-fetchers'

type EditorTab = 'build' | 'share' | 'results'
const TOAST_DELAY_MS = 500

export default function EditorLayout({
  children,
  activeTab = 'build',
  formId,
  form,
}: {
  children: React.ReactNode
  activeTab?: EditorTab
  formId: string
  form?: EditorForm | null
}) {
  const router = useRouter()
  const isLoading = useStore((state) => state.saveButton.isLoading)
  const [isPublishLoading, setPublishLoading] = useState(false)
  const [publishStyle, setPublishStyle] = useState<'primary' | 'success'>(
    'primary'
  )
  const { showToast } = useToast()

  const handleLogout = useCallback(async () => {
    await logout('/forms')
  }, [])
  /*
        if we have string then we can apply:
            a. charAt()
            b. slice()
            c. toUppercase()
    */
  const currentPageLabel =
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

  const { expDate } = useStore((state) => state.formExpDate)
  const { password } = useStore((state) => state.formPassword)

  // ── Store hydration ────────────────────────────────────────────────────────
  // Selectors use state.header.title (the actual store shape)
  const setBlocks = useStore((state) => state.setBlocks)
  const setTitle = useStore((state) => state.setTitle)
  const setDescription = useStore((state) => state.setDescrition)

  useEffect(() => {
    if (!form) return
    const parsedBlocks =
      typeof form.blocks === 'string'
        ? JSON.parse(form.blocks as unknown as string)
        : (form.blocks ?? [])
    setBlocks(parsedBlocks)
    setTitle(form.title ?? '')
    if (form.description) setDescription(form.description)
  }, [form, setBlocks, setTitle, setDescription])

  const blocks = useStore((state) => state.blocks)
  const title = useStore((state) => state.header.title ?? '')
  const description = useStore((state) => state.header.description ?? '')

  useEffect(() => {
    const channel = new BroadcastChannel('tally-form-data')

    const broadcastForm = () => {
      channel.postMessage({
        id: 'State_Updated',
        formData: { header: { title, description }, blocks },
      })
    }

    channel.onmessage = (e) => {
      if (e.data?.id === 'REQUEST_INITIAL_STATE') {
        broadcastForm()
      }
    }

    broadcastForm()

    return () => channel.close()
  }, [blocks, title, description])

  const publishHandler = useCallback(async () => {
    if (formId === 'demo-form-123') {
      showToast({
        intent: 'info',
        title: 'Demo Mode',
        description: 'Publishing is disabled in Demo Mode.',
        variant: 'glass',
      })
      return
    }

    setPublishLoading(true) //loading to true,
    setPublishStyle('success')

    const isPublished = await publishForm(
      {
        formId,
        password,
        expiresAt: expDate,
      },
      `/forms/${formId}/edit`
    )

    if (isPublished.status === 'success') {
      window.setTimeout(() => {
        showToast({
          intent: 'success',
          title: 'URL',
          variant: 'glass',
          description: `http://localhost:3000/f/${formId}`,
        })
      }, TOAST_DELAY_MS)
    } else {
      window.setTimeout(() => {
        showToast({
          intent: 'error',
          title: 'Unexpected Error',
          description: isPublished.message,
          variant: 'solid',
        })
      }, TOAST_DELAY_MS)
    }

    setPublishStyle('primary')
    setPublishLoading(false)
  }, [expDate, formId, password, showToast])

  return (
    <Stack direction={'vertical'} gap={'none'} className="h-screen w-screen ">
      {/* First element */}
      <Header
        className="z-popover h-16 px-xl"
        navPosition="left"
        actions={
          <Stack direction="horizontal" align="center" className="gap-s">
            <Badge
              startIcon={
                isLoading ? (
                  <Spinner
                    size={'sm'}
                    variant={'tally'}
                    className="border-t-status-success "
                  />
                ) : (
                  <CheckCircle2 className="text-status-success" size={14} />
                )
              }
              color="success"
              className="transition-all animate-duration-normal bg-trasparent border-0"
            >
              {isLoading ? '' : 'Saved'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreview(formId)}
            >
              Preview
            </Button>
            <Button
              isLoading={isPublishLoading}
              color={publishStyle === 'success' ? 'success' : undefined}
              variant={publishStyle}
              size="sm"
              onClick={publishHandler}
              className="trasition-all animate-duration-normal"
            >
              {isPublishLoading ? 'Publishing' : 'Publish'}
            </Button>
            <DropdownMenu
              align="right"
              trigger={
                <Button
                  variant="ghost"
                  className="h-auto w-auto rounded-full p-0"
                >
                  <Avatar
                    fallback="TB"
                    className="cursor-pointer hover:opacity-80"
                  />
                </Button>
              }
            >
              <Stack gap={'sm'} className="p-4">
                <Button fullWidth={true} variant={'secondary'} disabled>
                  Account
                </Button>
                <Button
                  fullWidth={true}
                  variant={'secondary'}
                  startIcon={<LogOut />}
                  onClick={handleLogout}
                  color="accent"
                >
                  Logout
                </Button>
              </Stack>
            </DropdownMenu>
          </Stack>
        }
        logo={
          <Box className="min-w-62.5 border-0">
            <Breadcrumb size="sm" variant="default">
              <BreadcrumbItem>
                <BreadcrumbLink to="/forms">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink to="/forms">Forms</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink to="/forms/ID/edit">ID</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink isCurrentPage to="/forms/ID/edit">
                  {currentPageLabel}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </Box>
        }
        children={
          <Tabs defaultValue={activeTab} variant="pill" className="border-0">
            <TabsList className="border-0">
              {/* .push('abc')}:it changes the last path.
                                    before url: https:localHost/xyz
                                    after url: https:localHost/abc
                            */}
              <TabsTrigger
                value="build"
                onClick={() => {
                  router.push('edit')
                }}
              >
                Build
              </TabsTrigger>
              <TabsTrigger
                value="share"
                onClick={() => {
                  router.push('share')
                }}
              >
                Share
              </TabsTrigger>
              <TabsTrigger
                value="results"
                onClick={() => {
                  router.push('results')
                }}
              >
                Results
              </TabsTrigger>
            </TabsList>

            {/* If you need to render content panels below, 
                            add your <TabsContent /> components here. 
                        */}
          </Tabs>
        }
      />
      {children}
      {/* This is where build, share, or results pages will inject */}
    </Stack>
  )
}
