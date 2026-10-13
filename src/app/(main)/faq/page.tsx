"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is HelpJuniors?",
        a: "HelpJuniors is an AI-powered student resource sharing platform where students can upload, discover, and download previous year question papers (PYQs), notes, assignments, lab files, practical files, and study materials from universities across India.",
      },
      {
        q: "Is HelpJuniors free to use?",
        a: "Yes! HelpJuniors is completely free for all students. You can browse and download resources without any cost. We believe knowledge should be accessible to everyone.",
      },
      {
        q: "Do I need an account to download resources?",
        a: "You can browse resources without an account, but you'll need to create a free account to download files, upload resources, and earn reputation points.",
      },
    ],
  },
  {
    category: "Uploads",
    questions: [
      {
        q: "How does the AI-powered upload work?",
        a: "When you upload an image of a question paper or document, our Gemini AI analyzes it and automatically extracts details like university name, course, semester, subject, year, exam type, and more. You can review and edit these before submitting.",
      },
      {
        q: "What file types can I upload?",
        a: "We support PDF, DOCX, PPTX, JPEG, PNG, and WebP files. The maximum file size is 25 MB per upload.",
      },
      {
        q: "How long does moderation take?",
        a: "Our admin team reviews uploads within 24-48 hours. You'll receive a notification once your upload is approved or if any changes are needed.",
      },
    ],
  },
  {
    category: "Account & Reputation",
    questions: [
      {
        q: "How does the reputation system work?",
        a: "You earn reputation points when your uploads are approved and downloaded by other students. The more quality resources you contribute, the higher your reputation. Top contributors are featured on our leaderboard.",
      },
      {
        q: "Can I edit or delete my uploads?",
        a: "Yes, you can manage all your uploads from your dashboard. You can edit details or request deletion of any resource you've uploaded.",
      },
    ],
  },
  {
    category: "Content Quality",
    questions: [
      {
        q: "How do you ensure content quality?",
        a: "Every upload goes through admin moderation before becoming publicly available. We also use SHA-256 hash-based duplicate detection to prevent duplicate uploads and maintain uniqueness.",
      },
      {
        q: "What happens if someone uploads copyrighted content?",
        a: "We have a reporting system for copyright violations. If copyrighted content is identified, it will be removed immediately. We encourage students to only upload content they have the right to share.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b-2 border-foreground last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-sm uppercase tracking-tight transition-colors hover:bg-muted"
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-foreground transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden bg-muted/30"
          >
            <p className="px-5 pb-5 pt-2 text-sm leading-relaxed text-muted-foreground border-t border-border">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Frequently Asked Questions"
            description="Everything you need to know about HelpJuniors. Can't find an answer? Contact us."
          />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.flatMap(section => 
              section.questions.map(q => ({
                "@type": "Question",
                name: q.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: q.a,
                },
              }))
            ),
          }),
        }}
      />

      <section className="pb-16 pt-8 md:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="stagger">
            <div className="space-y-8">
              {faqs.map((section) => (
                <AnimatedItem key={section.category}>
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-foreground" />
                      <h2 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">{section.category}</h2>
                    </div>
                    <div className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_currentColor]">
                      {section.questions.map((faq) => (
                        <FAQItem
                          key={faq.q}
                          question={faq.q}
                          answer={faq.a}
                        />
                      ))}
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
