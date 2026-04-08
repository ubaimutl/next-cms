"use client";

import { useMemo, useState } from "react";

import {
  contactBudgetOptions,
  contactServiceOptions,
  contactSubmissionSchema,
  contactTimelineOptions,
  normalizeWebsiteInput,
} from "@/lib/contact";
import { siteConfig } from "@/lib/site";

type SubmissionStatus = "sent" | "saved" | "error" | null;
type FormStep = 1 | 2 | 3 | 4;

type ContactFields = {
  name: string;
  email: string;
  company: string;
  website: string;
  budget: string;
  timeline: string;
  message: string;
  honeypot: string;
};

type FieldName =
  | "services"
  | "name"
  | "email"
  | "company"
  | "website"
  | "budget"
  | "timeline"
  | "message";

type ErrorMap = Partial<Record<FieldName, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const flowLabels = ["Topic", "Contact", "Message"] as const;

const initialFormData: ContactFields = {
  name: "",
  email: "",
  company: "",
  website: "",
  budget: "",
  timeline: "",
  message: "",
  honeypot: "",
};

const initialCheckedItems = Object.fromEntries(
  contactServiceOptions.map((option) => [option, false]),
) as Record<(typeof contactServiceOptions)[number], boolean>;

function getFirstError(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getInputClass(error?: string) {
  return `front-field ${error ? "border-error" : ""}`;
}

function getTextareaClass(error?: string) {
  return `front-textarea ${error ? "border-error" : ""}`;
}

function getSelectClass(error?: string) {
  return `front-select ${error ? "border-error" : ""}`;
}

export default function ContactForm() {
  const [step, setStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<ContactFields>(initialFormData);
  const [checkedItems, setCheckedItems] = useState(initialCheckedItems);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(null);

  const selectedServices = useMemo(
    () => contactServiceOptions.filter((feature) => checkedItems[feature]),
    [checkedItems],
  );

  const currentStep = step === 4 ? 3 : step;
  const canContinueFromStepOne = selectedServices.length > 0;
  const isEmailValid = emailPattern.test(formData.email.trim());
  const isWebsiteValid =
    !formData.website.trim() ||
    URL.canParse(normalizeWebsiteInput(formData.website.trim()));
  const canContinueFromStepTwo =
    formData.name.trim().length >= 2 && isEmailValid && isWebsiteValid;
  const canSubmit = formData.message.trim().length >= 20 && !isSubmitting;

  function setFieldError(field: FieldName, message?: string) {
    setErrors((current) => ({
      ...current,
      [field]: message,
    }));
  }

  function handleCheckboxChange(
    feature: (typeof contactServiceOptions)[number],
  ) {
    setCheckedItems((current) => ({
      ...current,
      [feature]: !current[feature],
    }));

    setFieldError("services", undefined);
  }

  function onChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldError(name as FieldName, undefined);
  }

  function validateStepOne() {
    if (selectedServices.length === 0) {
      setErrors({ services: "Select at least one topic." });
      return false;
    }

    setErrors({});
    return true;
  }

  function validateStepTwo() {
    const nextErrors: ErrorMap = {};

    if (formData.name.trim().length < 2) {
      nextErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (
      formData.website.trim() &&
      !URL.canParse(normalizeWebsiteInput(formData.website.trim()))
    ) {
      nextErrors.website = "Enter a valid website.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateStepThree() {
    const nextErrors: ErrorMap = {};

    if (formData.message.trim().length < 20) {
      nextErrors.message = "Tell me a bit more about your message.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function onNext() {
    if (step === 1 && validateStepOne()) {
      setStep(2);
      return;
    }

    if (step === 2 && validateStepTwo()) {
      setStep(3);
    }
  }

  function onBack() {
    if (step > 1 && step < 4) {
      setErrors({});
      setStep((current) => (current - 1) as FormStep);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < 3) {
      onNext();
      return;
    }

    if (!validateStepThree()) {
      return;
    }

    const payload = {
      ...formData,
      services: selectedServices,
      budget: formData.budget || undefined,
      timeline: formData.timeline || undefined,
    };

    const validation = contactSubmissionSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      setErrors({
        services: getFirstError(fieldErrors.services),
        name: getFirstError(fieldErrors.name),
        email: getFirstError(fieldErrors.email),
        company: getFirstError(fieldErrors.company),
        website: getFirstError(fieldErrors.website),
        budget: getFirstError(fieldErrors.budget),
        timeline: getFirstError(fieldErrors.timeline),
        message: getFirstError(fieldErrors.message),
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json()) as
        | {
            status?: "sent" | "saved" | "ignored";
            message?: string;
            error?: string;
            details?: Partial<Record<FieldName, string[]>>;
          }
        | undefined;

      if (response.status === 400 && responseBody?.details) {
        setErrors({
          services: getFirstError(responseBody.details.services),
          name: getFirstError(responseBody.details.name),
          email: getFirstError(responseBody.details.email),
          company: getFirstError(responseBody.details.company),
          website: getFirstError(responseBody.details.website),
          budget: getFirstError(responseBody.details.budget),
          timeline: getFirstError(responseBody.details.timeline),
          message: getFirstError(responseBody.details.message),
        });
        return;
      }

      if (!response.ok && response.status !== 202) {
        throw new Error(responseBody?.error || "Failed to send message.");
      }

      setSubmissionStatus(responseBody?.status === "saved" ? "saved" : "sent");
      setStep(4);
    } catch {
      setSubmissionStatus("error");
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="shell mt-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <div className="front-card px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 border-b border-[var(--line-soft)] pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="front-kicker">Guided intake</p>
                <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.94] tracking-[-0.04em]">
                  Share your message in three steps.
                </h2>
                <p className="mt-3 max-w-2xl text-[1.03rem] leading-[1.72] text-base-content/72">
                  Keep it simple. Choose the main topic, add your details, then
                  write what you need in plain language.
                </p>
              </div>
              <div className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-transparent px-[0.8rem] py-[0.35rem] text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-base-content/66">
                Step {currentStep} / 3
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {flowLabels.map((label, index) => {
                const isActive = currentStep >= index + 1;

                return (
                  <div
                    key={label}
                    className={`rounded-[1rem] border px-4 py-4 transition ${
                      isActive
                        ? "border-[var(--line-strong)] bg-[var(--surface-card)] text-base-content"
                        : "border-[var(--line-soft)] bg-transparent text-base-content/52"
                    }`}
                  >
                    <p className="front-kicker !text-[0.68rem]">
                      0{index + 1}
                    </p>
                    <p className="mt-2 text-sm font-medium text-base-content/80">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <form id="contact-form" onSubmit={onSubmit} className="mt-6">
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={onChange}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            {step === 1 ? (
              <div>
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="front-kicker">Choose a topic</p>
                    <p className="mt-2 max-w-2xl text-[1.03rem] leading-[1.72] text-base-content/72">
                      Select the type of message this is so the reply can start
                      in the right place.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-transparent px-[0.8rem] py-[0.35rem] text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-base-content/66">
                    {selectedServices.length} selected
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {contactServiceOptions.map((feature) => {
                    const isSelected = checkedItems[feature];

                    return (
                      <label
                        key={feature}
                        className={`cursor-pointer rounded-[1rem] border p-5 transition ${
                          isSelected
                            ? "border-[var(--line-strong)] bg-[var(--surface-card)]"
                            : "border-[var(--line-soft)] bg-transparent hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(feature)}
                        />
                        <span className="front-kicker !text-[0.68rem]">
                          Topic
                        </span>
                        <div className="mt-4 flex items-start justify-between gap-4">
                          <span className="text-lg leading-tight tracking-[-0.02em] text-base-content/92">
                            {feature}
                          </span>
                          <span
                            className={`mt-0.5 h-5 w-5 rounded-full border transition ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-[var(--line-strong)] bg-transparent"
                            }`}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>

                {errors.services ? (
                  <p className="mt-4 text-sm text-error">{errors.services}</p>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <div>
                  <p className="front-kicker">Share contact details</p>
                  <p className="mt-2 max-w-2xl text-[1.03rem] leading-[1.72] text-base-content/72">
                    Enough context to reply clearly and follow up without extra back-and-forth.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="micro-label">Name</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      placeholder="Your name"
                      className={getInputClass(errors.name)}
                    />
                    {errors.name ? (
                      <span className="text-sm text-error">{errors.name}</span>
                    ) : null}
                  </label>

                  <label className="grid gap-2">
                    <span className="micro-label">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                      placeholder="you@example.com"
                      className={getInputClass(errors.email)}
                    />
                    {errors.email ? (
                      <span className="text-sm text-error">{errors.email}</span>
                    ) : null}
                  </label>

                  <label className="grid gap-2">
                    <span className="micro-label">Company or organization</span>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={onChange}
                      placeholder="Optional"
                      className={getInputClass(errors.company)}
                    />
                    {errors.company ? (
                      <span className="text-sm text-error">{errors.company}</span>
                    ) : null}
                  </label>

                  <label className="grid gap-2">
                    <span className="micro-label">Website</span>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={onChange}
                      placeholder="https://"
                      className={getInputClass(errors.website)}
                    />
                    {errors.website ? (
                      <span className="text-sm text-error">{errors.website}</span>
                    ) : null}
                  </label>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <div>
                  <p className="front-kicker">Add optional context</p>
                  <p className="mt-2 max-w-2xl text-[1.03rem] leading-[1.72] text-base-content/72">
                    Budget and timing are optional. The main thing is a clear
                    message with enough context to answer well.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="micro-label">Budget, if relevant</span>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={onChange}
                      className={getSelectClass(errors.budget)}
                    >
                      <option value="">Select budget</option>
                      {contactBudgetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.budget ? (
                      <span className="text-sm text-error">{errors.budget}</span>
                    ) : null}
                  </label>

                  <label className="grid gap-2">
                    <span className="micro-label">Timing, if relevant</span>
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={onChange}
                      className={getSelectClass(errors.timeline)}
                    >
                      <option value="">Select timing</option>
                      {contactTimelineOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.timeline ? (
                      <span className="text-sm text-error">{errors.timeline}</span>
                    ) : null}
                  </label>
                </div>

                <label className="mt-6 grid gap-2">
                  <span className="micro-label">Message</span>
                  <textarea
                    id="message"
                    name="message"
                    rows={7}
                    value={formData.message}
                    onChange={onChange}
                    placeholder="What are you reaching out about, what context matters, and what kind of reply would be most useful?"
                    className={getTextareaClass(errors.message)}
                  />
                  {errors.message ? (
                    <span className="text-sm text-error">{errors.message}</span>
                  ) : null}
                </label>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-5">
                {submissionStatus === "sent" ? (
                  <div className="front-status border-success/25 bg-success/10 text-success-content dark:text-success">
                    <span>
                      Message sent. I&apos;ll review it and reply to{" "}
                      <strong>{formData.email}</strong>.
                    </span>
                  </div>
                ) : null}

                {submissionStatus === "saved" ? (
                  <div className="front-status border-warning/25 bg-warning/10 text-warning-content dark:text-warning">
                    <span>
                      Your message was saved, but email delivery needs attention
                      on the server. If timing is tight, write directly to{" "}
                      <a href={`mailto:${siteConfig.email}`} className="underline">
                        {siteConfig.email}
                      </a>
                      .
                    </span>
                  </div>
                ) : null}

                {submissionStatus === "error" ? (
                  <div className="front-status border-error/25 bg-error/10 text-error-content dark:text-error">
                    <span>
                      Submission failed. Please email{" "}
                      <a href={`mailto:${siteConfig.email}`} className="underline">
                        {siteConfig.email}
                      </a>{" "}
                      directly.
                    </span>
                  </div>
                ) : null}

                <div className="rounded-[1.25rem] border border-[var(--line-soft)] bg-[var(--surface-soft)] p-5">
                  <p className="front-kicker">Topics selected</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-transparent px-[0.8rem] py-[0.35rem] text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-base-content/66"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step < 4 ? (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-soft)] pt-6">
                <div className="text-[0.9rem] leading-[1.6] text-base-content/62 text-sm">
                  {step === 1
                    ? "Choose the main topic."
                    : step === 2
                      ? "Add the contact details."
                      : "Write the message and send it."}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={onBack}
                      className="front-button-subtle"
                    >
                      Back
                    </button>
                  ) : null}

                  <button
                    type={step === 3 ? "submit" : "button"}
                    onClick={step === 3 ? undefined : onNext}
                    disabled={
                      step === 1
                        ? !canContinueFromStepOne
                        : step === 2
                          ? !canContinueFromStepTwo
                          : !canSubmit
                    }
                    className="front-button px-6"
                  >
                    {step === 3
                      ? isSubmitting
                        ? "Sending..."
                        : "Send message"
                      : "Continue"}
                  </button>
                </div>
              </div>
            ) : null}
          </form>
        </div>

        <aside className="front-card px-6 py-6 xl:sticky xl:top-28">
          <p className="front-kicker">Review panel</p>
          <div className="mt-4 space-y-5">
            <div>
              <p className="front-kicker">Selected topics</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedServices.length > 0 ? (
                  selectedServices.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-transparent px-[0.8rem] py-[0.35rem] text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-base-content/66"
                    >
                      {service}
                    </span>
                  ))
                ) : (
                  <span className="text-[0.9rem] leading-[1.6] text-base-content/62 text-sm">
                    Nothing selected yet.
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="front-kicker">Reply target</p>
              <p className="mt-3 text-[0.9rem] leading-[1.6] text-base-content/62 text-sm">
                {formData.email.trim() || "Your email goes here once you add it."}
              </p>
            </div>

            <div>
              <p className="front-kicker">Direct line</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="front-link mt-3 break-all text-sm"
              >
                {siteConfig.email}
              </a>
            </div>

            <div>
              <p className="front-kicker">Expectation</p>
              <p className="mt-3 text-[0.9rem] leading-[1.6] text-base-content/62 text-sm">
                A clear message gets a better reply. Include the context,
                desired outcome, and anything that would help shape the answer.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
