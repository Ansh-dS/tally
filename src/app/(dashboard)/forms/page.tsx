'use server'

import { getDashboardData } from '@utils/data-fetchers'
import DashboardLayout from '@/containers/layouts/DashboardLayout'
import FormsDashboard from '@/containers/Dashboard/FormsDashboard'
export default async function FormsDashboardPage() {
  const { formsData } = await getDashboardData('./forms')

  // wrapper's doesn't get re-renders but the inner content can, on the different
  return <DashboardLayout children=<FormsDashboard forms={formsData} /> />
}
