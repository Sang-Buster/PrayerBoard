"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/stats-cards";
import PrayerChart from "@/components/prayer-chart";
import PrayerList from "@/components/prayer-list";

interface DailyCount {
  date: string;
  count: number;
}

export default function DashboardClient() {
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/admin");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold font-heading">
          Prayer Dashboard
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards
        onStatsLoaded={(stats) => setDailyCounts(stats.dailyCounts)}
      />

      {/* Chart */}
      {dailyCounts.length > 0 && <PrayerChart dailyCounts={dailyCounts} />}

      {/* Prayer List */}
      <div>
        <h2 className="text-xl font-semibold font-heading mb-4">
          Recent Prayer Requests
        </h2>
        <PrayerList />
      </div>
    </div>
  );
}
