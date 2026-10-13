import type { Metadata } from "next";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest articles on exam preparation tips, study strategies, and platform updates from HelpJuniors.",
};

const posts = [
  {
    id: "1",
    title: "How to Use PYQs Effectively for Exam Preparation",
    excerpt:
      "Previous year question papers are your secret weapon for acing exams. Here's a proven strategy to use them effectively and maximize your scores.",
    category: "Study Tips",
    readTime: "5 min read",
    date: "June 15, 2026",
  },
  {
    id: "2",
    title: "Introducing AI-Powered Uploads: Just Snap and Upload",
    excerpt:
      "We've launched our most requested feature — AI-powered uploads. Simply take a photo of a question paper and let Gemini AI do the rest.",
    category: "Product Update",
    readTime: "3 min read",
    date: "June 10, 2026",
  },
  {
    id: "3",
    title: "Top 10 Study Strategies for Engineering Students",
    excerpt:
      "Engineering exams can be overwhelming. Here are 10 battle-tested study strategies from top-performing students across India.",
    category: "Study Tips",
    readTime: "7 min read",
    date: "June 5, 2026",
  },
  {
    id: "4",
    title: "How HelpJuniors Ensures Content Quality",
    excerpt:
      "Learn about our moderation process, duplicate detection using SHA-256 hashes, and how we maintain high-quality academic resources.",
    category: "Behind the Scenes",
    readTime: "4 min read",
    date: "May 28, 2026",
  },
  {
    id: "5",
    title: "The Complete Guide to Note-Taking in College",
    excerpt:
      "Cornell method, mind maps, or digital notes? We compare the most popular note-taking methods and help you find what works best.",
    category: "Study Tips",
    readTime: "6 min read",
    date: "May 20, 2026",
  },
  {
    id: "6",
    title: "Contributor Spotlight: Meet Our Top Uploaders",
    excerpt:
      "Get to know the students who have contributed the most resources to HelpJuniors and learn about their motivation.",
    category: "Community",
    readTime: "4 min read",
    date: "May 15, 2026",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Blog"
            description="Study tips, platform updates, and stories from the HelpJuniors community."
          />
        </div>
      </section>

      <section className="pb-16 pt-8 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="stagger">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <AnimatedItem key={post.id}>
                  <article className="group cursor-pointer border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor] flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 border border-foreground bg-muted px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                          <Tag className="h-3 w-3" />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="mt-3 font-black text-lg uppercase tracking-tight leading-snug group-hover:underline">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-foreground group-hover:underline">
                        Read more
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </article>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
