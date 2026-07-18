'use server'

import DashboardLayout from '@/containers/layouts/DashboardLayout'
import FormsDashboard from '@/containers/Dashboard/FormsDashboard'
import { getFormsAndDashboardStats } from '@/lib/utils/data-fetchers'
import { getAuthorizedUser } from '@/action/dashboard'

export default async function FormsDashboardPage() {
  const userData = await getAuthorizedUser('/')
  const formsAndStat = await getFormsAndDashboardStats(userData.id)

  // wrapper's doesn't get re-renders but the inner content can, on the different
  return (
    <DashboardLayout children=<FormsDashboard formsAndStat={formsAndStat} /> />
  )
}
