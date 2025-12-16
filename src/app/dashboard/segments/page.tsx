"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSpreadsheet,
  ChevronDown,
  TrendingUp,
  Users,
  Lightbulb,
  Sparkles,
  BarChart3,
  Loader2,
  List,
} from "lucide-react";
import { uploadApi, UploadHistoryItem } from "@/lib/api/upload";
import { rfmApi, RfmResultItem } from "@/lib/api/rfm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

// Fixed labels as requested
const DEFAULT_INSIGHTS: Record<number, string> = {
  0: "Hibernating/Lost",
  1: "Champions/Loyal",
  2: "Potential Loyalists",
  3: "New/At Risk",
  4: "Big Spenders",
};

export default function SegmentsPage() {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadHistoryItem | null>(
    null
  );
  const [results, setResults] = useState<RfmResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeClusters, setActiveClusters] = useState<number[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // AI State
  const [aiInsights, setAiInsights] = useState<Record<number, any>>({});
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      loadResults(selectedFile.id);
    }
  }, [selectedFile]);

  const loadHistory = async () => {
    try {
      const data = await uploadApi.getHistory();
      setHistory(data);

      const lastId = localStorage.getItem("last_processed_file_id");
      if (lastId) {
        const found = data.find((f) => f.id === parseInt(lastId));
        if (found) {
          setSelectedFile(found);
          return;
        }
      }
      if (data.length > 0) setSelectedFile(data[0]);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const loadResults = async (fileId: number) => {
    setIsLoading(true);
    setAiInsights({}); // Reset AI insights on new file
    try {
      const resp = await rfmApi.getResults(fileId);
      setResults(resp.data);
      calculateStats(resp.data);
    } catch (err) {
      console.error("Failed to results", err);
      setResults([]);
      setStats(null);
      setActiveClusters([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: RfmResultItem[]) => {
    const total = data.length;
    const uniqueClusters = Array.from(
      new Set(data.map((d) => d.cluster))
    ).sort();
    const clustersCount = uniqueClusters.length;
    const avgMonetary =
      data.reduce((acc, curr) => acc + curr.monetary, 0) / (total || 1);

    const cData = uniqueClusters.map((clusterId) => {
      const count = data.filter((d) => d.cluster === clusterId).length;
      return {
        name: `Cluster ${clusterId}`,
        count: count,
        label: DEFAULT_INSIGHTS[clusterId] || `Cluster ${clusterId}`,
      };
    });
    setChartData(cData);

    setStats({
      total,
      clusters: clustersCount,
      avgMonetary: parseInt(avgMonetary.toFixed(0)),
    });
    setActiveClusters(uniqueClusters);
  };

  const generateAllInsights = async () => {
    if (activeClusters.length === 0) return;

    setIsGeneratingAi(true);
    const newInsights: Record<number, any> = {};

    try {
      // Process clusters in parallel
      const promises = activeClusters.map(async (clusterId) => {
        const clusterData = results.filter((r) => r.cluster === clusterId);
        const total = clusterData.length;
        const avgR =
          clusterData.reduce((acc, curr) => acc + curr.recency, 0) / total;
        const avgF =
          clusterData.reduce((acc, curr) => acc + curr.frequency, 0) / total;
        const avgM =
          clusterData.reduce((acc, curr) => acc + curr.monetary, 0) / total;

        try {
          const response = await rfmApi.getInsight({
            cluster: clusterId,
            recency: avgR,
            frequency: avgF,
            monetary: avgM,
            total: total,
            label: DEFAULT_INSIGHTS[clusterId] || `Cluster ${clusterId}`,
          });
          newInsights[clusterId] = response.data;
        } catch (e) {
          console.error(`Failed insights for cluster ${clusterId}`, e);
        }
      });

      await Promise.all(promises);
      setAiInsights((prev) => ({ ...prev, ...newInsights }));
    } catch (err) {
      console.error("Bulk AI Error", err);
      alert("Failed to generate some insights. Please try again.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header and File Select */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Customer Segments
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View RFM analysis results, charts, and AI-powered insights.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full md:w-auto min-w-[200px] justify-between"
            >
              {selectedFile ? (
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileSpreadsheet className="h-4 w-4 shrink-0 opacity-50" />
                  <span className="truncate">{selectedFile.filename}</span>
                </div>
              ) : (
                "Select a file"
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            {history.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => setSelectedFile(item)}
                className="gap-2"
              >
                <span className="flex-1 truncate">{item.filename}</span>
                <span className="text-xs text-muted-foreground">
                  {item.uploaded_at
                    ? new Date(item.uploaded_at).toLocaleDateString()
                    : ""}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {stats && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Clusters Found
                </p>
                <h3 className="text-2xl font-bold">{stats.clusters}</h3>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
                <span className="text-lg font-bold">$</span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Monetary
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.avgMonetary.toLocaleString()}
                </h3>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Customer Distribution
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0} // Force show all labels
                      angle={-45} // Tilt if needed for mobile
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {activeClusters.map((clusterId, i) => (
                  <div
                    key={clusterId}
                    className="flex items-center gap-1.5 text-xs bg-secondary/50 px-2 py-1 rounded"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {DEFAULT_INSIGHTS[clusterId] || `Cluster ${clusterId}`}
                  </div>
                ))}
              </div>
            </Card>

            {/* Single AI Report Card */}
            <Card className="flex flex-col h-full border-primary/20 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>AI Strategy Analysis</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    onClick={generateAllInsights}
                    disabled={isGeneratingAi || activeClusters.length === 0}
                    className="gap-2"
                  >
                    {isGeneratingAi ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lightbulb className="h-4 w-4" />
                    )}
                    {isGeneratingAi ? "Generating..." : "Generate Analysis"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto max-h-[400px] p-0">
                {Object.keys(aiInsights).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground gap-3">
                    <div className="p-4 rounded-full bg-secondary">
                      <Sparkles className="h-8 w-8 opacity-20" />
                    </div>
                    <p>
                      Click "Generate Analysis" to receive comprehensive
                      marketing strategies for all customer segments.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activeClusters.map((clusterId) => {
                      const insight = aiInsights[clusterId];
                      if (!insight) return null; // Should not happen if keys check passed, but safe

                      return (
                        <div
                          key={clusterId}
                          className="p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                              Cluster {clusterId}
                            </span>
                            <h4 className="font-semibold text-primary">
                              {DEFAULT_INSIGHTS[clusterId] ||
                                `Cluster ${clusterId}`}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.insight}
                          </p>
                          <div className="bg-primary/5 p-3 rounded text-sm border border-primary/10">
                            <span className="font-bold text-xs uppercase text-primary/70 block mb-1">
                              Strategy
                            </span>
                            {insight.strategy}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Detailed Results Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Detailed Results</h2>
        </div>
        <div className="relative w-full overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading results...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {selectedFile
                ? "No results found for this file. Try running analysis first."
                : "Select a file to view results."}
            </div>
          ) : (
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Recency (days)</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Monetary</TableHead>
                    <TableHead>Cluster</TableHead>
                    <TableHead>Segment Label</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, 100).map((row, i) => {
                    const insight = aiInsights[row.cluster];
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {row.customer_id}
                        </TableCell>
                        <TableCell>{row.recency}</TableCell>
                        <TableCell>{row.frequency}</TableCell>
                        <TableCell>{row.monetary.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            Cl {row.cluster}
                          </span>
                        </TableCell>
                        <TableCell>
                          {insight ? (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                              {DEFAULT_INSIGHTS[row.cluster] ||
                                `Cluster ${row.cluster}`}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              -
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {results.length > 100 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              Showing first 100 of {results.length} records.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
