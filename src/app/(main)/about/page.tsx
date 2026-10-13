import type { Metadata } from "next";
import {
  Target,
  Heart,
  Lightbulb,
  Users,
  Shield,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME} — the AI-powered platform helping students share and discover academic resources.`,
};

const values = [
  {
    icon: Heart,
    title: "Student-First",
    description:
      "Everything we build is designed with students in mind. Free access, easy uploads, and no unnecessary barriers.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description:
      "Every upload is moderated to maintain high-quality content. Duplicate detection ensures unique resources only.",
  },
  {
    icon: Sparkles,
    title: "AI Innovation",
    description:
      "We leverage Gemini AI to make uploading effortless. Just snap a photo and let AI fill in all the details.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Built by students, for students. The platform thrives on community contributions and collaboration.",
  },
  {
    icon: Lightbulb,
    title: "Open Knowledge",
    description:
      "We believe knowledge should be accessible to everyone. Our platform makes academic resources available to all.",
  },
  {
    icon: Target,
    title: "Exam Success",
    description:
      "Our mission is to help every student succeed. PYQs, notes, and study materials — all in one place.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="About HelpJuniors"
            description="We're on a mission to democratize academic resources for students everywhere. No more hunting for study materials — we bring them to you."
          />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp" className="mx-auto max-w-3xl">
            <div className="border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_currentColor]">
              <div className="mb-4 inline-flex items-center gap-2 border border-foreground bg-muted px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                Our Story
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
                Born from a Student&apos;s Frustration
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                <p>
                  It started during exam season. We spent hours searching WhatsApp groups,
                  Google Drive links, and random websites for previous year question papers.
                  Half the links were broken. The other half were for different universities.
                </p>
                <p>
                  We thought: what if there was a single platform where students could
                  upload and find all their academic resources? And what if AI could make
                  the upload process so easy that anyone could contribute?
                </p>
                <p>
                  That&apos;s how <strong>HelpJuniors</strong> was born — a platform where
                  students help other students by sharing PYQs, notes, assignments, lab
                  files, and study materials, all organized and searchable.
                </p>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      <section className="border-t-2 border-foreground bg-muted/20 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp" className="text-center">
            <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Our Values</h2>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              The principles that guide everything we build
            </p>
          </AnimatedContainer>

          <AnimatedContainer variant="stagger" className="mt-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => (
                <AnimatedItem key={value.title}>
                  <div className="border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor] h-full flex flex-col justify-between">
                    <div>
                      <div className="mb-4 inline-flex border border-foreground bg-foreground p-2 text-background">
                        <value.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black uppercase tracking-tight">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
