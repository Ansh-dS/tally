'use client'

import EditorLayout from '@/components/editor/EditorLayout'
import SharePage from '@/components/editor/SharePage'

export default function EditorSharePage() {
  return <EditorLayout activeTab="share" children=<SharePage /> />
}
