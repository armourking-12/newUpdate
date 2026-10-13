"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Download, Loader2, User as UserIcon } from "lucide-react";
import Image from "next/image";

type PendingUpload = {
  _id: string;
  title: string;
  description: string;
  type: string;
  university: string;
  course: string;
  semester: number;
  subject: string;
  year: number;
  examType?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    name: string;
    image?: string;
    reputation: number;
  };
  createdAt: string;
};

export function PendingQueue() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: uploads = [], isLoading } = useQuery<PendingUpload[]>({
    queryKey: ["pendingUploads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pending");
      if (!res.ok) throw new Error("Failed to fetch pending uploads");
      const data = await res.json();
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to approve");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUploads"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });
      if (!res.ok) throw new Error("Failed to reject");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUploads"] });
      setRejectingId(null);
      setRejectReason("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground p-12 text-center">
        <div className="border-2 border-foreground bg-foreground p-3 text-background">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-3 font-mono text-base font-black uppercase tracking-tight">All caught up!</h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">There are no pending uploads requiring moderation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {uploads.map((upload) => (
          <motion.div
            key={upload._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4 border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_currentColor] md:flex-row md:items-start md:justify-between"
          >
            <div className="flex-1 space-y-2.5">
              <div className="flex items-start justify-between md:justify-start md:gap-3">
                <h4 className="font-black text-base uppercase tracking-tight">{upload.title}</h4>
                <span className="inline-flex items-center border border-foreground bg-muted px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                  {upload.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{upload.description}</p>
              
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px] uppercase text-muted-foreground">
                <span className="border border-border bg-muted px-2 py-0.5">{upload.university}</span>
                <span className="border border-border bg-muted px-2 py-0.5">{upload.course} (Sem {upload.semester})</span>
                <span className="border border-border bg-muted px-2 py-0.5">{upload.subject}</span>
                <span className="border border-border bg-muted px-2 py-0.5">{upload.year}</span>
                {upload.examType && <span className="border border-border bg-muted px-2 py-0.5">{upload.examType}</span>}
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {upload.uploadedBy.image ? (
                    <Image src={upload.uploadedBy.image} alt="" width={18} height={18} className="h-4.5 w-4.5 border border-foreground object-cover" />
                  ) : (
                    <div className="border border-foreground bg-muted p-0.5"><UserIcon className="h-3.5 w-3.5" /></div>
                  )}
                  <span className="font-bold text-foreground">{upload.uploadedBy.name}</span>
                  <span className="text-muted-foreground">({upload.uploadedBy.reputation} rep)</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatDistanceToNow(new Date(upload.createdAt))} ago</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{(upload.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 md:w-48">
              <a 
                href={upload.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 border-2 border-foreground bg-background px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_currentColor] transition-colors hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" /> Preview File
              </a>
              
              {rejectingId === upload._id ? (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Reason for rejection..." 
                    className="w-full border-2 border-foreground bg-background px-2.5 py-1.5 font-mono text-xs focus:outline-none shadow-[2px_2px_0px_0px_currentColor]"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setRejectingId(null)}
                      className="flex-1 border-2 border-foreground bg-background py-1.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => rejectMutation.mutate({ id: upload._id, reason: rejectReason })}
                      disabled={rejectMutation.isPending}
                      className="flex-1 border-2 border-destructive bg-destructive py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => approveMutation.mutate(upload._id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1 border-2 border-foreground bg-foreground py-2 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[2px_2px_0px_0px_currentColor] transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button 
                    onClick={() => setRejectingId(upload._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 border-2 border-destructive bg-background py-2 font-mono text-xs font-bold uppercase tracking-wider text-destructive shadow-[2px_2px_0px_0px_currentColor] transition-colors hover:bg-destructive hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
