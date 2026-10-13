"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Upload,
  Search,
  Users,
  Sparkles,
  Download,
  Shield,
  Trophy,
  ArrowRight,
  FileText,
  GraduationCap,
  Zap,
  Globe,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Uploads",
    description:
      "Just snap a photo of a question paper. Our AI extracts all details — university, subject, semester, and more — automatically.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find exactly what you need with advanced filters. Search by university, course, subject, semester, or exam type.",
  },
  {
    icon: Shield,
    title: "Verified Content",
    description:
      "Every upload goes through admin moderation. Duplicate detection ensures only unique, high-quality resources are shared.",
  },
  {
    icon: Trophy,
    title: "Contributor Rewards",
    description:
      "Earn reputation points for every approved upload. Climb the leaderboard and get recognized for your contributions.",
  },
  {
    icon: Download,
    title: "Instant Downloads",
    description:
      "Download PYQs, notes, assignments, lab files, and study materials instantly. No sign-up walls for browsing.",
  },
  {
    icon: Globe,
    title: "Multi-University",
    description:
      "Resources from universities across the country. Find materials specific to your institution and curriculum.",
  },
];

export default function HomePage() {
  const [dbStats, setDbStats] = useState({
    resources: 0,
    universities: 0,
    users: 0,
    downloads: 0,
  });

  useEffect(() => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDbStats({
            resources: res.data.resources,
            universities: res.data.universities,
            users: res.data.users,
            downloads: res.data.downloads,
          });
        }
      })
      .catch(console.error);
  }, []);

  const dynamicStats = [
    { value: dbStats.resources.toLocaleString(), label: "Resources", icon: FileText },
    { value: dbStats.universities.toLocaleString(), label: "Universities", icon: GraduationCap },
    { value: dbStats.users.toLocaleString(), label: "Students", icon: Users },
    { value: dbStats.downloads.toLocaleString(), label: "Downloads", icon: Download },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "HelpJuniors",
            url: "https://helpjuniors.com",
            logo: "https://helpjuniors.com/favicon.ico",
            description: "AI-Powered Student Resources platform for finding previous year question papers, notes, and study materials.",
            sameAs: [
              "https://twitter.com/helpjuniors",
              "https://github.com/helpjuniors",
            ],
          }),
        }}
      />
      
      <section className="border-b-2 border-foreground bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="max-w-4xl">

            <AnimatedContainer variant="fadeUp" delay={0.05}>
              <h1 className="text-4xl font-black uppercase tracking-tight text-foreground sm:text-6xl md:text-7xl leading-[1.05]">
                Your Academic Resources,{" "}
                <span className="bg-foreground text-background px-2 inline-block">
                  Powered by AI
                </span>
              </h1>
            </AnimatedContainer>

            <AnimatedContainer variant="fadeUp" delay={0.1}>
              <p className="mt-6 border-l-2 border-foreground pl-4 font-mono text-xs uppercase tracking-wide text-muted-foreground md:text-sm max-w-2xl leading-relaxed">
                Upload, discover, and download previous year question papers, notes,
                assignments, and study materials. Let AI do the heavy lifting.
              </p>
            </AnimatedContainer>

            <AnimatedContainer variant="fadeUp" delay={0.15}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ROUTES.resources}
                  className="group inline-flex items-center justify-center gap-2 border-2 border-foreground bg-foreground px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-background transition-all hover:bg-background hover:text-foreground shadow-[4px_4px_0px_0px_currentColor]"
                >
                  Browse Resources
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={ROUTES.about}
                  className="inline-flex items-center justify-center border-2 border-foreground bg-background px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Learn More
                </Link>
              </div>
            </AnimatedContainer>
          </div>
        </div>

        <div className="border-t-2 border-foreground bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-foreground border-x-0 md:border-x-2 border-foreground">
              {dynamicStats.map((stat) => (
                <div key={stat.label} className="p-6 md:p-8 flex flex-col justify-between transition-colors hover:bg-muted/40">
                  <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>{stat.label}</span>
                    <stat.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <p className="mt-4 font-mono text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
           
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Everything You Need to{" "}
              <span className="underline decoration-4 underline-offset-4">
                Ace Your Exams
              </span>
            </h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-wide text-muted-foreground md:text-sm">
              A complete platform designed for students, by students. Every feature built
              to make your academic life easier.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col justify-between border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor]"
              >
                <div>
                  <div className="mb-4 inline-flex border-2 border-foreground bg-foreground p-2.5 text-background">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight">{feature.title}</h3>
                  <p className="mt-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground py-16 md:py-24 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-wide text-muted-foreground md:text-sm">
              Three simple steps to get started with HelpJuniors
            </p>
          </div>

          <div className="grid border-2 border-foreground bg-background md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-foreground">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload or Snap",
                description:
                  "Upload a document or take a photo of a question paper. Our AI handles the rest.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "AI Extracts Details",
                description:
                  "Gemini AI automatically identifies the university, subject, semester, year, and more.",
              },
              {
                step: "03",
                icon: BookOpen,
                title: "Share & Discover",
                description:
                  "Your resource goes live after moderation. Browse thousands of resources from other students.",
              },
            ].map((item) => (
              <div key={item.step} className="p-8 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-4xl md:text-5xl font-black tracking-tighter text-foreground/20">
                    {item.step}
                  </div>
                  <div className="my-6 inline-flex border-2 border-foreground bg-muted p-3 text-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight">{item.title}</h3>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-2 border-foreground bg-foreground p-8 text-center text-background shadow-[8px_8px_0px_0px_currentColor] md:p-14">
            <h2 className="text-3xl font-black uppercase tracking-tight text-background sm:text-4xl md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-mono text-xs uppercase tracking-wide text-background/80 md:text-sm">
              Join thousands of students already sharing and discovering academic
              resources. It&apos;s free, fast, and AI-powered.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.register}
                className="group inline-flex items-center gap-2 border-2 border-background bg-background px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:bg-transparent hover:text-background"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={ROUTES.resources}
                className="inline-flex items-center border-2 border-background bg-transparent px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Browse Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
