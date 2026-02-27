"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface DailyCount {
  date: string;
  count: number;
}

interface PrayerChartProps {
  dailyCounts: DailyCount[];
}

export default function PrayerChart({ dailyCounts }: PrayerChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!dailyCounts || dailyCounts.length === 0) {
    return null;
  }

  const formattedData = dailyCounts.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Show fewer ticks on mobile to avoid overlap
  const tickInterval = isMobile
    ? Math.max(Math.floor(formattedData.length / 4), 1)
    : Math.max(Math.floor(formattedData.length / 8), 1);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Prayer Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 5, right: 10, left: isMobile ? -25 : -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fafafa" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#fafafa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: isMobile ? 10 : 11, fill: "#71717a" }}
                tickLine={false}
                axisLine={{ stroke: "#27272a" }}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
                labelStyle={{ color: "#fafafa", fontWeight: 600 }}
                itemStyle={{ color: "#a1a1aa" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#fafafa"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
                name="Prayers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
