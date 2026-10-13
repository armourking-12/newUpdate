import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileText, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse academic resources organized by courses. Find PYQs, notes, and study materials for your specific course.",
};

const getCourseIcon = (courseName: string) => {
  const name = courseName.toLowerCase();
  if (name.includes("computer") || name.includes("cse") || name.includes("bca") || name.includes("mca")) return "💻";
  if (name.includes("electronic") || name.includes("ece") || name.includes("electrical") || name.includes("eee")) return "⚡";
  if (name.includes("mechanic") || name.includes("me")) return "⚙️";
  if (name.includes("civil") || name.includes("ce")) return "🏗️";
  if (name.includes("math")) return "📐";
  if (name.includes("physic")) return "🔬";
  if (name.includes("commerce") || name.includes("bcom") || name.includes("business") || name.includes("bba") || name.includes("mba")) return "📈";
  if (name.includes("art") || name.includes("english") || name.includes("ba")) return "📚";
  return "🎓";
};

export default async function CoursesPage() {
  await connectToDatabase();

  const aggregation = await Resource.aggregate([
    { $match: { status: "approved" } },
    { 
      $group: { 
        _id: { $toUpper: "$course" }, 
        name: { $first: "$course" },
        resources: { $sum: 1 },
        uniqueUniversities: { $addToSet: { $toUpper: "$university" } }
      } 
    },
    {
      $project: {
        _id: 0,
        name: 1,
        resources: 1,
        universities: { $size: "$uniqueUniversities" }
      }
    },
    { $sort: { resources: -1 } }
  ]);

  const courses = aggregation.map(item => ({
    name: item.name,
    code: item.name.split(' ').map((word: string) => word[0]).join('').substring(0, 4).toUpperCase(),
    resources: item.resources,
    universities: item.universities,
    icon: getCourseIcon(item.name)
  }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Courses"
            description="Browse resources organized by course. Find exactly what you need for your program."
          />
        </div>
      </section>

      <section className="pb-16 pt-8 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground py-16 text-center">
              <div className="mb-3 border-2 border-foreground bg-muted p-3 text-foreground">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-mono text-base font-black uppercase tracking-tight">No Courses Yet</h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Upload resources to see courses populated here!
              </p>
            </div>
          ) : (
            <AnimatedContainer variant="stagger">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <AnimatedItem key={course.name}>
                    <Link href={`/resources?course=${encodeURIComponent(course.name)}`} className="block">
                      <div className="group cursor-pointer border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor]">
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{course.icon}</span>
                          <ArrowRight className="h-4 w-4 text-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <h3 className="mt-3 font-black text-base uppercase tracking-tight leading-snug line-clamp-1 group-hover:underline">
                          {course.name}
                        </h3>
                        <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                          {course.code}
                        </p>
                        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {course.resources.toLocaleString()} resources
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {course.universities.toLocaleString()} universities
                          </span>
                        </div>
                      </div>
                    </Link>
                  </AnimatedItem>
                ))}
              </div>
            </AnimatedContainer>
          )}
        </div>
      </section>
    </>
  );
}
