import { getAuthorizedUser } from '@/action/dashboard'
import { allForms } from '@/action/form'
import { cache } from 'react'
import { prismaClient } from '@db/client'
import { FormBlock } from '@utils/store'
import { redirect } from 'next/navigation'

type DashboardForm = {
  id: string
  title: string | null
  published: boolean
  updatedAt?: string | Date
  _count?: {
    responses?: number
    submissions?: number
  }
}
// cache: it stores data and only re-store if the path changes
export const getDashboardData = cache(async (path: string) => {
  const userData = await getAuthorizedUser(path)
  const formsRes = await allForms({
    userId: userData.id,
  })

  return {
    userData,
    formsData: formsRes.data as DashboardForm[] | null,
  }
})

// The Settings Type (What goes in the 'settings' Json column)
export interface FormSettings {
  theme: 'light' | 'dark' | 'system'
  isDraft: boolean
  showProgressBar: boolean
}

// 3. The Full Editor State (The Bridge)
export interface EditorForm {
  id: string
  title: string
  description: string | null
  published: boolean
  blocks: FormBlock[]
}
/* 
1. Below funciton is similar to above but not the same we are fetching different data, specificly for editor. 
2. we aren't passing the data from dashboard to editor as there isn't way:
    we should avoid to pass userId from dashboard to editor because of:
      security issue. 
*/
export const getEditorData = cache(async (formId: string, path: string) => {
  // 1. Authenticate user securely on the server
  const userData = await getAuthorizedUser(path)

  // run when form is not new.
  if (formId !== 'new') {
    // 2. Fetch the specific form, including the heavy JSON blocks
    const form = await prismaClient.form.findUnique({
      where: {
        id: formId,
        userId: userData.id, // Security check to ensure ownership
      },
      select: {
        id: true,
        title: true,
        description: true,
        blocks: true, // for the editor canvas
        published: true,
      },
    })

    if (form === null) {
      redirect('/forms?warning=form_not_found')
      // use an alret to tell the user that fomId doesn't exist.
    }

    return {
      userData,
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        published: form.published,
        blocks: form.blocks as unknown as FormBlock[],
      } as EditorForm,
    }
  }

  return {
    userData,
    form: null,
  }
})
