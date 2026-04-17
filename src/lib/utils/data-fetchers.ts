import { requireUser } from '@/action/dashboard'
import { allForms } from '@/action/form'
import { cache } from 'react'
// cache: it stores data and only re-store if the path changes
export const getDashboardData = cache(async (path: string) => {
  const userData = await requireUser(path)
  const formsRes = await allForms({
    userId: userData.id,
    currentPath: path,
  })
  
  return {
    userData,
    formsData: formsRes.data as any[] | null
  }
})
