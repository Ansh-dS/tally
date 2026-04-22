'use client'
// Renders the whole dashborad

import { logout } from '../../action/dashboard'
import { useTheme } from 'components'
import type { AuthorizedUser } from '../../action/dashboard'
import React, { useCallback, useState, Fragment } from 'react'
import { usePathname } from 'next/navigation'

import {
  Stack,
  Sidebar,
  SidebarItem,
  Header,
  Text,
  Popover,
  Avatar,
  Button,
  Footer,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from 'components'

import {
  FileText,
  Layers,
  Plug,
  HelpCircle,
  LogOut,
  Settings, // Added for Popover
  Sun, // Added for Theme
  Moon, // Added for Theme
  Home,
  Folder,
  Edit3,
  List,
  BarChart, // Added for Breadcrumb mapping
  type LucideIcon,
} from 'lucide-react'

interface DashboardProps {
  userData: AuthorizedUser
  children: React.ReactNode
}

const items = [
  { id: 'forms', label: 'My Forms', icon: <FileText size={18} /> },
  { id: 'templates', label: 'Templates', icon: <Layers size={18} /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={18} /> },
  {
    id: 'workspace',
    label: 'Workspace Settings',
    icon: <Settings size={18} />,
  },
  { id: 'help', label: 'Help & Support', icon: <HelpCircle size={18} /> },
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

// we can't make entire function as async but can create some functions using async.
export default function DashboardLayoutUI({
  userData,
  children,
}: DashboardProps) {
  const [activeId, setActiveId] = useState(items[0].id)

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
      className="w-screen h-screen overflow-y-auto"
    >
      {/* Sidebar */}
      <Sidebar
        variant="inset"
        className="w-65"
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
            />
          )
        })}
      ></Sidebar>

      {/* Main Content */}

      <Stack direction={'vertical'} className="flex-1  m-s ml-0 shadow-sm">
        {/* Header */}
        <Header
          className="h-16"
          variant={'default'}
          navPosition={'left'}
          actions={
            <Popover
              align="end"
              content={
                <Stack gap={'sm'}>
                  <Button
                    fullWidth={true}
                    variant={'secondary'}
                    startIcon={<Settings size={16} />}
                  >
                    Settings
                  </Button>
                  <Button
                    fullWidth={true}
                    variant={'secondary'}
                    startIcon={
                      mode === 'light' ? <Moon size={16} /> : <Sun size={16} />
                    }
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
              }
              variant={'glass'}
            >
              <Avatar
                fallback="AS"
                className="cursor-pointer hover:opacity-80"
              />
            </Popover>
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
                const href = `/${pathStack.slice(0, index + 1).join('/')}`
                const isCurrentPage = index === pathStack.length - 1

                // Looking up the 'path' in mapping object to get icon and correct name.
                // if didn't get then fallback is ready.
                const routeData = ROUTE_MAP[segment] || {
                  name: segment.length > 15 ? 'Form Details' : segment,
                  icon: Folder,
                }

                const IconComponent = routeData.icon

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem>
                      <BreadcrumbLink to={href} isCurrentPage={isCurrentPage}>
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
