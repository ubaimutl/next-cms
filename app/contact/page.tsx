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
        <div className="front-rule py-[clamp(3rem,6vw,5.5rem)] lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-sm">
            <p className="front-kicker">Contact</p>
            <h1 className="mt-4 text-[clamp(2rem,4vw,3.8rem)] leading-[0.94] font-medium tracking-[-0.045em]">
              Start with the context that matters.
            </h1>
          </div>

          <div className="mt-6 max-w-3xl lg:mt-0">
            <p className="max-w-[42rem] text-[1.03rem] leading-[1.72] text-base-content/72">
              Share the scope, timing, and what you need built. The form below
              is still a guided intake, but the layout is quieter and simpler.
            </p>
            <p className="mt-5 text-[0.9rem] leading-[1.6] text-base-content/62">
              {siteConfig.email}
            </p>
          </div>
        </div>
      </section>

      <ContactForm />
      <Footer />
    </>
  );
}
