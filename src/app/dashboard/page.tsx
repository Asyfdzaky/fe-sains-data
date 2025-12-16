"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { BarChart3, Upload, Users, TrendingUp } from "lucide-react";
import { uploadApi } from "@/lib/api/upload";
import { rfmApi } from "@/lib/api/rfm";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    rfmSegments: 0,
    dataUploads: 0,
    avgMonetary: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Load history to count uploads
        const history = await uploadApi.getHistory();
        const uploadsCount = history.length;

        let totalCust = 0;
        let segmentsCount = 0;
        let avgMoney = 0;

        // Try to get stats from the last uploaded file (if any)
        // Or we could try to aggregate across all files but that might be heavy
        // For dashboard summary, let's just take the latest available result
        if (history.length > 0) {
          // Find the latest file that has results
          // Note: This is a bit inefficient if we iterate all, so let's just check the first one (latest)
          // or maybe we need a specific endpoint for dashboard stats.
          // For now, let's just check the latest one.
          try {
            const results = await rfmApi.getResults(history[0].id);
            if (results.data && results.data.length > 0) {
              totalCust = results.data.length;
              segmentsCount = new Set(results.data.map((d) => d.cluster)).size;
              const totalMoney = results.data.reduce(
                (acc, curr) => acc + curr.monetary,
                0
              );
              avgMoney = totalMoney / (totalCust || 1);
            }
          } catch (ignore) {
            // If latest file hasn't been processed yet, ignore
          }
        }

        setStats({
          totalCustomers: totalCust,
          rfmSegments: segmentsCount,
          dataUploads: uploadsCount,
          avgMonetary: Math.round(avgMoney),
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadStats();
    }
  }, [user]);

  const statItems = [
    {
      title: "Total Customers",
      value: loading ? "..." : stats.totalCustomers.toLocaleString(),
      icon: Users,
      description: "From latest analysis",
    },
    {
      title: "RFM Segments",
      value: loading ? "..." : stats.rfmSegments.toString(),
      icon: BarChart3,
      description: "Active clusters",
    },
    {
      title: "Data Uploads",
      value: loading ? "..." : stats.dataUploads.toString(),
      icon: Upload,
      description: "Total files uploaded",
    },
    {
      title: "Avg Monetary",
      value: loading ? "..." : "$" + stats.avgMonetary.toLocaleString(),
      icon: TrendingUp,
      description: "Average customer spend",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your RFM analysis dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statItems.map((stat) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-xl p-6 border border-border/40 hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.description}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-xl p-8 border border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Upload Customer Data</h3>
                <p className="text-sm text-muted-foreground">
                  Go to <strong>Upload Data</strong> to submit your CSV or Excel
                  files.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Run RFM Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate to <strong>RFM Analysis</strong>, select your file,
                  and start the process.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">View Customer Segments</h3>
                <p className="text-sm text-muted-foreground">
                  Check <strong>Customer Segments</strong> to see detailed
                  results and stats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
