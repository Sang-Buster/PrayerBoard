"use client";

import { useState, useEffect } from "react";
import { EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

interface Prayer {
  id: number;
  name: string;
  request: string;
  is_anonymous: boolean;
  created_at: string;
}

export default function PrayerList() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPrayers = async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(`/api/prayers?page=${pageNum}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (append) {
        setPrayers((prev) => [...prev, ...data.prayers]);
      } else {
        setPrayers(data.prayers);
      }
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (error) {
      console.error("Error fetching prayers:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPrayers(1);
  }, []);

  const loadMore = () => {
    if (page < totalPages) {
      fetchPrayers(page + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 bg-warm-border rounded" />
                <div className="h-4 w-full bg-warm-border rounded" />
                <div className="h-4 w-2/3 bg-warm-border rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (prayers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted">
            No prayer requests yet. They&apos;ll appear here as they come in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {prayers.map((prayer) => (
        <Card key={prayer.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                {prayer.is_anonymous ? (
                  <Badge variant="secondary">
                    <EyeOff className="h-3 w-3" />
                    Anonymous
                  </Badge>
                ) : (
                  <span className="text-sm font-medium text-charcoal">
                    {prayer.name}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted whitespace-nowrap">
                {timeAgo(prayer.created_at)}
              </span>
            </div>
            <p className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-wrap">
              {prayer.request}
            </p>
          </CardContent>
        </Card>
      ))}

      {page < totalPages && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
