export function LoginFormSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div className="h-10 bg-gray-200 animate-pulse rounded-t-md"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded-b-md"></div>
      </div>
      <div className="h-10 bg-indigo-600 animate-pulse rounded-md"></div>
    </div>
  )
} 