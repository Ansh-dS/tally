'use server'

import { getDashboardData } from '@utils/data-fetchers'
import DashboardLayout from '@/containers/layouts/DashboardLayout'
import AnalyticsCanvas from '@/containers/analytics/AnalyticsCanvas'
export default async function FormsDashboardPage() {
  await getDashboardData('./forms')

  // wrapper's doesn't get re-renders but the inner content can, on the different
  return <DashboardLayout children={<AnalyticsCanvas />} />
}
