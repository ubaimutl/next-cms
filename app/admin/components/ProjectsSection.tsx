"use client";

import type { AdminProject } from "./types";
import { adminPillClass, adminTableHeadClass } from "./ui";

type ProjectsSectionProps = {
  projects: AdminProject[];
  isDeletingProjectId: number | null;
  onEdit: (project: AdminProject) => void;
  onDelete: (project: AdminProject) => void;
};

export default function ProjectsSection({
  projects,
  isDeletingProjectId,
  onEdit,
  onDelete,
}: ProjectsSectionProps) {
  return (
    <section className="admin-panel overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[60rem]">
          <div className="grid grid-cols-[minmax(0,1.9fr)_12rem_7rem_11rem_8rem] gap-4 border-b border-white/6 px-6 py-4 md:px-8">
            <span className={adminTableHeadClass}>Project</span>
            <span className={adminTableHeadClass}>Tags</span>
            <span className={`${adminTableHeadClass} text-center`}>Assets</span>
            <span className={adminTableHeadClass}>Link</span>
            <span className={`${adminTableHeadClass} text-right`}>Actions</span>
          </div>

        {projects.length === 0 ? (
            <div className="px-6 py-8 text-sm text-white/46 md:px-8">
              No projects yet.
            </div>
        ) : (
          projects.map((project) => (
              <div
                key={project.id}
                className="grid grid-cols-[minmax(0,1.9fr)_12rem_7rem_11rem_8rem] gap-4 border-b border-white/6 px-6 py-5 last:border-b-0 md:px-8"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-[1rem] font-semibold text-white/94">
                    {project.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 max-w-3xl text-[0.92rem] leading-relaxed text-white/42">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap content-start gap-2">
                  {project.tags.length > 0 ? (
                    project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={adminPillClass("neutral")}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white/34">No tags</span>
                  )}
                </div>

                <div className="flex items-center justify-center text-sm text-white/54">
                  {project.images.length}
                </div>

                <div className="flex items-center">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="truncate text-sm text-white/58 transition hover:text-white"
                    >
                      Preview
                    </a>
                  ) : (
                    <span className="text-sm text-white/34">No link</span>
                  )}
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(project)}
                    className="text-sm text-white/68 transition hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(project)}
                    disabled={isDeletingProjectId === project.id}
                    className="text-sm text-[#ff8f8f] transition hover:text-[#ffb1b1] disabled:opacity-45"
                  >
                    {isDeletingProjectId === project.id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </div>
          ))
        )}
        </div>
      </div>
    </section>
  );
}
