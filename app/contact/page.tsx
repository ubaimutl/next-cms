import type { Metadata } from "next";

import ContactForm from "../components/contact/ContactForm";
import Footer from "../components/layout/Footer";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} and start planning your next project.`,
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="shell">
        <div className="front-page-header front-rule lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-sm">
            <p className="front-kicker">Contact</p>
            <h1 className="front-section-title mt-4">
              Start with the context that matters.
            </h1>
          </div>

          <div className="mt-6 max-w-3xl lg:mt-0">
            <p className="front-copy">
              Share the scope, timing, and what you need built. The form below
              is still a guided intake, but the layout is quieter and simpler.
            </p>
            <p className="front-meta mt-5">{siteConfig.email}</p>
          </div>
        </div>
      </section>

      <ContactForm />
      <Footer />
    </>
  );
}
