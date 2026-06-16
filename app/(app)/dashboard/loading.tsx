import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 pt-12 pb-8">
        <Skeleton className="h-4 w-24 bg-white/20 mb-3" />
        <Skeleton className="h-10 w-40 bg-white/20 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-16 flex-1 bg-white/20 rounded-xl" />
          <Skeleton className="h-16 flex-1 bg-white/20 rounded-xl" />
        </div>
      </div>
      <div className="px-4 py-5 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
