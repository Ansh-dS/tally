'use client'
import { Avatar } from '@primitives/Avatar/Avatar'
import { Badge } from '@primitives/Badge/Badge'
import { Box } from '@primitives/Box/Box'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@primitives/Breadcrumb/Breadcrumb'
import { Button } from '@primitives/Button/Button'
import { Header } from '@primitives/Header/Header'
import { Popover } from '@primitives/Popover/Popover'
import { Stack } from '@primitives/Stack/Stack'
import { Tabs, TabsList, TabsTrigger } from '@primitives/Tabs/Tabs'
import { Text } from '@primitives/Text/Text'
import { Spinner } from '@primitives/Spinner/Spinner'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '@utils/store'
import { handlePreview } from '@actions/previewPage'

type EditorTab = 'build' | 'share' | 'results'

export default function EditorLayout({
  children,
  activeTab = 'build',
  formId
}: {
  children: React.ReactNode
  activeTab?: EditorTab
  formId: string
}) {
  const router = useRouter()
  const isLoading = useStore((state) => state.saveButton.isLoading)
  /*
        if we have string then we can apply:
            a. charAt()
            b. slice()
            c. toUppercase()
    */
  const currentPageLabel =
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

  
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
            <Button variant="outline" size="sm" onClick={()=>handlePreview(formId)}>
              Preview
            </Button>
            <Button variant="primary" size="sm">
              Publish
            </Button>
            <Popover
              align="end"
              variant="glass"
              content={
                <Stack className="p-s" gap="sm">
                  <Text variant="label" weight="semibold">
                    Builder Profile
                  </Text>
                  <Button variant="secondary" size="sm" fullWidth>
                    Account
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    Sign out
                  </Button>
                </Stack>
              }
            >
              <Avatar fallback="TB" className="cursor-pointer" />
            </Popover>
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
