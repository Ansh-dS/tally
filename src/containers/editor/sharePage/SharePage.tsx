'use client'

import { useCallback, useState } from 'react'
import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { Card, CardHeader, CardContent, CardTitle } from '@primitives/Card/Card'
import { Button } from '@primitives/Button/Button'
import { Input } from '@primitives/Input/Input'
import { Tabs, TabsList, TabsTrigger } from '@primitives/Tabs/Tabs'
import { Switch } from '@primitives/Switch/Switch'
import { TextArea } from '@primitives/TextArea/TextArea'
import { Badge } from '@primitives/Badge/Badge'
import FlexibleScreen from '@/containers/editor/sharePage/ResizeScreen'
import { useCopyHandler } from '@/action/utilsShare'


export default function SharePage(SharePageInput: { formId: string }) {
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false)
  const [isDateEnabled, setIsDateEnabled] = useState(false)
  const copyHandler = useCopyHandler()
 

  const { formId } = SharePageInput
  const host = process.env.NEXT_PUBLIC_SHAREURL      // NEXT_PUBLIC: is must before any variable name at client side. 
  const shareUrl = `${host}${formId}`

 
  /*
    how are we spliting the screen:
      using the flex as 1 one left and 1.5 on right. 
  */
  return (
    <Stack
      direction="horizontal"
      // Parent container: fills height, hides overflow to lock the preview
      className="w-full overflow-x-hidden"
      gap="none" // Ensure no gap between the two main panes
    >
      {/* LEFT PANEL: Settings
          - flex-1: Tells it to grow and take its fair share of space
          - min-w-[400px]: PREVENTS the "one-word-per-line" collapse in your screenshot
      */}
      <Box className="flex-1 h-full overflow-y-auto border-0 w-full">
        <Stack gap="lg" className="p-2xl">
          <Stack gap="sm" className="w-full">
            <Text variant="h1" weight="bold">
              Share your form
            </Text>
            <Text variant="label" color="secondary">
              Configure how users access and interact with your form.
            </Text>
          </Stack>

          <Stack className='p-2xl w-full' gap={"lg"}>
            {/* 1. DIRECT LINK */}
            <Card variant="sunken" padding={"lg"} className='w-full border-0 mb-s'>
              <CardHeader>
                <CardTitle className='text-h2'>Direct Link</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack gap="sm">
                  <Text variant="caption" color="secondary">
                    Public URL
                  </Text>
                  <Stack direction="horizontal" gap="sm" align={"center"} className="w-full">
                    <Input readOnly value={shareUrl} className="flex-1" />
                    <Button variant="glass" onClick={() => copyHandler("Copied Public URL", shareUrl)}>Copy</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 2. ACCESS CONTROLS */}
            <Card variant="sunken" padding={"lg"} className='w-full border-0 mb-s'>
              <CardHeader>
                <CardTitle className='text-h2'>Access Controls</CardTitle>
              </CardHeader>
              <CardContent >
                <Stack gap="md">
                  {/* Password Row */}
                  <Stack gap="sm" className="w-full">
                    <Stack
                      direction="horizontal"
                      align="center"
                      className='w-full justify-between'
                    >
                      <Text weight="normal" >Require Password</Text>
                      <Switch checked={isPasswordEnabled} onClick={()=>setIsPasswordEnabled(!isPasswordEnabled)} />
                    </Stack>
                    <Box
                      className={`w-full overflow-hidden transition-all animate-duration-normal ease-out ${
                        isPasswordEnabled
                          ? 'max-h-20 opacity-100 translate-y-0'
                          : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <Input
                        type="password"
                        placeholder="Set password..."
                        className="transition-all animate-duration-fast"
                      />
                    </Box>
                  </Stack>

                  {/* Date Row */}
                  <Stack gap="sm" className="w-full">
                    <Stack
                      direction="horizontal"
                      className="justify-between w-full"
                      align="center"
                    >
                      <Text weight="normal">Close on date</Text>
                      <Switch  checked={isDateEnabled} onClick={()=>setIsDateEnabled(!isDateEnabled)} />
                    </Stack>
                    <Stack
                      className={`w-full overflow-hidden transition-all animate-duration-normal ease-out ${
                        isDateEnabled
                          ? 'max-h-20 opacity-100 translate-y-0'
                          : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <Input type="date" className="transition-all animate-duration-fast" />
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 3. EMBED */}
            <Card variant="sunken" padding={"lg"} className='w-full border-0'>
              <CardHeader>
                <CardTitle className='text-h2'>Embed in your site</CardTitle>
              </CardHeader>
              <CardContent>
                <Stack gap="md">
                  <Tabs variant={'pill'} size='md' defaultValue="standard" className='border-0 bg-action-secondary-primary'>
                    <TabsList className='border-0'>
                      <TabsTrigger value="standard">Standard</TabsTrigger>
                      <TabsTrigger value="popup">Popup</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <TextArea
                    readOnly
                    rows={4}
                    value={`<iframe src="${shareUrl}" ...></iframe>`}
                  />
                  <Button variant="glass" size="md"  onClick={() => copyHandler("Copied iframe", `<iframe src="${shareUrl}" ...></iframe>`)}>
                    Copy
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Box>

      {/* RIGHT PANEL: The "Display Preview"
          - flex-[1.5]: Makes the preview area larger than the settings area
          - bg-surface-sunken: Creates the dark background "stage"
      */}
      <Stack
        justify={'center'}
        align={'center'}
        gap={'md'}
        className=" lg:flex flex-[1.5] h-full bg-surface-sunken p-10 relative"
      >
        <Badge className='absolute top-m' color={'success'}>Display Preview</Badge>
        <Box className=" border-0 bg-transparent w-full  "></Box>

        {/* Mock Form Card: This is what you were looking for! */}
        <FlexibleScreen />
      </Stack>

      {/* --- TOAST NOTIFICATION WRAPPER --- */}

    </Stack>
  )
}
