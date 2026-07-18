import EditorLayout from '@/containers/layouts/EditorLayout'
import SharePage from '@/containers/editor/sharePage/SharePage'
import { getEditorData } from '@/lib/utils/data-fetchers'

export default async function EditorSharePage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const currentPath = `/forms/${formId}/share`

  let form = null
  try {
    const data = await getEditorData(formId, currentPath)
    form = data.form
  } catch {
    // If auth fails or form not found, EditorLayout/middleware will handle redirect
  }

  return (
    <EditorLayout activeTab="share" formId={formId} form={form}>
      <SharePage formId={formId} />
    </EditorLayout>
  )
}
