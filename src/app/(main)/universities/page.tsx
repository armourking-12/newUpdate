import type { Metadata } from "next";
import Link from "next/link";
import { Search, MapPin, FileText, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Universities",
  description:
    "Browse academic resources by university. Find PYQs and notes specific to your institution.",
};

export default async function UniversitiesPage() {
  await connectToDatabase();

  const aggregation = await Resource.aggregate([
    { $match: { status: "approved" } },
    { 
      $group: { 
        _id: { $toUpper: "$university" }, 
        name: { $first: "$university" },
        resources: { $sum: 1 },
        uniqueCourses: { $addToSet: { $toUpper: "$course" } }
      } 
    },
    {
      $project: {
        _id: 0,
        name: 1,
        resources: 1,
        courses: { $size: "$uniqueCourses" }
      }
    },
    { $sort: { resources: -1 } }
  ]);

  const universities = aggregation.map(item => ({
    name: item.name,
    location: "Global",
    resources: item.resources,
    courses: item.courses,
    abbr: item.name.split(' ').map((word: string) => word[0]).join('').substring(0, 3).toUpperCase()
  }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Universities"
            description="Find resources specific to your university. Browse by institution to discover relevant study materials."
          >
            <div className="mx-auto max-w-lg">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  className="w-full border-2 border-foreground bg-background py-2.5 pl-10 pr-4 font-mono text-xs uppercase placeholder:normal-case transition-all shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
                />
              </div>
            </div>
          </PageHeader>
        </div>
      </section>

      <section className="pb-16 pt-8 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {universities.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground py-16 text-center">
              <div className="mb-3 border-2 border-foreground bg-muted p-3 text-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-mono text-base font-black uppercase tracking-tight">No Universities Yet</h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Be the first to upload a resource for your university!
              </p>
            </div>
          ) : (
            <AnimatedContainer variant="stagger">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {universities.map((uni) => (
                  <AnimatedItem key={uni.name}>
                    <Link href={`/resources?university=${encodeURIComponent(uni.name)}`} className="block">
                      <div className="group cursor-pointer border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor]">
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-foreground bg-muted font-mono text-xs font-black uppercase text-foreground">
                            {uni.abbr}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-base uppercase tracking-tight line-clamp-1 group-hover:underline">
                              {uni.name}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {uni.location}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 flex-shrink-0 text-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {uni.resources.toLocaleString()} resources
                          </span>
                          <span>{uni.courses} courses</span>
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
