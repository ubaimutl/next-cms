function SkeletonBar({
  className,
}: {
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-full bg-base-content/10 ${className}`}
    />
  );
}

function SkeletonCardLine({
  className,
}: {
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[0.55rem] bg-base-content/10 ${className}`}
    />
  );
}

function PostListItemSkeleton({
  titleWidth,
  excerptWidth,
}: {
  titleWidth: string;
  excerptWidth: string;
}) {
  return (
    <div className="front-list-item">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_7rem] md:items-start">
        <div className="max-w-2xl">
          <SkeletonCardLine
            className={`h-[clamp(1.55rem,3vw,2.2rem)] ${titleWidth}`}
          />
          <div className="mt-3 space-y-2">
            <SkeletonBar className={`h-4 ${excerptWidth}`} />
            <SkeletonBar className="h-4 w-[72%]" />
          </div>
        </div>

        <div className="front-meta md:pt-1 md:text-right">
          <SkeletonBar className="h-4 w-20 md:ml-auto" />
        </div>
      </div>
    </div>
  );
}

function ParagraphSkeleton({
  widths,
}: {
  widths: string[];
}) {
  return (
    <div className="space-y-3">
      {widths.map((width, index) => (
        <SkeletonBar key={index} className={`h-4 ${width}`} />
      ))}
    </div>
  );
}

export function PostListSkeleton() {
  return (
    <>
      <section className="shell-narrow">
        <div className="front-page-header front-rule">
          <SkeletonBar className="h-3 w-20" />

          <div className="mt-4 space-y-3">
            <SkeletonCardLine className="h-[clamp(2.4rem,5vw,4rem)] w-full max-w-[22rem]" />
            <SkeletonCardLine className="h-[clamp(2.4rem,5vw,4rem)] w-[72%] max-w-[16rem]" />
          </div>

          <div className="mt-5 space-y-2">
            <SkeletonBar className="h-4 w-full max-w-[31rem]" />
            <SkeletonBar className="h-4 w-[82%] max-w-[24rem]" />
          </div>
        </div>
      </section>

      <section className="shell-narrow">
        <div className="front-list">
          <PostListItemSkeleton titleWidth="w-full max-w-[20rem]" excerptWidth="w-[88%]" />
          <PostListItemSkeleton titleWidth="w-[88%] max-w-[24rem]" excerptWidth="w-[84%]" />
          <PostListItemSkeleton titleWidth="w-[76%] max-w-[18rem]" excerptWidth="w-[78%]" />
          <PostListItemSkeleton titleWidth="w-[92%] max-w-[26rem]" excerptWidth="w-[81%]" />
          <PostListItemSkeleton titleWidth="w-[69%] max-w-[17rem]" excerptWidth="w-[75%]" />
        </div>
      </section>

      <section className="shell-narrow mt-8">
        <div className="front-rule pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonBar className="h-[2.9rem] w-28 rounded-full" />
            <SkeletonBar className="h-[2.9rem] w-32 rounded-full" />
          </div>
        </div>
      </section>
    </>
  );
}

export function PostDetailSkeleton() {
  return (
    <>
      <section className="shell-narrow">
        <div className="front-page-header front-rule">
          <SkeletonBar className="h-3 w-16" />

          <div className="mt-4 space-y-3">
            <SkeletonCardLine className="h-[clamp(2.4rem,5vw,4rem)] w-full max-w-[32rem]" />
            <SkeletonCardLine className="h-[clamp(2.4rem,5vw,4rem)] w-[84%] max-w-[27rem]" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <SkeletonBar className="h-4 w-14" />
            <SkeletonBar className="h-4 w-20" />
            <SkeletonBar className="h-4 w-[4.5rem]" />
          </div>

          <div className="mt-6 space-y-2">
            <SkeletonBar className="h-4 w-full max-w-[32rem]" />
            <SkeletonBar className="h-4 w-[84%] max-w-[25rem]" />
          </div>
        </div>
      </section>

      <div className="front-action-rail" aria-hidden="true">
        <span className="front-icon-button h-12 w-12 animate-pulse bg-base-content/10" />
        <span className="front-icon-button h-12 w-12 animate-pulse bg-base-content/10" />
        <span className="front-icon-button h-12 w-12 animate-pulse bg-base-content/10" />
      </div>

      <section className="shell-narrow">
        <div className="media-frame aspect-[16/9] animate-pulse bg-base-content/10" />
      </section>

      <section className="shell-narrow mt-8">
        <article className="post-content text-[1.02rem] leading-[1.85]">
          <ParagraphSkeleton widths={["w-full", "w-[94%]", "w-[87%]", "w-[76%]"]} />

          <div className="mt-12">
            <SkeletonCardLine className="h-[clamp(1.9rem,3vw,3rem)] w-full max-w-[18rem]" />
            <div className="mt-5">
              <ParagraphSkeleton
                widths={["w-full", "w-[96%]", "w-[88%]", "w-[82%]", "w-[74%]"]}
              />
            </div>
          </div>

          <div className="mt-12">
            <SkeletonCardLine className="h-[clamp(1.35rem,2vw,1.85rem)] w-full max-w-[12rem]" />
            <div className="mt-5">
              <ParagraphSkeleton widths={["w-full", "w-[91%]", "w-[79%]"]} />
            </div>
          </div>

          <div className="mt-12">
            <SkeletonCardLine className="h-32 w-full rounded-[1.5rem]" />
          </div>

          <div className="mt-12">
            <ParagraphSkeleton widths={["w-full", "w-[93%]", "w-[89%]", "w-[69%]"]} />
          </div>
        </article>

        <div className="front-rule mt-10 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonBar className="h-[2.9rem] w-28 rounded-full" />
            <SkeletonBar className="h-[2.9rem] w-28 rounded-full" />
            <SkeletonBar className="h-[2.9rem] w-24 rounded-full" />
          </div>
        </div>
      </section>

      <section className="shell-narrow mt-8 xl:hidden">
        <div className="front-card px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-4 w-20" />
          </div>

          <div className="mt-4 border-t border-[var(--line-soft)] pt-4">
            <div className="space-y-3">
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-[82%]" />
              <SkeletonBar className="h-4 w-[68%]" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
