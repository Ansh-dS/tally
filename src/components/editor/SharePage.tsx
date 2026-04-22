import {
  Stack,
  Box,
  Text,
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  CardTitle,
  Tabs,
  Switch,
  TabsList,
  TextArea,
  TabsTrigger,
  Radio,
  Badge,
} from 'components'

export default function SharePage() {
  return (
    <Stack
      direction="horizontal"
      className="h-[calc(100vh-4rem)] w-full overflow-hidden"
    >
      <Box className="flex-1 overflow-y-auto p-8">
        <Stack gap="lg" className="max-w-3xl">
          <Text variant="h2" weight="bold" color="primary">
            Share your form
          </Text>

          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="subheader" weight="semibold">
                  Direct Link
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="sm">
                <Text variant="label" color="secondary">
                  Share Link
                </Text>
                <Stack direction="horizontal" className="gap-2 items-center">
                  <Input readOnly value="tallybuilder.com/f/xyz" />
                  <Button variant="outline">Copy</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="subheader" weight="semibold">
                  Access Controls
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <Stack
                  direction="horizontal"
                  className="items-center justify-between"
                >
                  <Text variant="body" color="primary">
                    Require Password
                  </Text>
                  <Switch />
                </Stack>
                <Stack
                  direction="horizontal"
                  className="items-center justify-between"
                >
                  <Text variant="body" color="primary">
                    Close on specific date
                  </Text>
                  <Switch />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="subheader" weight="semibold">
                  Embed in your site
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <Tabs defaultValue="standard" variant="pill">
                  <TabsList>
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="popup">Popup</TabsTrigger>
                  </TabsList>
                </Tabs>
                <TextArea
                  readOnly
                  rows={5}
                  value={
                    '<iframe src="https://tallybuilder.com/f/xyz" width="100%" height="500" frameborder="0"></iframe>'
                  }
                />
                <Box>
                  <Button variant="outline">Copy Code</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Box className="flex-[1.5] bg-surface-sunken overflow-y-auto p-8">
        <Stack gap="md" className="h-full items-center">
          <Badge color="success">Live Preview</Badge>

          <Card className="w-full max-w-xl mt-2">
            <CardContent>
              <Stack gap="md">
                <Text variant="h3" weight="semibold" color="primary">
                  Contact Us
                </Text>

                <Stack gap="sm">
                  <Text variant="label" color="secondary">
                    Email Address
                  </Text>
                  <Input placeholder="name@example.com" />
                </Stack>

                <Stack gap="sm">
                  <Text variant="label" color="secondary">
                    Select Topic
                  </Text>
                  <Stack gap="sm">
                    <Radio label="Sales" checked readOnly />
                    <Radio label="Support" readOnly />
                  </Stack>
                </Stack>

                <Button variant="primary">Submit</Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  )
}
