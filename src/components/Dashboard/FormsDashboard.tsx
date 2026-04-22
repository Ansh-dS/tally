'use client'
// Renders the whole dashborad

import { useRouter } from 'next/navigation'

import {
  Stack,
  Box,
  Text,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Stat,
  EmptyState,
} from 'components'

import { FileText, Plus, Edit3, Share2, List } from 'lucide-react'

interface FormsDashboardProps {
  forms: null | Array<{
    id: string
    title: string | null
    status?: string
    updatedAt?: string | Date
    _count?: {
      responses?: number
      submissions?: number
    }
  }>
}

// we can't make entire function as async but can create some functions using async.
export default function FormsDashboard({ forms }: FormsDashboardProps) {
  const router = useRouter()

  return (
    /* Page Header Zone */
    <>
      <Stack
        className="justify-between w-full p-xl"
        direction={'horizontal'}
        align={'center'}
      >
        <Text variant="h1" weight="bold" className="select-none">
          My Forms
        </Text>
        <Button
          variant="primary"
          size="lg"
          startIcon={<Plus size={18} />}
          /*
            if we use empty string('') it could break the URL like:
              /forms//edit
          */
          onClick={() => {
            router.push("./forms/'new'/edit")
          }}
        >
          Create Form
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction="horizontal" className="py-3xl px-xl w-full">
        <Stat
          label="Total Views"
          value="12,842"
          variant={'glass'}
          align={'left'}
          className="flex-1"
        />
        <Stat
          label="Submissions"
          value="3,401"
          variant={'glass'}
          align={'left'}
          className="flex-1"
        />
      </Stack>

      {/* Data Grid */}
      {/* 1. using if('?') else(':') logic to conditionally run components
              2. another condtional logic is:
                  if x exists(&&) then only run the component. 
            */}
      {forms && forms.length > 0 ? (
        <Box className="grid grid-cols-3 gap-6 px-2xl py-6">
          {/* Live Form Card */}
          {forms.map((form) => (
            <Card
              key={form.id}
              className="w-full max-w-80 overflow-hidden border-border-default shadow-sm"
            >
              <Box className="relative h-30 bg-linear-to-br from-surface-sunken via-surface-base to-surface-muted">
                <Badge color="success" className="absolute left-4 top-4">
                  Live
                </Badge>
              </Box>

              <CardContent className="p-4">
                <Stack gap="sm">
                  <CardHeader className="p-0">
                    <CardTitle>
                      <Text
                        variant="subheader"
                        weight="semibold"
                        color="primary"
                      >
                        {form.title || 'Customer Feedback 2026'}
                      </Text>
                    </CardTitle>
                  </CardHeader>

                  <Stack
                    direction="horizontal"
                    align="center"
                    className="gap-2"
                  >
                    <Text variant="caption" color="secondary">
                      1.2k Views
                    </Text>
                    <Text variant="caption" color="secondary">
                      •
                    </Text>
                    <Text variant="caption" color="secondary">
                      430 Submissions
                    </Text>
                  </Stack>

                  <Box className="border-t border-border-default pt-2">
                    <Stack direction="horizontal" className="gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        startIcon={<Edit3 size={16} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        startIcon={<Share2 size={16} />}
                      >
                        Share
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        startIcon={<List size={16} />}
                      >
                        Results
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <EmptyState
          fullWidth={true}
          description="Create your first form to start collecting responses."
          title={'No forms yet'}
          icon={<FileText size={18} />}
          variant={'minimal'}
          className="mt-s"
        ></EmptyState>
      )}
    </>
  )
}
