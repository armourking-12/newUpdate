"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { RESOURCE_TYPES } from "@/lib/constants";

interface EditResourceModalProps {
  resource: any;
  onClose: () => void;
}

export function EditResourceModal({ resource, onClose }: EditResourceModalProps) {
  const [formData, setFormData] = useState({
    title: resource.title || "",
    description: resource.description || "",
    type: resource.type || "",
    university: resource.university || "",
    course: resource.course || "",
    semester: resource.semester?.toString() || "",
    subject: resource.subject || "",
    year: resource.year?.toString() || "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/resources/${resource._id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update resource");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myUploads"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-xl border-2 border-foreground bg-card p-6 shadow-[6px_6px_0px_0px_currentColor] max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between border-b-2 border-foreground pb-3">
          <h2 className="text-xl font-black uppercase tracking-tight">Edit Resource Details</h2>
          <button onClick={onClose} className="border border-foreground p-1 text-muted-foreground hover:bg-foreground hover:text-background transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider">Type</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
              >
                <option value="" disabled>Select type...</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider">University / College</label>
              <input
                type="text"
                required
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value.toUpperCase() })}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm uppercase shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider">Course</label>
              <input
                type="text"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider">Semester (1-8)</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase tracking-wider">Year</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_currentColor] focus:outline-none"
              />
            </div>
          </div>

          {mutation.error && (
            <div className="border-2 border-destructive bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {mutation.error.message}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-foreground pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="border-2 border-foreground bg-background px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[2px_2px_0px_0px_currentColor] transition-all hover:bg-background hover:text-foreground disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
