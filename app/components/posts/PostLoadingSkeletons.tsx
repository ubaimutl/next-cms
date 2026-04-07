function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[0.4rem] bg-current/10 ${className}`}
    />
  );
}

export function PostListSkeleton() {
  return (
    <section className="mx-auto min-h-[60vh] w-[95vw] pb-24 md:w-[90vw]">
      <div className="grid gap-10 border-b border-current/10 pt-10 pb-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
        <div>
          <SkeletonBlock className="h-2.5 w-28 md:w-32" />
          <SkeletonBlock className="mt-5 h-[13vw] w-[60vw] max-w-[28rem] md:h-[9vw] md:w-[38vw] lg:h-[7vw]" />
          <div className="mt-6 space-y-2">
            <SkeletonBlock className="h-3 w-[70vw] max-w-[28rem] md:h-2.5 md:w-[34vw]" />
          </div>
        </div>

        <div className="grid gap-3 md:max-w-[18rem] lg:justify-self-end">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 border-b border-current/10 pb-3">
              <SkeletonBlock className="h-2.5 w-16" />
              <SkeletonBlock className="h-2.5 w-14" />
            </div>
          ))}
        </div>
      </div>

      <ul className="list-none divide-y divide-current/10">
        {Array.from({ length: 7 }).map((_, index) => (
          <li key={index}>
            <div className="grid gap-5 py-7 md:grid-cols-[4rem_minmax(0,1fr)_auto] md:items-end md:gap-8 md:py-8">
              <SkeletonBlock className="h-2.5 w-8" />
              <div className="space-y-3">
                <SkeletonBlock className="h-[9vw] w-full max-w-[24rem] md:h-[4.8vw] md:max-w-[30rem] xl:h-[2.8vw]" />
                <SkeletonBlock className="h-[9vw] w-[76%] max-w-[18rem] md:h-[4.8vw] md:max-w-[22rem] xl:h-[2.8vw]" />
              </div>
              <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                <SkeletonBlock className="h-2.5 w-20" />
                <SkeletonBlock className="h-2.5 w-10" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PostDetailSkeleton() {
  return (
    <section className="mx-auto min-h-[60vh] w-[95vw] md:w-[90vw]">
      <SkeletonBlock className="mt-10 h-3 w-28 md:h-2.5 md:w-32" />

      <div className="mt-10 border-t border-current/20 pt-8 md:pt-12">
        <SkeletonBlock className="h-3 w-20 md:h-2.5 md:w-24" />

        <div className="mt-4 max-w-6xl space-y-3">
          <SkeletonBlock className="h-[10vw] w-full max-w-[28rem] md:h-[6vw] md:max-w-[40rem] lg:h-[5vw]" />
          <SkeletonBlock className="h-[10vw] w-[78%] max-w-[20rem] md:h-[6vw] md:max-w-[30rem] lg:h-[5vw]" />
        </div>

        <div className="mt-10 max-w-4xl space-y-8">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-full md:h-3" />
            <SkeletonBlock className="h-4 w-[94%] md:h-3" />
            <SkeletonBlock className="h-4 w-[88%] md:h-3" />
            <SkeletonBlock className="h-4 w-[76%] md:h-3" />
          </div>

          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-36 md:h-3 md:w-44" />
            <SkeletonBlock className="h-4 w-full md:h-3" />
            <SkeletonBlock className="h-4 w-[92%] md:h-3" />
            <SkeletonBlock className="h-4 w-[68%] md:h-3" />
          </div>

          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-full md:h-3" />
            <SkeletonBlock className="h-4 w-[90%] md:h-3" />
            <SkeletonBlock className="h-4 w-[72%] md:h-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
