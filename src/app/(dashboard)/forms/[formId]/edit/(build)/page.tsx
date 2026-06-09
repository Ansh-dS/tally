import EditorLayout from '@/containers/editor/EditorLayout'
import BuildPage from '@/containers/editor/build-page-components/BuildPage'
import { getEditorData } from '@utils/data-fetchers'

export default async function EditorBuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const currentPath = `/forms/${formId}/edit`

  const { userData, form } = await getEditorData(formId, currentPath)
  return (
    <EditorLayout formId={formId}>
      <BuildPage form={form} user={userData} />
    </EditorLayout>
  )
}
