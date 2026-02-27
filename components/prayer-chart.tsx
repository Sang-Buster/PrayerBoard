"use client";

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

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">Prayers Over the Last 30 Days</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B7F95" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5B7F95" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
                tickLine={false}
                axisLine={{ stroke: "#E8E5E0" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8E5E0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
                labelStyle={{ color: "#1A1A1A", fontWeight: 600 }}
                itemStyle={{ color: "#5B7F95" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#5B7F95"
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
