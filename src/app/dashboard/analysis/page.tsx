"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, FileSpreadsheet, ChevronDown, CheckCircle2 } from "lucide-react";
import { uploadApi, UploadHistoryItem } from "@/lib/api/upload";
import { rfmApi } from "@/lib/api/rfm";
// removed date-fns import

export default function AnalysisPage() {
  const router = useRouter();
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadHistoryItem | null>(
    null
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await uploadApi.getHistory();
      setHistory(data);
      if (data.length > 0) {
        setSelectedFile(data[0]);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      await rfmApi.process(selectedFile.id);
      // store selected file id in local storage or query param to auto-load in segments
      localStorage.setItem(
        "last_processed_file_id",
        selectedFile.id.toString()
      );
      router.push("/dashboard/segments");
    } catch (err: any) {
      setError(err.message || "Processing failed");
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Run Analysis</h1>
        <p className="text-muted-foreground">
          Select a dataset and run the RFM segmentation algorithm.
        </p>
      </div>

      <div className="max-w-xl">
        <Card className="p-6 space-y-6">
          <div className="space-y-3">
            <Label>Select Dataset</Label>
            {isLoadingHistory ? (
              <div className="h-10 bg-muted/50 rounded-md animate-pulse" />
            ) : history.length === 0 ? (
              <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                No datasets found. Please upload data first.
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedFile ? (
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileSpreadsheet className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate">
                          {selectedFile.filename}
                        </span>
                      </div>
                    ) : (
                      "Select a file"
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                  {history.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onSelect={() => setSelectedFile(item)}
                      className="gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4 opacity-50" />
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
            )}
            <p className="text-xs text-muted-foreground">
              Choose from your uploaded files history.
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedFile || isProcessing}
            onClick={handleProcess}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Run RFM Analysis
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
