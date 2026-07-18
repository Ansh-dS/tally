import EditorLayout from '@/containers/layouts/EditorLayout'
import EditorResultPage from '@/containers/editor/ResultPage'
import { getFormAnalytics } from '@/action/analytics'
import { mockDemoAnalytics } from '@/lib/analytics/mockDemoAnalytics'
import { getEditorData } from '@/lib/utils/data-fetchers'

const DEMO_FORM_ID = 'demo-form-123'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params

  if (formId === DEMO_FORM_ID) {
    // Create a lightweight mock form object so the layout can hydrate the store
    const mockForm = {
      id: DEMO_FORM_ID,
      title: '✨ Customer Experience Feedback (Demo)',
      description: null,
      published: true,
      blocks: mockDemoAnalytics.layout,
    } as const

    return (
      <EditorLayout activeTab="results" formId={formId} form={mockForm}>
        <EditorResultPage data={mockDemoAnalytics} isDemo={true} />
      </EditorLayout>
    )
  }

  const [analyticsData, editorData] = await Promise.all([
    getFormAnalytics(formId),
    getEditorData(formId, `/forms/${formId}/results`).catch(() => ({
      form: null,
    })),
  ])

  return (
    <EditorLayout activeTab="results" formId={formId} form={editorData.form}>
      <EditorResultPage data={analyticsData} isDemo={false} />
    </EditorLayout>
  )
}
