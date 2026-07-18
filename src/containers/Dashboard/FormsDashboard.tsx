'use client'

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
import { Card } from '@primitives/Card/Card'
import { type WorkspaceStatsAndForms } from '@/lib/utils/data-fetchers'

import {
  FileText,
  Plus,
  Edit3,
  Share2,
  List,
  MoreVertical,
  Trash2,
  Copy,
  Sparkles,
} from 'lucide-react'
import { Alert } from '@/components/ui/Alert/Alert'

// Stable sentinel ID that routes to mock analytics without a real DB lookup.
const DEMO_FORM_ID = 'demo-form-123'

// Virtual demo FormStatItem — shown only when the workspace has zero real forms.
const DEMO_FORM_ITEM = {
  formId: DEMO_FORM_ID,
  formTitle: '✨ Customer Experience Feedback (Demo)',
  totalViews: 1240,
  submissions: 486,
  conversionRatio: 39.2,
  published: true,
} satisfies import('@/lib/utils/data-fetchers').FormStatItem

// we can't make entire function as async but can create some functions using async.
export default function FormsDashboard({
  formsAndStat,
}: {
  formsAndStat: WorkspaceStatsAndForms
}) {
  const router = useRouter()
  const forms = formsAndStat.forms
  const activeForms = formsAndStat.globalStats.activeForms
  const draftForms = formsAndStat ? forms.length - activeForms : 0
  const ConversionRatio = `${formsAndStat.globalStats.conversionRatio}%`

  // If the user has no forms yet, surface the virtual demo entry so the
  // dashboard is never blank for new accounts or recruiter previews.
  const isNewUser = forms.length === 0
  const displayForms = isNewUser ? [DEMO_FORM_ITEM] : forms

  function handleShare(formId: string) {
    router.replace(`/forms/${formId}/share`)
  }

  function handleResults(formId: string) {
    router.push(`/forms/${formId}/results`)
  }

  function handleDuplicate(formId: string) {}

  return (
    <Box className="w-full border-0 p-xl">
      {/* Header Zone */}
      <Stack
        className="justify-between w-full mb-3xl mt-xl"
        direction="horizontal"
        align="center"
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

      {/* Stats Zone */}
      <Stack justify={'center'} align={'center'}>
        <Stack direction="horizontal" className="gap-xl w-full mb-3xl">
          <Stat
            label="Total Views"
            value={formsAndStat.globalStats.totalViews}
            variant="glass"
            align="left"
            className="flex-1"
          />
          <Stat
            label="Submissions"
            value={formsAndStat.globalStats.submissions}
            variant="glass"
            align="left"
            className="flex-1"
          />
          <Stat
            label="Conversion"
            value={ConversionRatio}
            variant="glass"
            align="left"
            className="flex-1"
          />
          <Card className="flex flex-row justify-center flex-1 p-s gap-4 rounded-large transition-all duration-normal bg-surface-base/15 backdrop-blur-md border border-border-default/50 shadow-sm hover:bg-surface-base/20">
            <div>
              <Text variant="h1" weight="bold" color="success">
                {activeForms}
              </Text>
              <Text variant="caption" color="secondary">
                Active
              </Text>
            </div>
            <div className="w-px h-8 mt-2 border border-border-default/70" />{' '}
            {/* Clean subtle divider line */}
            <div>
              <Text variant="h1" weight="bold" color="primary">
                {draftForms}
              </Text>
              <Text variant="caption" color="secondary">
                Draft
              </Text>
            </div>
          </Card>
        </Stack>

        {/* 1. using if('?') else(':') logic to conditionally run components
              2. another condtional logic is:
                  if x exists(&&) then only run the component. 
            */}
        {/* Show the form list using displayForms (real or demo fallback) */}
        {displayForms.length > 0 ? (
          <Box className="w-full border-0">
            {isNewUser && (
              <Alert
                severity="warning"
                className="mb-s opacity-45 bg-transparent border-0 "
              >
                <Stack
                  align={'center'}
                  justify={'center'}
                  direction={'horizontal'}
                >
                  <Sparkles size={18} />
                  <Text color={'warning'} weight={'semibold'}>
                    Demo Mode —{' '}
                  </Text>
                  <Text color={'warning'}>This is a sample form.</Text>
                </Stack>
              </Alert>
            )}
            <DataList spacing="relaxed" variant="inset">
              {displayForms.map((form) => (
                <DataListItem
                  key={form.formId}
                  interactive
                  className="flex items-center justify-between p-m"
                >
                  <Stack gap="sm" className="border-0 bg-transparent">
                    <Stack
                      direction="horizontal"
                      align="center"
                      className="gap-3 border-0 bg-transparent"
                    >
                      <Text weight="semibold">
                        {form.formTitle || 'Untitled Form'}
                      </Text>
                      <Badge
                        color={form.published ? 'success' : 'default'}
                        size="sm"
                      >
                        {form.published ? 'Live' : 'Draft'}
                      </Badge>
                    </Stack>

                    <Stack
                      direction="horizontal"
                      align="center"
                      className="gap-2 opacity-60 border-0 bg-transparent"
                    >
                      <Text variant="caption">{form.totalViews} Views</Text>
                      <Text variant="caption">•</Text>
                      <Text variant="caption">
                        {form.submissions} Submissions
                      </Text>
                    </Stack>
                  </Stack>

                  <Stack
                    direction="horizontal"
                    align="center"
                    className="gap-2 border-0 bg-transparent"
                  >
                    {/* Hide Edit button for the virtual demo form */}
                    {form.formId !== DEMO_FORM_ID && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          router.replace(`/forms/${form.formId}/edit`)
                        }}
                        size="sm"
                        startIcon={<Edit3 />}
                        className="hover:bg-action-ghost-hover active:bg-action-primary-subtle transition-all animate-duration-fast"
                      >
                        Edit
                      </Button>
                    )}

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
                      <Stack
                        direction="vertical"
                        gap="none"
                        className="p-xs min-w-45 border-0 bg-transparent"
                      >
                        {form.formId !== DEMO_FORM_ID && (
                          <Button
                            variant="ghost"
                            fullWidth
                            className="justify-start font-normal"
                            startIcon={<Share2 />}
                            onClick={() => handleShare(form.formId)}
                          >
                            Share Form
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          fullWidth
                          className="justify-start font-normal"
                          startIcon={<List />}
                          onClick={() =>
                            router.push(`/forms/${form.formId}/results`)
                          }
                        >
                          View Results
                        </Button>

                        {form.formId !== DEMO_FORM_ID && (
                          <>
                            <Button
                              variant="ghost"
                              fullWidth
                              className="justify-start font-normal"
                              startIcon={<Copy />}
                              onClick={() => handleDuplicate(form.formId)}
                            >
                              Duplicate
                            </Button>

                            <Box className="h-px w-full bg-border-default my-xs border-0" />

                            <Button
                              variant="ghost"
                              fullWidth
                              color="danger"
                              className="hover:bg-status-danger/10 active:bg-status-danger/15 transition-all animate-duration-fast"
                              startIcon={<Trash2 />}
                              onClick={() =>
                                deleteForm({ formId: form.formId }, '/forms')
                              }
                            >
                              Delete Form
                            </Button>
                          </>
                        )}
                      </Stack>
                    </DropdownMenu>
                  </Stack>
                </DataListItem>
              ))}
            </DataList>
          </Box>
        ) : (
          <EmptyState
            fullWidth
            description="Create your first form to start collecting responses."
            title="No forms yet"
            icon={<FileText />}
            variant="minimal"
            className="mt-s"
          />
        )}
      </Stack>
    </Box>
  )
}
