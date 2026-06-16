import { Skeleton } from '@/components/ui/skeleton'

export default function StatsLoading() {
  return (
    <div className="px-4 pt-12 pb-5 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  )
}
