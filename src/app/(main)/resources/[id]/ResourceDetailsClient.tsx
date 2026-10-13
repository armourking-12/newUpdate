"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Heart, Bookmark, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ResourceDetailsClient({ initialResource }: { initialResource: any }) {
  const [resource, setResource] = useState(initialResource);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetch(`/api/resources/${resource._id}/view`, { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.views > resource.views) {
          setResource((prev: any) => ({ ...prev, views: data.views }));
        }
      })
      .catch(console.error);
  }, [resource._id]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource._id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onMutate: async () => {
      const previous = { hasLiked: resource.hasLiked, likesCount: resource.likesCount };
      setResource((prev: any) => ({
        ...prev,
        hasLiked: !prev.hasLiked,
        likesCount: prev.hasLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        setResource((prev: any) => ({ ...prev, ...context.previous }));
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setResource((prev: any) => ({
          ...prev,
          hasLiked: data.hasLiked,
          likesCount: data.likesCount,
        }));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource._id}/save`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onMutate: async () => {
      const previous = { hasSaved: resource.hasSaved };
      setResource((prev: any) => ({
        ...prev,
        hasSaved: !prev.hasSaved
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        setResource((prev: any) => ({ ...prev, ...context.previous }));
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setResource((prev: any) => ({ ...prev, hasSaved: data.hasSaved }));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["savedResources"] });
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      fetch(`/api/resources/${resource._id}/download`, { method: "POST" })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["userStats"] });
        }).catch(console.error);

      let downloadUrl = resource.fileUrl;
      if (downloadUrl.includes("res.cloudinary.com")) {
        const parts = downloadUrl.split("/upload/");
        if (parts.length === 2) {
          downloadUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
        }
      } else if (downloadUrl.startsWith("/api/files/")) {
        downloadUrl = downloadUrl.includes("?") ? `${downloadUrl}&download=1` : `${downloadUrl}?download=1`;
      }
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = resource.title ? resource.title.replace(/\s+/g, '_') : "helpjuniors_resource";
      a.target = "_blank"; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    onMutate: () => {
      setResource((prev: any) => ({ ...prev, downloads: prev.downloads + 1 }));
    }
  });

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">{resource.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{resource.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-4 border-y-2 border-foreground py-4">
          <div className="flex items-center gap-3">
            {resource.uploadedBy?.image ? (
              <img src={resource.uploadedBy.image} alt="" className="h-10 w-10 border-2 border-foreground object-cover" />
            ) : (
              <div className="h-10 w-10 border-2 border-foreground bg-muted" />
            )}
            <div>
              <p className="font-bold text-sm uppercase tracking-tight leading-none">{resource.uploadedBy?.name || "Unknown Student"}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">Uploaded {formatDistanceToNow(new Date(resource.createdAt))} ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-24 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor]">
          <button
            onClick={() => downloadMutation.mutate()}
            className="flex w-full items-center justify-center gap-2 border-2 border-foreground bg-foreground py-3 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[3px_3px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            Download Resource
          </button>
          
          <div className="mt-6 flex justify-around border-t-2 border-foreground pt-5">
            <button 
              onClick={() => likeMutation.mutate()}
              className="flex flex-col items-center gap-1.5 transition-colors group cursor-pointer"
            >
              <div className={`flex h-10 w-10 items-center justify-center border-2 border-foreground transition-colors ${resource.hasLiked ? "bg-foreground text-background" : "bg-muted text-foreground group-hover:bg-muted/80"}`}>
                <Heart className={`h-4 w-4 ${resource.hasLiked ? "fill-current" : ""}`} />
              </div>
              <span className="font-mono text-xs font-bold uppercase text-foreground">{resource.likesCount || 0} Likes</span>
            </button>
            <button 
              onClick={() => saveMutation.mutate()}
              className="flex flex-col items-center gap-1.5 transition-colors group cursor-pointer"
            >
              <div className={`flex h-10 w-10 items-center justify-center border-2 border-foreground transition-colors ${resource.hasSaved ? "bg-foreground text-background" : "bg-muted text-foreground group-hover:bg-muted/80"}`}>
                <Bookmark className={`h-4 w-4 ${resource.hasSaved ? "fill-current" : ""}`} />
              </div>
              <span className="font-mono text-xs font-bold uppercase text-foreground">{resource.hasSaved ? "Saved" : "Save"}</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 divide-x-2 divide-foreground border-2 border-foreground bg-muted/30">
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <Eye className="h-4 w-4 text-foreground mb-1" />
              <span className="text-lg font-black">{resource.views?.toLocaleString() || 0}</span>
              <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground">Views</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <Download className="h-4 w-4 text-foreground mb-1" />
              <span className="text-lg font-black">{resource.downloads?.toLocaleString() || 0}</span>
              <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground">Downloads</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-2 border-t-2 border-foreground pt-4 font-mono text-xs">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="font-bold uppercase text-muted-foreground">Type</span>
              <span className="font-bold uppercase text-foreground">{resource.type}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="font-bold uppercase text-muted-foreground">University</span>
              <span className="font-bold uppercase text-right max-w-[150px] truncate" title={resource.university}>{resource.university}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="font-bold uppercase text-muted-foreground">Course</span>
              <span className="font-bold uppercase text-right max-w-[150px] truncate" title={resource.course}>{resource.course}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="font-bold uppercase text-muted-foreground">Semester</span>
              <span className="font-bold uppercase text-foreground">{resource.semester}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="font-bold uppercase text-muted-foreground">Year</span>
              <span className="font-bold uppercase text-foreground">{resource.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
