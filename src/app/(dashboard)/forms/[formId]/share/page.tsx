'use server'

import EditorLayout from '@/containers/editor/EditorLayout'
import SharePage from '@/containers/editor/sharePage/SharePage'

export default async function EditorSharePage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params

  return (
    <EditorLayout activeTab="share" formId={formId}>
      <SharePage formId={formId} />
    </EditorLayout>
  )
}
