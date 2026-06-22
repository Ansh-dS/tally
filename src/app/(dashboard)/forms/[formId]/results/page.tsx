'use server'

import EditorLayout from '@/containers/layouts/EditorLayout'
import EditorResultPage from '@/containers/editor/ResultPage'

export default async function ResultsPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params

  return (
    <EditorLayout activeTab="results" formId={formId}>
      <EditorResultPage />
    </EditorLayout>
  )
}
