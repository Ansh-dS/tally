'use client'

import EditorLayout from '@/components/editor/EditorLayout'
import EditorResultPage from '@/components/editor/ResultPage'


export default function ResultsPage() {
	return (
		<EditorLayout activeTab="results" children=<EditorResultPage/>/>
	)
}
