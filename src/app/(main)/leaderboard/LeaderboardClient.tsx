"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Upload, Crown, Star, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer, AnimatedItem } from "@/components/shared/animated-container";

const rankIcons: Record<number, typeof Crown> = {
  1: Crown,
  2: Medal,
  3: Medal,
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

export function LeaderboardClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/users/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const leaderboardData = data?.data || [];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Leaderboard"
            description="Our top contributors who make HelpJuniors amazing. Upload quality resources to climb the ranks."
          />
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground py-16 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-mono text-base font-black uppercase tracking-tight">No data yet!</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Be the first to upload resources and top the leaderboard.</p>
        </div>
      ) : (
        <>
          <section className="pb-6 pt-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <AnimatedContainer variant="stagger">
                <div className="grid gap-6 md:grid-cols-3">
                  {leaderboardData.slice(0, 3).map((user: any, index: number) => {
                    const rank = index + 1;
                    const RankIcon = rankIcons[rank] || Trophy;
                    return (
                      <AnimatedItem key={user.id}>
                        <div className="relative border-2 border-foreground bg-card p-5 text-center shadow-[4px_4px_0px_0px_currentColor] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_currentColor]">
                          <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-foreground">
                            <RankIcon className="h-4 w-4" />
                            <span>Rank #{rank}</span>
                          </div>
                          <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center overflow-hidden border-2 border-foreground bg-muted font-mono text-base font-black text-foreground">
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                              getInitials(user.name)
                            )}
                          </div>
                          <h3 className="mt-3 font-black text-base uppercase tracking-tight">{user.name}</h3>
                          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{user.role}</p>
                          <div className="mt-4 flex items-center justify-center gap-4 font-mono text-xs border-t border-border pt-3">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Upload className="h-3.5 w-3.5" />
                              {user.totalUploads}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-foreground">
                              <Star className="h-3.5 w-3.5" />
                              {user.reputation.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </AnimatedItem>
                    );
                  })}
                </div>
              </AnimatedContainer>
            </div>
          </section>

          {leaderboardData.length > 3 && (
            <section className="pb-16 md:pb-20">
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <AnimatedContainer variant="stagger">
                  <div className="border-2 border-foreground bg-card divide-y-2 divide-foreground shadow-[4px_4px_0px_0px_currentColor]">
                    {leaderboardData.slice(3).map((user: any, index: number) => {
                      const rank = index + 4;
                      return (
                        <AnimatedItem key={user.id}>
                          <div className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted">
                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-foreground bg-muted font-mono text-xs font-black text-foreground">
                              {rank}
                            </span>
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden border border-foreground bg-muted font-mono text-xs font-black text-foreground">
                              {user.image ? (
                                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                              ) : (
                                getInitials(user.name)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm uppercase tracking-tight">{user.name}</p>
                              <p className="font-mono text-xs text-muted-foreground uppercase">{user.role}</p>
                            </div>
                            <div className="flex items-center gap-4 font-mono text-xs">
                              <span className="hidden items-center gap-1 text-muted-foreground sm:flex">
                                <Upload className="h-3.5 w-3.5" />
                                {user.totalUploads}
                              </span>
                              <span className="flex items-center gap-1 font-bold text-foreground">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {user.reputation.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </AnimatedItem>
                      );
                    })}
                  </div>
                </AnimatedContainer>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
