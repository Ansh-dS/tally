'use client'
import { Badge } from '@primitives/Badge/Badge'
import { Box } from '@primitives/Box/Box'
import { Button } from '@primitives/Button/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@primitives/Card/Card'
import { Sidebar, SidebarItem } from '@primitives/Sidebar/Sidebar'
import { Stack } from '@primitives/Stack/Stack'
import { Stat } from '@primitives/Stat/Stat'
import { Text } from '@primitives/Text/Text'
import { Select } from '@primitives/Select/Select'
import { Footer } from '@primitives/Footer/Footer'
import { DataGrid, DataGridHeader, DataGridRow, DataGridHead, DataGridCell } from '@primitives/DataGrid/DataGrid'

import {
  BarChart3,
  Download,
  TrendingUp,
  LineChart,
  Eye,
  Play,
} from 'lucide-react'
export default function EditorResultPage() {
  return (
    <Stack
      direction="horizontal"
      className="w-full overflow-y-auto bg-surface-sunken p-s"
    >
      {/* Left Sidebar */}
      <Sidebar
        variant="inset"
        className="w-60 border-r border-border-default"
        header={
          <Box className="p-m border-0">
            <Text variant="label" weight="semibold" color="secondary">
              Views
            </Text>
          </Box>
        }
        footer={
          <Footer className="p-0 border-none">
            <Card className="border-none bg-surface-base/50">
              <CardContent className="p-m">
                <Stack gap="sm">
                  <Text variant="label" weight="semibold" color="primary">
                    Pro Limits
                  </Text>
                  <Text variant="caption" color="secondary">
                    Upgrade to see more insights
                  </Text>
                  <Button variant="primary" size="sm" fullWidth>
                    Upgrade
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Footer>
        }
      >
        <SidebarItem label="Overview" icon={<Eye size={18} />} active />
        <SidebarItem label="Responses" icon={<Play size={18} />} />
        <SidebarItem label="Drop-off" icon={<TrendingUp size={18} />} />
      </Sidebar>

      {/* Right Main Content */}
      <Box className="flex-1  overflow-y-auto p-l border-0 bg-surface-sunken">
        <Stack gap="lg">
          {/* Insights Header */}
          <Stack
            direction="horizontal"
            className="items-center justify-between w-full"
          >
            <Text variant="h2" weight="bold" color="primary">
              Insights
            </Text>
            <Stack direction="horizontal" className="gap-md items-center w-full">
              <Select
                options={[
                  { label: 'Last 30 Days', value: '30' },
                  { label: 'Last 7 Days', value: '7' },
                  { label: 'Today', value: '1' },
                ]}
              />
              <Button
                variant="outline"
                size="sm"
                startIcon={<Download size={16} />}
              >
                Export CSV
              </Button>
            </Stack>
          </Stack>

          {/* Top Metrics */}
          <Stack direction="horizontal" className="gap-lg  w-full">
            <Card className="flex-1">
              <CardContent className="p-lg">
                <Stat label="Views" value="1,204" />
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-lg">
                <Stat label="Starts" value="842" />
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-lg">
                <Stat label="Done" value="68%" />
              </CardContent>
            </Card>
          </Stack>

          {/* Visualizations */}
          <Stack direction="horizontal" className="gap-lg  w-full">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>
                  <Text
                    variant="subheader"
                    weight="semibold"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 size={18} />
                    Devices
                  </Text>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Box className="h-64 bg-surface-sunken/30 rounded-lg flex items-center justify-center">
                  <Text variant="body" color="secondary">
                    Chart Component
                  </Text>
                </Box>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>
                  <Text
                    variant="subheader"
                    weight="semibold"
                    className="flex items-center gap-2"
                  >
                    <LineChart size={18} />
                    Sources
                  </Text>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Box className="h-64 bg-surface-sunken/30 rounded-lg flex items-center justify-center">
                  <Text variant="body" color="secondary">
                    Chart Component
                  </Text>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          {/* Recent Responses Table */}
          <Card className="p-l border-none w-full ">
            <CardHeader className="border-b border-border-default">
              <CardTitle>
                <Text variant="subheader" weight="semibold">
                  Latest Responses
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataGrid size="md">
                <DataGridHeader>
                  <DataGridRow>
                    <DataGridHead>Date</DataGridHead>
                    <DataGridHead>Email</DataGridHead>
                    <DataGridHead>Topic</DataGridHead>
                    <DataGridHead>Status</DataGridHead>
                  </DataGridRow>
                </DataGridHeader>
                <DataGridRow>
                  <DataGridCell>2024-03-20</DataGridCell>
                  <DataGridCell>john@example.com</DataGridCell>
                  <DataGridCell>Sales</DataGridCell>
                  <DataGridCell>
                    <Badge color="success">Complete</Badge>
                  </DataGridCell>
                </DataGridRow>
                <DataGridRow>
                  <DataGridCell>2024-03-19</DataGridCell>
                  <DataGridCell>jane@example.com</DataGridCell>
                  <DataGridCell>Support</DataGridCell>
                  <DataGridCell>
                    <Badge color="warning">Pending</Badge>
                  </DataGridCell>
                </DataGridRow>
                <DataGridRow>
                  <DataGridCell>2024-03-18</DataGridCell>
                  <DataGridCell>alex@example.com</DataGridCell>
                  <DataGridCell>Sales</DataGridCell>
                  <DataGridCell>
                    <Badge color="success">Complete</Badge>
                  </DataGridCell>
                </DataGridRow>
              </DataGrid>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  )
}
