'use server'
// we use 'f' in the path so it doesn't gets colide with any root folder 'page.tsx' file.
// It's a public page where users come and submit reponses:
// If the form isn't "Published,"
// It shows a 404 error to keep your drafts private.

import { FallbackPage } from '@/containers/fallback/FallbackPage'
import {
  canShowForm,
  getFormFallbackConfig,
  fallbacks,
} from '@/lib/utils/form-access'
import { getform } from '@utils/data-fetchers'
import { SubmissionWithPassProvider } from '@/containers/UserSubmission/submissionSwitcher'

export default async function ResponseSubmissionPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const formAttributes = await getform({ formId })

  // form exists or not
  if (!formAttributes) return <FallbackPage {...fallbacks['no_form_exists']} />

  // Fallback Page: can't show form
  const accessState = await canShowForm({
    published: formAttributes.published ?? false,
    password: formAttributes.password,
    expDate: formAttributes.expiresAt,
  })
  // if true: show's up the fallback page.
  if (!accessState.canShow) {
    const fallbackConfig = await getFormFallbackConfig(accessState)
    return fallbackConfig ? <FallbackPage {...fallbackConfig} /> : null
  }

  return (
    <SubmissionWithPassProvider
      formAttributes={formAttributes}
      formId={formId}
    />
  )
}

/*
states:
  database
  user. 

  does password matches. 


*/
