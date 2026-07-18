import { getDashboardData } from '@utils/data-fetchers'
import DashboardLayoutUI from '@/containers/layouts/DashboardLayoutUI'
import { getDropOffAlerts } from '@/lib/utils/data-fetchers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // use cache: The layout fetches the user data once for the sidebar/header
  const { userData, formsData } = await getDashboardData('./forms')
  const dropOffs = await getDropOffAlerts(userData.id)

  const formsCount = formsData ? formsData.length : 0

  return (
    <DashboardLayoutUI
      userData={userData}
      dropOffs={dropOffs}
      formsCount={formsCount}
    >
      {children}
    </DashboardLayoutUI>
  )
}
