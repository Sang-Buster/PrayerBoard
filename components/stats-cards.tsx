"use client";

import { useState, useEffect } from "react";
import { Heart, Clock, Send, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  anonymousPercentage: number;
  dailyCounts: { date: string; count: number }[];
}

interface StatsCardsProps {
  onStatsLoaded?: (stats: Stats) => void;
}

export default function StatsCards({ onStatsLoaded }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
        onStatsLoaded?.(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      label: "Total Prayers",
      value: stats?.total ?? 0,
      icon: Heart,
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: "This Week",
      value: stats?.thisWeek ?? 0,
      icon: Clock,
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: "Today",
      value: stats?.today ?? 0,
      icon: Send,
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: "Anonymous",
      value: stats?.anonymousPercentage ?? 0,
      icon: Users,
      format: (v: number) => `${v}%`,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-20 bg-warm-border rounded" />
                <div className="h-8 w-16 bg-warm-border rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{card.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold font-heading">
                {card.format(card.value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
