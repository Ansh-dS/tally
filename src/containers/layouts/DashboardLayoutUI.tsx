'use client'
// Renders the whole dashborad

import { logout } from '../../action/dashboard'
import { useTheme } from '@/components/core/theme-provider'
import type { AuthorizedUser } from '@actions/dashboard'
import React, { useCallback, useState, Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { aiDropOffSummary } from '@/lib/ai/inputsAndOutputs'

import { Stack } from '@primitives/Stack/Stack'
import { Sidebar, SidebarItem } from '@primitives/Sidebar/Sidebar'
import { Header } from '@primitives/Header/Header'
import { Text } from '@primitives/Text/Text'
import { DropdownMenu } from '@/components/ui/DropDown/DropDown'
import { Avatar } from '@primitives/Avatar/Avatar'
import { Button } from '@primitives/Button/Button'
import { Footer } from '@primitives/Footer/Footer'
import { Sheet } from '@primitives/Sheet/Sheet'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from '@primitives/Breadcrumb/Breadcrumb'
import { Box } from '@primitives/Box/Box'
import { FormAlerts, type SeverityLevel } from '../Dashboard/FormAlerts'

import {
  FileText,
  Layers,
  Plug,
  LogOut,
  Settings, // Added for Popover
  Sun, // Added for Theme
  Moon, // Added for Theme
  Home,
  Folder,
  Edit3,
  List,
  BarChart, // Added for Breadcrumb mapping
  Inbox,
  type LucideIcon,
} from 'lucide-react'

interface DashboardProps {
  userData: AuthorizedUser
  dropOffs: aiDropOffSummary
  formsCount: number
  children: React.ReactNode
}

const items = [
  { id: 'forms', label: 'My Forms', icon: <FileText size={18} /> },
  { id: 'templates', label: 'Templates', icon: <Layers size={18} /> },
]

// 1. Mapping Object: Maps URL to their human-readable names and Lucide icons
/* record: returns and object having key value pair:
      key:sting
  value:  { name: string; icon: LucideIcon }
*/
const ROUTE_MAP: Record<string, { name: string; icon: LucideIcon }> = {
  forms: { name: 'My Forms', icon: FileText },
  templates: { name: 'Templates', icon: Layers },
  integrations: { name: 'Integrations', icon: Plug },
  workspace: { name: 'Settings', icon: Settings },
  edit: { name: 'Build', icon: Edit3 },
  responses: { name: 'Results', icon: List },
  analytics: { name: 'Analytics', icon: BarChart },
}

const notificationColor: Record<SeverityLevel | 'None', string> = {
  Low: 'bg-status-info',
  Medium: 'bg-status-warning',
  High: 'bg-status-danger',
  Critical: 'bg-status-danger',
  None: 'bg-status-warning',
}

// we can't make entire function as async but can create some functions using async.
export default function DashboardLayoutUI({
  userData,
  dropOffs,
  formsCount,
  children,
}: DashboardProps) {
  const [activeId, setActiveId] = useState(items[0].id)
  const [assistantOpen, setAssistantOpen] = useState(false)

  const { mode, setMode } = useTheme()
  const pathname = usePathname() // only provides the path over the whole URL.

  // returns array of individual paths.
  const pathStack = pathname
    ? pathname.split('/').filter((segment) => segment !== '')
    : []

  const handleLogout = useCallback(async () => {
    await logout(pathname || '/dashboard')
  }, [pathname])

  return (
    <Stack
      direction={'horizontal'}
      className="w-screen h-screen overflow-y-auto p-s"
    >
      {/* Sidebar */}
      <Sidebar
        variant="inset"
        size={'narrow'}
        className="sticky"
        header={
          <Text
            variant="h2"
            weight="bold"
            className="select-none"
            color={'brand'}
          >
            TallyBuilder
          </Text>
        }
        footer={
          <Footer className="p-0 border-none">
            <SidebarItem
              icon={<LogOut size={18} />}
              label="Logout"
              onClick={handleLogout}
              color="accent"
            />
          </Footer>
        }
        /*
                  1. We use map to provide id to all the sidebar items.
                  2. whenever we click on one item:
                      a. we activate new new id 
                      b. which leads to re-renders the whole bunch.
                  3. while re-rendering the new id/items gets activated. 
                */
        children={items.map((item) => {
          return (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeId === item.id}
              onClick={() => {
                setActiveId(item.id)
              }}
              disabled={item.label === 'Templates' ? true : false}
              className="disabled:hover:bg-surface-base"
            />
          )
        })}
      ></Sidebar>

      {/* Main Content */}

      <Stack direction={'vertical'} className="flex-1 m-s ml-0 ">
        {/* Header */}
        <Header
          className="h-16"
          variant={'default'}
          navPosition={'left'}
          actions={
            <Stack direction={'horizontal'} align={'center'} justify={'center'}>
              <Box className="border-0 relative w-auto h-auto">
                <Box
                  className={`absolute w-3 h-3 top-3 right-3 rounded-full ${notificationColor[dropOffs.data?.severityLevel ?? 'None']}`}
                ></Box>
                <Button
                  variant={'ghost'}
                  startIcon={<Inbox />}
                  onClick={() => setAssistantOpen(true)}
                  size={'lg'}
                  className="rounded-full w-13 h-13 "
                />
                <Sheet
                  side="right"
                  isOpen={assistantOpen}
                  onClose={() => setAssistantOpen(false)}
                  bgClassName="bg-surface-overlay/40"
                >
                  <FormAlerts
                    setAssistantOpen={setAssistantOpen}
                    dropOffs={dropOffs}
                    formsCount={formsCount}
                  />
                </Sheet>
              </Box>

              <DropdownMenu
                align="right"
                trigger={
                  <Button
                    variant="ghost"
                    className="h-auto w-auto rounded-full p-0"
                  >
                    <Avatar
                      fallback="AS"
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
                    startIcon={mode === 'light' ? <Moon /> : <Sun />}
                    onClick={() => {
                      if (mode === 'light') {
                        setMode('dark')
                        return
                      }
                      setMode('light')
                    }}
                    children={mode === 'light' ? 'Dark Theme' : 'Light Theme'}
                  ></Button>
                </Stack>
              </DropdownMenu>
            </Stack>
          }
          children={
            <Breadcrumb size={'md'} variant={'solid'}>
              {/* Always show Home as the root */}
              <BreadcrumbItem>
                <BreadcrumbLink to="/forms">
                  <Home size={16} />
                  <span className="select-none">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {pathStack.length > 0 && <BreadcrumbSeparator />}

              {/* 
              3. MAPPING: for each maping we first figure out three things:
                    a.link
                    b.icon
                    c.correct display name.
                  if not present then defining the fallback too.

              4. index: comming form map itself which auto increments on each iteraction.
              5. slice=> needs one more than the last index. 
              */}

              {pathStack.map((segment, index) => {
                // Building clickable URL
                const path = `/${pathStack.slice(0, index + 1).join('/')}`
                const isCurrentPage = index === pathStack.length - 1

                // Looking up the 'path' in mapping object to get icon and correct name.
                // if didn't get then fallback is ready.
                const routeData = ROUTE_MAP[segment] || {
                  name: segment.length > 15 ? 'Form Details' : segment,
                  icon: Folder,
                }

                const IconComponent = routeData.icon

                return (
                  <Fragment key={path}>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        as={Link}
                        href={path}
                        isCurrentPage={isCurrentPage}
                      >
                        <IconComponent size={16} />
                        <span className="select-none">{routeData.name}</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>

                    {/* show separator if not the the last item. */}
                    {!isCurrentPage && <BreadcrumbSeparator />}
                  </Fragment>
                )
              })}
            </Breadcrumb>
          }
        ></Header>

        {children}
      </Stack>
    </Stack>
  )
}
