import { Skeleton } from '@/components/ui/skeleton'

export default function AccountsLoading() {
  return (
    <div className="px-4 pt-12 pb-5 space-y-4">
      <Skeleton className="h-8 w-32" />
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  )
}
