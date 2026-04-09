"use client";

import type { ChangeEventHandler, FormEventHandler } from "react";

import type { ProjectFormState } from "./types";
import {
  adminFileInputClass,
  adminInputClass,
  adminKickerClass,
  adminPanelMutedClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
} from "./ui";

type ProjectComposerProps = {
  isEditingProject: boolean;
  projectForm: ProjectFormState;
  projectExistingImages: string[];
  projectInputKey: number;
  isSubmittingProject: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  onTitleChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onPrimaryImageChange: ChangeEventHandler<HTMLInputElement>;
  onSecondaryImageChange: ChangeEventHandler<HTMLInputElement>;
};

export default function ProjectComposer({
  isEditingProject,
  projectForm,
  projectExistingImages,
  projectInputKey,
  isSubmittingProject,
  onSubmit,
  onCancel,
  onTitleChange,
  onLinkChange,
  onDescriptionChange,
  onTagsChange,
  onPrimaryImageChange,
  onSecondaryImageChange,
}: ProjectComposerProps) {
  return (
    <form onSubmit={onSubmit} className="admin-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 px-6 py-4 md:px-8">
        <div className="flex items-center gap-3 text-sm text-white/44">
          <span>Projects</span>
          <span>/</span>
          <span>{isEditingProject ? "Editing" : "New"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={adminSecondaryButtonClass}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmittingProject}
            className={adminPrimaryButtonClass}
          >
            {isSubmittingProject
              ? "Saving"
              : isEditingProject
                ? "Update project"
                : "Save project"}
          </button>
        </div>
      </div>

      <div className="px-6 py-7 md:px-8 md:py-8">
        <label className="block">
          <input
            type="text"
            value={projectForm.title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="w-full border-0 bg-transparent px-0 py-0 text-[clamp(2.5rem,5vw,4rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-white outline-none placeholder:text-white/14"
            placeholder="Project title"
            required
          />
        </label>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_24rem]">
          <div className="space-y-6">
            <label className="block">
              <span className={adminKickerClass}>Description</span>
              <textarea
                value={projectForm.description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                className={`${adminTextareaClass} mt-3 min-h-40`}
                placeholder="Write a concise summary of the project, what shipped, and why it mattered."
                required
              />
            </label>

            <label className="block">
              <span className={adminKickerClass}>External link</span>
              <input
                type="text"
                value={projectForm.link}
                onChange={(event) => onLinkChange(event.target.value)}
                className={`${adminInputClass} mt-3`}
                placeholder="https://example.com"
              />
            </label>

            <label className="block">
              <span className={adminKickerClass}>Tags</span>
              <input
                type="text"
                value={projectForm.tags}
                onChange={(event) => onTagsChange(event.target.value)}
                className={`${adminInputClass} mt-3`}
                placeholder="Design, Development, CMS"
                required
              />
            </label>
          </div>

          <div className="space-y-5">
            <div className={`${adminPanelMutedClass} p-5`}>
              <p className={adminKickerClass}>Primary image</p>
              <input
                key={`primary-${projectInputKey}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onPrimaryImageChange}
                className={`${adminFileInputClass} mt-4`}
                required={!isEditingProject}
              />
              <p className="mt-3 text-sm text-white/42">
                {projectForm.primaryImageFile?.name ||
                  (projectExistingImages[0]
                    ? "Keeping current image"
                    : "No file selected")}
              </p>
            </div>

            <div className={`${adminPanelMutedClass} p-5`}>
              <p className={adminKickerClass}>Secondary image</p>
              <input
                key={`secondary-${projectInputKey}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onSecondaryImageChange}
                className={`${adminFileInputClass} mt-4`}
              />
              <p className="mt-3 text-sm text-white/42">
                {projectForm.secondaryImageFile?.name ||
                  (projectExistingImages[1]
                    ? "Keeping current image"
                    : "Optional second image")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
