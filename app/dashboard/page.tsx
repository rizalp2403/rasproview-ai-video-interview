import { Suspense } from 'react'
import { InterviewCards } from '@/components/interview-cards'
import { RecentSubmissions } from '@/components/recent-submissions'
import { AnalyticsOverview } from '@/components/analytics-overview'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'

export default function DashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to RasproView AI - Manage your video interviews and analyze candidate responses
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid gap-6">
          {/* Interview Overview Cards */}
          <InterviewCards />

          {/* Analytics Overview */}
          <AnalyticsOverview />

          {/* Recent Submissions Table */}
          <RecentSubmissions />
        </div>
      </Suspense>
    </div>
  )
}