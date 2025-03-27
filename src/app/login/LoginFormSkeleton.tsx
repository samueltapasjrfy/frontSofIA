export function LoginFormSkeleton() {
  return (
    <div>
      {/* Abas de navegação */}
      <div className="flex border-b mb-6">
        <div className="flex-1 py-3 font-medium text-sm relative">
          <div className="h-5 bg-gray-200 w-16 rounded animate-pulse mx-auto"></div>
        </div>
        <div className="flex-1 py-3 font-medium text-sm relative">
          <div className="h-5 bg-gray-200 w-16 rounded animate-pulse mx-auto"></div>
        </div>
      </div>

      {/* Campos do formulário */}
      <div className="space-y-4">
        <div>
          <div className="h-5 bg-gray-200 w-24 rounded animate-pulse mb-1"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 w-24 rounded animate-pulse mb-1"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-4 bg-gray-200 w-32 rounded animate-pulse mt-1 ml-auto"></div>
        </div>
        <div className="h-10 bg-blue-300 animate-pulse rounded-md mt-6"></div>
      </div>
    </div>
  )
} 