"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { PostHeading } from "@/lib/post-content";

type PostDetailRailProps = {
  headings: PostHeading[];
  readingTime: number;
  wordCount: number;
  slug: string;
};

type RailSectionsProps = PostDetailRailProps & {
  activeHeadingId?: string | null;
  compact?: boolean;
  onNavigate?: () => void;
  showTitle?: boolean;
};

function RailSections({
  activeHeadingId,
  headings,
  readingTime,
  wordCount,
  slug,
  compact = false,
  onNavigate,
  showTitle = true,
}: RailSectionsProps) {
  const title = headings.length > 0 ? "On this page" : "Article details";
  const itemClass = compact ? "text-sm" : "text-[0.92rem]";

  return (
    <>
      {showTitle ? <p className="front-kicker">{title}</p> : null}

      {headings.length > 0 ? (
        <nav className={showTitle ? "mt-4" : ""}>
          <ol className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={onNavigate}
                  className={`block py-2 text-base-content/62 transition hover:text-base-content ${
                    activeHeadingId === heading.id ? "text-base-content" : ""
                  } ${itemClass} ${heading.level === 3 ? "pl-4" : ""}`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div
        className={`${showTitle || headings.length > 0 ? "mt-6" : ""} border-t border-[var(--line-soft)] pt-5`}
      >
        <div className="space-y-4 text-sm text-base-content/65">
          <p>{readingTime} min read</p>
          <p>{wordCount} words</p>
          <p className="break-all">/posts/{slug}</p>
        </div>
        <div className="mt-6 flex flex-col items-start gap-2">
          <Link href="/posts" onClick={onNavigate} className="front-link">
            All posts
          </Link>
          <Link href="/contact" onClick={onNavigate} className="front-link">
            Contact
          </Link>
        </div>
      </div>
    </>
  );
}

export default function PostDetailRail(props: PostDetailRailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(
    props.headings[0]?.id ?? null,
  );

  useEffect(() => {
    if (props.headings.length === 0 || typeof window === "undefined") {
      return;
    }

    const headingElements = props.headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (headingElements.length === 0) {
      return;
    }

    const updateActiveHeading = () => {
      const offset = window.innerWidth >= 1280 ? 150 : 128;
      let nextActiveHeadingId = headingElements[0].id;

      for (const element of headingElements) {
        if (element.getBoundingClientRect().top - offset <= 0) {
          nextActiveHeadingId = element.id;
          continue;
        }

        break;
      }

      setActiveHeadingId((current) =>
        current === nextActiveHeadingId ? current : nextActiveHeadingId,
      );
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [props.headings]);

  const activeHeading = useMemo(
    () => props.headings.find((heading) => heading.id === activeHeadingId) ?? null,
    [activeHeadingId, props.headings],
  );

  const summaryLabel = activeHeading
    ? activeHeading.text
    : props.headings.length > 0
      ? `${props.headings.length} sections`
      : `${props.readingTime} min`;

  return (
    <div className="xl:hidden">
      <div className="front-card sticky top-[calc(var(--header-height)+0.25rem)] px-5 py-4">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="post-detail-mobile-rail"
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="micro-label">
            {props.headings.length > 0 ? "On this page" : "Article details"}
          </span>
          <span className="truncate text-sm text-base-content/58">
            {isOpen ? "Close" : summaryLabel}
          </span>
        </button>

        {isOpen ? (
          <div
            id="post-detail-mobile-rail"
            className="mt-4 max-h-[min(52svh,26rem)] overflow-y-auto border-t border-[var(--line-soft)] pt-4"
          >
            <RailSections
              {...props}
              activeHeadingId={activeHeadingId}
              compact
              showTitle={false}
              onNavigate={() => setIsOpen(false)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
