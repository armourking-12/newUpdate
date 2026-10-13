"use client";

import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Download,
  Star,
  History,
  LogOut,
  AlertCircle,
  Shield,
  Bookmark,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RoleGate } from "@/components/auth/protected-route";
import { useSearchParams } from "next/navigation";
import { PendingQueue } from "@/components/admin/PendingQueue";
import { EditResourceModal } from "@/components/dashboard/EditResourceModal";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

function DashboardContent() {
  const { profile, logout, isEmailVerified } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorizedError = searchParams.get("error") === "unauthorized";
  const queryClient = useQueryClient();
  const [editingResource, setEditingResource] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("Are you sure you want to delete this project/resource? This action cannot be undone.")) return;
    
    setIsDeleting(resourceId);
    try {
      const res = await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete resource");
      
      queryClient.invalidateQueries({ queryKey: ["myUploads"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    } catch (error) {
      console.error(error);
      alert("Failed to delete resource");
    } finally {
      setIsDeleting(null);
    }
  };

  const { data: statsData } = useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const res = await fetch(`/api/users/me/stats?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!profile,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: savedData } = useQuery({
    queryKey: ["savedResources"],
    queryFn: async () => {
      const res = await fetch(`/api/users/me/saved`);
      if (!res.ok) throw new Error("Failed to fetch saved resources");
      return res.json();
    },
    enabled: !!profile,
  });

  const { data: uploadsData } = useQuery({
    queryKey: ["myUploads"],
    queryFn: async () => {
      const res = await fetch(`/api/users/me/uploads`);
      if (!res.ok) throw new Error("Failed to fetch my uploads");
      return res.json();
    },
    enabled: !!profile,
  });

  const dynamicStats = statsData?.data || {
    reputation: 0,
    approvedUploads: 0,
    pendingUploads: 0,
    totalDownloads: 0,
    notifications: [],
  };

  const stats = [
    {
      label: "Total Uploads",
      value: dynamicStats.approvedUploads,
      icon: Upload,
    },
    {
      label: "Downloads Generated",
      value: dynamicStats.totalDownloads,
      icon: Download,
    },
    {
      label: "Reputation",
      value: dynamicStats.reputation,
      icon: Star,
    },
    {
      label: "Pending Approvals",
      value: dynamicStats.pendingUploads,
      icon: FileText,
    },
  ];

  const getRoleBadge = () => {
    if (!profile) return null;
    const labels: Record<string, string> = {
      student: "Student",
      moderator: "Moderator",
      admin: "Admin",
      super_admin: "Super Admin",
    };
    return (
      <span className="inline-flex items-center gap-1 border border-foreground bg-muted px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground">
        <Shield className="h-3 w-3" />
        {labels[profile.role] || "Student"}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {unauthorizedError && (
        <div className="mb-6 flex items-center gap-2 border-2 border-destructive bg-destructive/10 p-4 font-mono text-xs text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          You don&apos;t have permission to access that page.
        </div>
      )}

      {!isEmailVerified && (
        <div className="mb-6 flex items-center gap-2 border-2 border-foreground bg-amber-500/10 p-4 font-mono text-xs text-foreground">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          Your email is not verified.{" "}
          <button
            onClick={() => router.push("/verify-email")}
            className="font-bold underline hover:no-underline ml-1 uppercase"
          >
            Verify now
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-foreground pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">
              Welcome back, {profile?.name?.split(" ")[0] ?? "Student"}
            </h1>
            {getRoleBadge()}
          </div>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Here&apos;s your activity overview
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/history")}
            className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_currentColor] hover:bg-muted"
          >
            <History className="h-4 w-4" />
            History
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 border-2 border-destructive bg-background px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-destructive transition-all shadow-[2px_2px_0px_0px_currentColor] hover:bg-destructive hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_currentColor]"
          >
            <div className="mb-3 inline-flex border-2 border-foreground bg-foreground p-2 text-background">
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-black">{stat.value?.toLocaleString() || 0}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {dynamicStats.notifications.length > 0 && (
        <div className="mt-8 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor]">
          <h2 className="mb-4 font-mono text-xs font-black uppercase tracking-widest text-foreground">Recent Notifications</h2>
          <div className="space-y-3">
            {dynamicStats.notifications.map((notif: any) => (
              <div key={notif._id} className={`border-2 border-foreground p-4 ${notif.read ? 'bg-background' : 'bg-muted/40'}`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm uppercase tracking-tight">{notif.title}</h4>
                  <span className="font-mono text-xs text-muted-foreground">{formatDistanceToNow(new Date(notif.createdAt))} ago</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadsData?.data && uploadsData.data.length > 0 && (
        <div className="mt-8 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor]">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-foreground">
              <Upload className="h-4 w-4" />
              My Uploads
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadsData.data.map((resource: any) => (
              <div key={resource._id} className="group border-2 border-foreground bg-card p-4 shadow-[2px_2px_0px_0px_currentColor] flex flex-col h-full relative">
                <div className="flex items-start justify-between">
                  <span className="inline-flex border border-foreground px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-muted text-foreground">
                    {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingResource(resource)}
                      className="border border-foreground bg-background px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
                      disabled={isDeleting === resource._id}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteResource(resource._id); }}
                      className="border border-destructive bg-background px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                      disabled={isDeleting === resource._id}
                    >
                      {isDeleting === resource._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <h3 className="mt-3 font-black text-sm uppercase tracking-tight leading-snug group-hover:underline flex-1 pr-2">
                  {resource.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                  {resource.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                  <span className="border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    {resource.type}
                  </span>
                  <div className="flex items-center gap-3">
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
              </div>
            ))}
          </div>
        </div>
      )}

      {savedData?.data && savedData.data.length > 0 && (
        <div className="mt-8 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor]">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-foreground">
              <Bookmark className="h-4 w-4" />
              Saved Papers
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedData.data.map((resource: any) => (
              <div key={resource._id} className="group border-2 border-foreground bg-card p-4 shadow-[2px_2px_0px_0px_currentColor] flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <span className="inline-flex border border-foreground bg-muted px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                    {resource.type}
                  </span>
                </div>
                <h3 className="mt-3 font-black text-sm uppercase tracking-tight leading-snug group-hover:underline flex-1 pr-2">
                  {resource.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                  {resource.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                  <span className="font-bold text-foreground hover:underline cursor-pointer uppercase tracking-wider" onClick={() => window.open(resource.fileUrl, "_blank")}>
                    Download
                  </span>
                  <div className="flex items-center gap-3">
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
              </div>
            ))}
          </div>
        </div>
      )}

      <RoleGate minimumRole="moderator">
        <div className="mt-8 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor]">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-foreground">
              <Shield className="h-4 w-4" />
              Moderation Queue
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Review and approve pending resources uploaded by students.
            </p>
          </div>
          <PendingQueue />
        </div>
      </RoleGate>

      <RoleGate minimumRole="admin">
        <div className="mt-4 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_currentColor]">
          <h2 className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-foreground">
            <Shield className="h-4 w-4" />
            Admin Panel
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            You have admin access. User management and platform settings will
            appear here.
          </p>
        </div>
      </RoleGate>

      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          onClose={() => setEditingResource(null)}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
