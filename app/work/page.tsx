import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "../components/layout/Footer";

import { normalizeProjectRecord } from "@/lib/db-json";
import { shouldBypassImageOptimization } from "@/lib/image";
import prisma from "@/lib/prisma";
import { getPublicModuleSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

type ProjectPreview = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  link: string | null;
};

export const metadata: Metadata = {
  title: "Projects",
  description: `${siteConfig.name} project archive and selected case studies.`,
  alternates: {
    canonical: "/work",
  },
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const settings = await getPublicModuleSettings();

  if (!settings.projectsEnabled) {
    notFound();
  }

  const projects = await prisma.project.findMany({
    orderBy: { id: "desc" },
  });
  const items = projects.map(normalizeProjectRecord) as ProjectPreview[];
  const featuredProject = items[0] ?? null;
  const secondaryProjects = items.slice(1);

  return (
    <>
      <section className="shell">
        <div className="front-page-header front-rule lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-sm">
            <p className="front-kicker">Work</p>
            <h1 className="front-section-title mt-4">Selected projects and case studies.</h1>
          </div>

          <div className="mt-6 max-w-3xl lg:mt-0">
            <p className="front-copy">
              A showcase-led layout with larger media, shorter copy blocks, and
              more emphasis on finished work than on archive structure.
            </p>
            <Link href="/contact" className="front-link mt-6">
              Start a project
            </Link>
          </div>
        </div>
      </section>

      <section className="shell">
        {featuredProject ? (
          <article className="front-card overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,24rem)]">
            {featuredProject.images[0] ? (
              <div className="media-frame aspect-[16/10] rounded-none lg:aspect-auto">
                <Image
                  src={featuredProject.images[0]}
                  alt={featuredProject.title}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  unoptimized={shouldBypassImageOptimization(featuredProject.images[0])}
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="p-6 md:p-8">
              <p className="front-kicker">Featured project</p>
              <h2 className="mt-4 text-[clamp(2rem,3vw,3.1rem)] leading-[0.96] font-medium tracking-[-0.05em]">
                {featuredProject.title}
              </h2>
              <p className="front-meta mt-4">{featuredProject.description}</p>

              {featuredProject.tags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {featuredProject.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="front-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {featuredProject.link ? (
                <a
                  href={featuredProject.link}
                  target="_blank"
                  rel="noreferrer"
                  className="front-link mt-6"
                >
                  Open project
                </a>
              ) : null}
            </div>
          </article>
        ) : (
          <div className="front-card p-6 md:p-8">
            <p className="front-kicker">No projects published</p>
            <p className="front-copy mt-4">
              Add projects in admin and they will appear here automatically.
            </p>
          </div>
        )}
      </section>

      {secondaryProjects.length > 0 ? (
        <section className="shell mt-6">
          <div className="grid gap-5 md:grid-cols-2">
            {secondaryProjects.map((project, index) => (
              <article
                key={project.id}
                className={`front-card overflow-hidden ${index % 3 === 0 ? "md:translate-y-6" : ""}`}
              >
                {project.images[0] ? (
                  <div className="media-frame aspect-[4/3] rounded-none">
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      sizes="(max-width: 767px) 100vw, 50vw"
                      unoptimized={shouldBypassImageOptimization(project.images[0])}
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <div className="p-6">
                  <h3 className="text-[1.45rem] leading-tight font-medium tracking-[-0.04em]">
                    {project.title}
                  </h3>
                  <p className="front-meta mt-3">{project.description}</p>
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="front-link mt-5"
                    >
                      Open project
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <Footer />
    </>
  );
}
