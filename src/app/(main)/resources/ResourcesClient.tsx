"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, FileText, Download, BookOpen, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, Heart, Bookmark, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";
import { RESOURCE_TYPES } from "@/lib/constants";

export function ResourcesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeType, setActiveType] = useState<string>("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = () => {
    setDebouncedQuery(searchQuery);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["resources", debouncedQuery, activeType, page, searchParams.get("university"), searchParams.get("course")],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        type: activeType,
        page: page.toString(),
      });
      
      const university = searchParams.get("university");
      const course = searchParams.get("course");
      
      if (university) params.append("university", university);
      if (course) params.append("course", course);
      const res = await fetch(`/api/resources?${params}&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const downloadMutation = useMutation({
    mutationFn: async ({ id, url, title }: { id: string; url: string; title: string }) => {
      fetch(`/api/resources/${id}/download`, { method: "POST" }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["userStats"] });
      }).catch(console.error);

      let downloadUrl = url;
      
      if (url.includes("res.cloudinary.com")) {
        const parts = url.split("/upload/");
        if (parts.length === 2) {
          downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
        }
      }
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = title ? title.replace(/\s+/g, '_') : "helpjuniors_resource";
      a.target = "_blank"; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["resources"] });
      const previousData = queryClient.getQueryData(["resources", debouncedQuery, activeType, page, searchParams.get("university"), searchParams.get("course")]);
      
      queryClient.setQueryData(
        ["resources", debouncedQuery, activeType, page, searchParams.get("university"), searchParams.get("course")],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((res: any) => 
              res._id === id ? { 
                ...res, 
                hasLiked: !res.hasLiked,
                likesCount: res.hasLiked ? Math.max(0, res.likesCount - 1) : res.likesCount + 1 
              } : res
            )
          };
        }
      );
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["resources", debouncedQuery, activeType, page, searchParams.get("university"), searchParams.get("course")], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/save`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["resources"] });
      const previousData = queryClient.getQueryData(["resources", debouncedQuery, activeType, page, searchParams.get("university"), searchParams.get("course")]);
      
      queryClient.setQueryData(
        ["resources", debouncedQuery, activeType, page, searchParams.get("university"), searchParams.get("course")],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((res: any) => 
              res._id === id ? { ...res, hasSaved: !res.hasSaved } : res
            )
          };
        }
      );
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["resources", debouncedQuery, activeType, page, searchParams.get("university"), searchParams.get("course")], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["savedResources"] });
    }
  });

  const handleTypeToggle = (type: string) => {
    setActiveType(prev => prev === type ? "" : type);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const catalogElement = document.getElementById("catalog-section");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  const resources = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <section className="border-b-2 border-foreground bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Resources"
            description="Discover thousands of academic resources shared by students across India. PYQs, notes, assignments, and more."
          >
            <div className="mx-auto max-w-xl">
              <div className="flex border-2 border-foreground bg-background p-1 shadow-[4px_4px_0px_0px_currentColor]">
                <div className="flex items-center pl-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search by subject, university, or keyword..."
                  className="w-full bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-wide placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="border-2 border-foreground bg-foreground px-5 py-2 font-mono text-xs font-black uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
                >
                  Search
                </button>
              </div>
            </div>
          </PageHeader>
        </div>
      </section>

      <section id="catalog-section" className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b-2 border-foreground pb-4">
            <span className="mr-2 flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-widest text-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter:
            </span>
            {RESOURCE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`border-2 border-foreground px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                  activeType === type
                    ? "bg-foreground text-background shadow-[2px_2px_0px_0px_currentColor]"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 font-mono text-base font-black uppercase tracking-tight">No resources found</h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <AnimatedContainer
                key={`page-${page}-${activeType}-${debouncedQuery}`}
                variant="stagger"
                viewport={false}
              >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {resources.map((resource: any) => (
                    <AnimatedItem key={resource._id}>
                      <div 
                        onClick={() => router.push(`/resources/${resource._id}`)}
                        className="group cursor-pointer border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor] flex flex-col justify-between h-full"
                      >
                        <div>
                          <div className="flex items-start justify-between border-b border-border pb-3">
                            <span className="border border-foreground bg-muted font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                              {resource.type}
                            </span>
                            <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {resource.views?.toLocaleString() || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {resource.downloads?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start justify-between mt-3">
                            <h3 className="font-black text-sm uppercase tracking-tight leading-snug group-hover:underline flex-1 pr-2">
                              {resource.title}
                            </h3>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={(e) => { e.stopPropagation(); likeMutation.mutate(resource._id); }}
                                className={`flex items-center gap-1 border border-border px-2 py-0.5 transition-colors ${resource.hasLiked ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"}`}
                              >
                                <Heart className={`h-3 w-3 ${resource.hasLiked ? "fill-current" : ""}`} />
                                <span className="font-mono text-[10px] font-bold">{resource.likesCount || 0}</span>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); saveMutation.mutate(resource._id); }}
                                className={`p-1 border border-border transition-colors ${resource.hasSaved ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"}`}
                              >
                                <Bookmark className={`h-3 w-3 ${resource.hasSaved ? "fill-current" : ""}`} />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 font-mono text-xs text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
                              <BookOpen className="h-3 w-3" />
                              {resource.university}
                            </span>
                            <span className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
                              Sem {resource.semester}
                            </span>
                            <span className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
                              {resource.year}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t-2 border-foreground pt-3">
                           <div className="flex items-center gap-2">
                             {resource.uploadedBy.image ? (
                               <img src={resource.uploadedBy.image} alt="" className="h-5 w-5 border border-foreground object-cover" />
                             ) : (
                               <div className="h-5 w-5 bg-foreground text-background flex items-center justify-center font-mono text-[9px] font-bold">
                                 {resource.uploadedBy.name?.charAt(0) || "U"}
                                </div>
                             )}
                             <span className="font-mono text-xs text-muted-foreground">{resource.uploadedBy.name}</span>
                           </div>
                           <span className="font-mono text-xs font-black uppercase tracking-wider text-foreground underline underline-offset-4">
                             Download
                           </span>
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </div>
              </AnimatedContainer>

              {pagination && pagination.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 border-t-2 border-foreground pt-6">
                  <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="border-2 border-foreground p-2 hover:bg-foreground hover:text-background disabled:opacity-50 transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest px-3">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className="border-2 border-foreground p-2 hover:bg-foreground hover:text-background disabled:opacity-50 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
