'use client'

import EditorLayout from '@/components/editor/EditorLayout'
import BuildPage from '@/components/editor/BuildPage'
export default function EditorBuilderPage() {
  return <EditorLayout children=<BuildPage /> />
}
