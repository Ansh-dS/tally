'use client'
// Renders the whole dashborad

import { useRouter } from 'next/navigation'
import { deleteForm } from '@actions/form'
import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { Badge } from '@primitives/Badge/Badge'
import { Button } from '@primitives/Button/Button'
import { DropdownMenu } from '@primitives/DropDown/DropDown'
import { DataList, DataListItem } from '@primitives/DataList/DataList'
import { Stat } from '@primitives/Stat/Stat'
import { EmptyState } from '@primitives/EmptyState/EmptyState'

import {
  FileText,
  Plus,
  Edit3,
  Share2,
  List,
  MoreVertical,
  Trash2,
  Copy,
} from 'lucide-react'
import path from 'path'

interface FormsDashboardProps {
  forms: null | Array<{
    id: string
    title: string | null
    published: boolean
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
  function handleShare(formId: string) {}
  function handleResults(formId: string) {}
  function handleDuplicate(formId: string) {}
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
            router.push('/forms/new/edit')
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
        <Box className="px-2xl py-6 w-full border-0">
          <DataList spacing="relaxed" variant={'inset'}>
            {forms.map((form) => (
              <DataListItem
                key={form.id}
                interactive
                className="flex items-center justify-between p-m"
              >
                {/* LEFT SIDE: Identity & Status */}
                <Stack gap="sm" className="border-0 bg-transparent">
                  <Stack
                    direction="horizontal"
                    align="center"
                    className="gap-3 border-0 bg-transparent"
                  >
                    <Text weight="semibold">
                      {form.title || 'Untitled Form'}
                    </Text>
                    <Badge
                      color={form.published ? 'success' : 'default'}
                      size="sm"
                    >
                      {form.published ? 'Live' : 'Draft'}
                    </Badge>
                  </Stack>

                  {/* SECONDARY INFO */}
                  <Stack
                    direction="horizontal"
                    align="center"
                    className="gap-2 opacity-60 border-0 bg-transparent"
                  >
                    <Text variant="caption">1.2k Views</Text>
                    <Text variant="caption">•</Text>
                    <Text variant="caption">430 Submissions</Text>
                  </Stack>
                </Stack>

                {/* RIGHT SIDE: Primary Action + Kebab Dropdown */}
                <Stack
                  direction="horizontal"
                  align="center"
                  className="gap-2 border-0 bg-transparent"
                >
                  {/* Primary Action: Leveraging our Smart Button */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.replace(`/forms/${form.id}/edit`)
                    }}
                    size="sm"
                    startIcon={<Edit3 />}
                    className="hover:bg-action-ghost-hover active:bg-action-primary-subtle transition-all animate-duration-fast"
                  >
                    Edit
                  </Button>

                  {/* THE DROPDOWN: Implementation using our Portal-based DropdownMenu */}
                  <DropdownMenu
                    align="right"
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-1 hover:bg-action-ghost-hover active:bg-action-primary-subtle transition-all animate-duration-fast"
                        color="secondary"
                      >
                        <MoreVertical size={18} />
                      </Button>
                    }
                  >
                    {/* Children: A Stack of Buttons to maintain Action Menu rhythm */}
                    <Stack
                      direction="vertical"
                      gap="none"
                      className="p-xs min-w-45 border-0 bg-transparent"
                    >
                      <Button
                        variant="ghost"
                        fullWidth
                        className="justify-start font-normal"
                        startIcon={<Share2 />}
                        onClick={() => handleShare(form.id)}
                      >
                        Share Form
                      </Button>

                      <Button
                        variant="ghost"
                        fullWidth
                        className="justify-start font-normal"
                        startIcon={<List />}
                        onClick={() => handleResults(form.id)}
                      >
                        View Results
                      </Button>

                      <Button
                        variant="ghost"
                        fullWidth
                        className="justify-start font-normal"
                        startIcon={<Copy />}
                        onClick={() => handleDuplicate(form.id)}
                      >
                        Duplicate
                      </Button>

                      {/* NEW: Visual Separator using our Box atom */}
                      <Box className="h-px w-full bg-border-default my-xs border-0" />

                      <Button
                        variant="ghost"
                        fullWidth
                        color={'danger'}
                        className="hover:bg-status-danger/10 active:bg-status-danger/15 transition-all animate-duration-fast"
                        startIcon={<Trash2 />}
                        onClick={() =>
                          deleteForm({ formId: form.id }, '/forms')
                        }
                      >
                        Delete Form
                      </Button>
                    </Stack>
                  </DropdownMenu>
                </Stack>
              </DataListItem>
            ))}
          </DataList>
        </Box>
      ) : (
        <EmptyState
          fullWidth={true}
          description="Create your first form to start collecting responses."
          title={'No forms yet'}
          icon={<FileText />}
          variant={'minimal'}
          className="mt-s"
        ></EmptyState>
      )}
    </>
  )
}
