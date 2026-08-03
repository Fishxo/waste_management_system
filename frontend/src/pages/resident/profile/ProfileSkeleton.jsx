export default function ProfileSkeleton() {
  const pulse = 'animate-pulse bg-gray-200 rounded'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className={`h-24 w-24 rounded-full ${pulse}`} />
          <div className="flex-1 space-y-3">
            <div className={`h-5 w-40 ${pulse}`} />
            <div className={`h-4 w-56 ${pulse}`} />
            <div className={`h-4 w-32 ${pulse}`} />
          </div>
          <div className={`h-10 w-32 ${pulse}`} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className={`h-5 w-44 mb-2 ${pulse}`} />
        <div className={`h-4 w-36 mb-6 ${pulse}`} />
        <div className="space-y-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <div className={`h-4 w-28 ${pulse}`} />
              <div className={`h-4 w-40 ${pulse}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
