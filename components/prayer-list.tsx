"use client";

import { useState, useEffect, useCallback } from "react";
import {
  EyeOff,
  Loader2,
  Pencil,
  Check,
  X,
  Search,
  Download,
  Pin,
  PinOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/utils";

interface Prayer {
  id: number;
  name: string;
  request: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  created_at: string;
}

export default function PrayerList() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [togglingPinId, setTogglingPinId] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchPrayers = useCallback(async (pageNum: number, append = false, query = searchQuery) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
      if (query) params.set("search", query);
      const res = await fetch(`/api/prayers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (append) {
        setPrayers((prev) => [...prev, ...data.prayers]);
      } else {
        setPrayers(data.prayers);
      }
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
      setPage(data.page);
    } catch (error) {
      console.error("Error fetching prayers:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoad(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPrayers(1);
  }, [fetchPrayers]);

  const loadMore = () => {
    if (page < totalPages) {
      fetchPrayers(page + 1, true);
    }
  };

  const startEditing = (prayer: Prayer) => {
    setEditingId(prayer.id);
    setEditText(prayer.request);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id: number) => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, request: editText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, request: editText.trim() } : p
        )
      );
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating prayer:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (prayer: Prayer) => {
    setTogglingPinId(prayer.id);
    try {
      const res = await fetch("/api/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prayer.id, action: "toggle-pin", pinned: !prayer.is_pinned }),
      });
      if (!res.ok) throw new Error("Failed to toggle pin");
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayer.id ? { ...p, is_pinned: !prayer.is_pinned } : p
        )
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
    } finally {
      setTogglingPinId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Live search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const clearSearch = () => {
    setSearchInput("");
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/prayers?export=csv");
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prayers-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  if (loading && initialLoad) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 bg-secondary rounded" />
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="h-4 w-2/3 bg-secondary rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const toolbar = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or prayer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchInput && (
          <Button variant="ghost" className="h-9 shrink-0" onClick={clearSearch} type="button">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </form>
      <Button variant="outline" className="h-9 shrink-0" onClick={handleExport}>
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );

  if (prayers.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        {toolbar}
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {totalCount} result{totalCount !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
          </p>
        )}
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No prayer requests match your search."
                : "No prayer requests yet. They\u2019ll appear here as they come in."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {toolbar}

      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {totalCount} result{totalCount !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
        </p>
      )}

      {prayers.map((prayer) => (
        <Card key={prayer.id} className={prayer.is_pinned ? "border-foreground/30" : ""}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                {prayer.is_pinned && (
                  <Pin className="h-3.5 w-3.5 text-foreground" />
                )}
                {prayer.is_anonymous ? (
                  <Badge variant="secondary">
                    <EyeOff className="h-3 w-3" />
                    Anonymous
                  </Badge>
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {prayer.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(prayer.created_at)}
                </span>
                {editingId !== prayer.id && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title={prayer.is_pinned ? "Unpin" : "Pin to top"}
                      onClick={() => handleTogglePin(prayer)}
                      disabled={togglingPinId === prayer.id}
                    >
                      {togglingPinId === prayer.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : prayer.is_pinned ? (
                        <PinOff className="h-3.5 w-3.5 text-foreground" />
                      ) : (
                        <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEditing(prayer)}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {editingId === prayer.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="text-sm min-h-20"
                  autoFocus
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveEdit(prayer.id)}
                    disabled={saving || !editText.trim()}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                {prayer.request}
              </p>
            )}
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
