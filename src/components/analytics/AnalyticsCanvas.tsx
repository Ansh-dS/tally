'use client'

import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataGrid,
  DataGridCell,
  DataGridHead,
  DataGridHeader,
  DataGridRow,
  Input,
  Select,
  Stack,
  Stat,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from 'components'

import { Download, Search, TrendingUp, Monitor, Smartphone, Tablet } from 'lucide-react'

export default function AnalyticsCanvas() {
  return (
    <Stack direction="vertical" className="w-full p-8 gap-8">
      <Stack direction="horizontal" className="items-center justify-between">
        <Stack direction="horizontal" className="items-center gap-3">
          <Text variant="h1" weight="bold" color="primary">
            Workspace Analytics
          </Text>
          <Badge color="default">All Forms</Badge>
        </Stack>

        <Stack direction="horizontal" className="items-center gap-4">
          <Select
            options={[
              { label: 'Last 30 Days', value: '30' },
              { label: 'Last 7 Days', value: '7' },
              { label: 'Today', value: '1' },
            ]}
          />
          <Button variant="primary" startIcon={<Download size={16} />}>
            Export Report
          </Button>
        </Stack>
      </Stack>

      <Stack direction="horizontal" className="gap-6">
        <Card className="flex-1">
          <CardContent className="p-6">
            <Stack gap="sm">
              <Stat label="Views" value="34.2k" />
              <Text variant="caption" color="success" weight="medium">
                +4%
              </Text>
            </Stack>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="p-6">
            <Stack gap="sm">
              <Stat label="Starts" value="12.1k" />
              <Text variant="caption" color="success" weight="medium">
                +2%
              </Text>
            </Stack>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="p-6">
            <Stack gap="sm">
              <Stat label="Comp." value="35.4%" />
              <Text variant="caption" color="warning" weight="medium">
                -1%
              </Text>
            </Stack>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="p-6">
            <Stack gap="sm">
              <Stat label="Avg Time" value="02:14" />
              <Text variant="caption" color="warning" weight="medium">
                -4s
              </Text>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card>
        <CardContent className="p-6">
          <Stack gap="lg">
            <Stack direction="horizontal" className="items-center justify-between">
              <Text variant="h3" weight="semibold" color="primary">
                Submission Volume
              </Text>

              <Tabs defaultValue="day" variant="pill">
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </Stack>

            <Box className="h-80 rounded-large bg-surface-sunken/40 border border-border-default flex items-center justify-center">
              <Text variant="body" color="secondary">
                Area Chart Placeholder (Submissions vs Time)
              </Text>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="horizontal" className="gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              <Text variant="subheader" weight="semibold" color="primary">
                Source Performance
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="md">
              <Stack direction="horizontal" className="items-center justify-between">
                <Text variant="body" color="secondary">
                  Direct
                </Text>
                <Text variant="body" weight="semibold" color="primary">
                  45%
                </Text>
              </Stack>

              <Stack direction="horizontal" className="items-center justify-between">
                <Text variant="body" color="secondary">
                  Social
                </Text>
                <Text variant="body" weight="semibold" color="primary">
                  30%
                </Text>
              </Stack>

              <Stack direction="horizontal" className="items-center justify-between">
                <Text variant="body" color="secondary">
                  Referral
                </Text>
                <Text variant="body" weight="semibold" color="primary">
                  25%
                </Text>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              <Text variant="subheader" weight="semibold" color="primary">
                Device Breakdown
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Stack className="items-center gap-6">
              <Box className="h-44 w-44 rounded-full border-8 border-surface-sunken bg-surface-muted flex items-center justify-center">
                <Text variant="caption" color="secondary">
                  Donut Chart
                </Text>
              </Box>

              <Stack gap="sm" className="w-full">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" className="items-center gap-2">
                    <Monitor size={16} />
                    <Text variant="body" color="secondary">
                      Desktop
                    </Text>
                  </Stack>
                  <Text variant="body" weight="semibold" color="primary">
                    60%
                  </Text>
                </Stack>

                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" className="items-center gap-2">
                    <Smartphone size={16} />
                    <Text variant="body" color="secondary">
                      Mobile
                    </Text>
                  </Stack>
                  <Text variant="body" weight="semibold" color="primary">
                    35%
                  </Text>
                </Stack>

                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" className="items-center gap-2">
                    <Tablet size={16} />
                    <Text variant="body" color="secondary">
                      Tablet
                    </Text>
                  </Stack>
                  <Text variant="body" weight="semibold" color="primary">
                    5%
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card className="p-0 overflow-hidden">
        <Box className="p-6 border-b border-border-default">
          <Stack direction="horizontal" className="items-center justify-between gap-4">
            <Text variant="h3" weight="semibold" color="primary">
              Top Performing Forms
            </Text>

            <Box className="w-full max-w-sm">
              <Input placeholder="Search forms..." startIcon={<Search size={16} />} />
            </Box>
          </Stack>
        </Box>

        <CardContent className="p-0">
          <DataGrid size="md">
            <DataGridHeader>
              <DataGridRow>
                <DataGridHead>Form Name</DataGridHead>
                <DataGridHead>Conversion</DataGridHead>
                <DataGridHead>Traffic</DataGridHead>
                <DataGridHead>Trend</DataGridHead>
              </DataGridRow>
            </DataGridHeader>

  
              <DataGridRow>
                <DataGridCell>Q3 Product Survey</DataGridCell>
                <DataGridCell>42%</DataGridCell>
                <DataGridCell>5,401</DataGridCell>
                <DataGridCell>
                  <Stack direction="horizontal" className="items-center gap-2">
                    <TrendingUp size={14} className="text-status-success" />
                    <Text variant="caption" color="success" weight="medium">
                      Upward
                    </Text>
                  </Stack>
                </DataGridCell>
              </DataGridRow>

              <DataGridRow>
                <DataGridCell>Event RSVP</DataGridCell>
                <DataGridCell>89%</DataGridCell>
                <DataGridCell>1,200</DataGridCell>
                <DataGridCell>
                  <Stack direction="horizontal" className="items-center gap-2">
                    <TrendingUp size={14} className="text-status-success" />
                    <Text variant="caption" color="success" weight="medium">
                      Strong
                    </Text>
                  </Stack>
                </DataGridCell>
              </DataGridRow>

              <DataGridRow>
                <DataGridCell>Newsletter Signup</DataGridCell>
                <DataGridCell>12%</DataGridCell>
                <DataGridCell>9,842</DataGridCell>
                <DataGridCell>
                  <Stack direction="horizontal" className="items-center gap-2">
                    <Box className="h-2 w-16 rounded-full bg-status-warning/40" />
                    <Text variant="caption" color="warning" weight="medium">
                      Flat
                    </Text>
                  </Stack>
                </DataGridCell>
              </DataGridRow>

          </DataGrid>
        </CardContent>
      </Card>
    </Stack>
  )
}
