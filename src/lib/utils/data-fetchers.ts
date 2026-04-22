import { getAuthorizedUser } from '@/action/dashboard'
import { allForms } from '@/action/form'
import { cache } from 'react'

type DashboardForm = {
  id: string
  title: string | null
  status?: string
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
