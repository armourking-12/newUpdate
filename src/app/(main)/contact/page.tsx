import type { Metadata } from "next";
import { Mail, Clock, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the HelpJuniors team. We'd love to hear from you — feedback, questions, or partnership inquiries.",
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    value: "vm9678974@gmail.com",
  },
  {
    icon: MessageSquare,
    title: "Community",
    description: "Join our student community",
    value: "Discord Server",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We typically respond within",
    value: "24 hours",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Contact Us"
            description="Have a question, feedback, or partnership inquiry? We'd love to hear from you."
          />
        </div>
      </section>

      <section className="pb-16 pt-8 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <AnimatedContainer variant="stagger">
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <AnimatedItem key={info.title}>
                      <div className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor]">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-foreground bg-foreground text-background">
                            <info.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm uppercase tracking-tight">{info.title}</h3>
                            <p className="font-mono text-xs text-muted-foreground mt-0.5">
                              {info.description}
                            </p>
                            <p className="mt-1 font-mono text-xs font-bold text-foreground">
                              {info.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </div>
              </AnimatedContainer>
            </div>

            <div className="lg:col-span-3">
              <AnimatedContainer variant="fadeUp">
                <ContactForm />
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
