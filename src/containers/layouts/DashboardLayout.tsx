import { getDashboardData } from '@utils/data-fetchers'
import DashboardLayoutUI from '@/containers/layouts/DashboardLayoutUI'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // use cache: The layout fetches the user data once for the sidebar/header
  const { userData } = await getDashboardData('./forms')

  return <DashboardLayoutUI userData={userData}>{children}</DashboardLayoutUI>
}
