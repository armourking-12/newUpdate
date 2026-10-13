"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Download, Eye, Heart, Bookmark, Loader2, BookOpen, Clock } from "lucide-react";

export function HistoryClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const previousData = queryClient.getQueryData(["history"]);
      
      queryClient.setQueryData(["history"], (old: any) => {
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
      });
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["history"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
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
      await queryClient.cancelQueries({ queryKey: ["history"] });
      const previousData = queryClient.getQueryData(["history"]);
      
      queryClient.setQueryData(["history"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((res: any) => 
            res._id === id ? { ...res, hasSaved: !res.hasSaved } : res
          )
        };
      });
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["history"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["savedResources"] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const resources = data?.data || [];

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground py-16 text-center bg-card">
        <Clock className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-mono text-base font-black uppercase tracking-tight">No viewing history yet</h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">When you view study materials, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource: any) => (
        <div 
          key={resource._id}
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
                  <Heart className={`h-3.5 w-3.5 ${resource.hasLiked ? "fill-current" : ""}`} />
                  <span className="font-mono text-[10px] font-bold">{resource.likesCount || 0}</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); saveMutation.mutate(resource._id); }}
                  className={`p-1 border border-border transition-colors ${resource.hasSaved ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground"}`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${resource.hasSaved ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {resource.description}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
            <span className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {resource.university}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
