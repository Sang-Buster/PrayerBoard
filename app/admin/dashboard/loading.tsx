import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="h-8 w-20 bg-secondary rounded animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-20 bg-secondary rounded" />
                <div className="h-8 w-16 bg-secondary rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="h-[250px] bg-secondary/30 rounded animate-pulse" />
        </CardContent>
      </Card>

      {/* Prayer list skeleton */}
      <div>
        <div className="h-6 w-48 bg-secondary rounded animate-pulse mb-4" />
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
      </div>
    </div>
  );
}
