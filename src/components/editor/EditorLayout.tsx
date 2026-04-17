import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Button,
  Header,
  Popover,
  Stack,
  Tabs,
  Text,
  TabsList,
  TabsTrigger,
} from 'components'
import {useRouter} from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

type EditorTab = 'build' | 'share' | 'results'

export default function EditorLayout({
    children,
    activeTab = 'build',
    
}: {
    children: React.ReactNode
    activeTab?: EditorTab
}) {
    const router= useRouter()
    /*
        if we have string then we can apply:
            a. charAt()
            b. slice()
            c. toUppercase()
    */
    const currentPageLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

    return (
        <Stack direction={'vertical'} className="h-screen w-screen ">
            {/* First element */}
            <Header
                className="h-16 px-xl"
                navPosition="left"
                actions={
                    <Stack direction="horizontal" align="center" className="gap-s">
                        <Text
                            variant="label"
                            color="success"
                            className="inline-flex items-center gap-1"
                        >
                            <CheckCircle2 size={14} />
                            Saved
                        </Text>
                        <Button variant="outline" size="sm">
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
                    <Tabs defaultValue={activeTab} variant="pill" className='border-0'>
                        <TabsList className='border-0'  >
                            {/* .push('abc')}:it changes the last path.
                                    before url: https:localHost/xyz
                                    after url: https:localHost/abc
                            */}
                            <TabsTrigger value="build" onClick={()=>{router.push('edit')}} >Build</TabsTrigger>
                            <TabsTrigger value="share" onClick={()=>{router.push('share')}}>Share</TabsTrigger>
                            <TabsTrigger value="results" onClick={()=>{router.push('results')}}>Results</TabsTrigger>
                        </TabsList>

                        {/* If you need to render content panels below, 
                            add your <TabsContent /> components here. 
                        */}
                    </Tabs>

                }
            />
          
                {children} {/* This is where build, share, or results pages will inject */}
        
        </Stack>
    )
}