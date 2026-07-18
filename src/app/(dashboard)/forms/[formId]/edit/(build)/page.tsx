import EditorLayout from '@/containers/layouts/EditorLayout'
import BuildPage from '@/containers/editor/build-page-components/BuildPage'
import { getEditorData } from '@utils/data-fetchers'
import { mockDemoAnalytics } from '@/lib/analytics/mockDemoAnalytics'

const DEMO_FORM_ID = 'demo-form-123'

export default async function EditorBuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const currentPath = `/forms/${formId}/edit`

  if (formId === DEMO_FORM_ID) {
    const mockForm = {
      id: DEMO_FORM_ID,
      title: '✨ Customer Experience Feedback (Demo)',
      description: null,
      published: true,
      blocks: mockDemoAnalytics.layout,
    }

    const mockUser = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      image: '',
    }

    return (
      <EditorLayout formId={formId} form={mockForm}>
        <BuildPage form={mockForm} user={mockUser} />
      </EditorLayout>
    )
  }

  const { userData, form } = await getEditorData(formId, currentPath)
  return (
    <EditorLayout formId={formId} form={form}>
      <BuildPage form={form} user={userData} />
    </EditorLayout>
  )
}
