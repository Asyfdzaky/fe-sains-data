"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { uploadApi, UploadHistoryItem } from "@/lib/api/upload";
import { rfmApi } from "@/lib/api/rfm";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const REQUIRED_COLUMNS = [
  "CustomerID",
  "InvoiceNo",
  "InvoiceDate",
  "Quantity",
  "UnitPrice",
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Preview State
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await uploadApi.getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      await parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    setPreviewData([]);
    setPreviewColumns([]);
    setMissingColumns([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

      if (jsonData.length === 0) {
        setError("File appears to be empty.");
        return;
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1, 6) as any[]; // Preview first 5 rows

      setPreviewColumns(headers);
      setPreviewData(rows);

      // Validate Columns
      const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
      setMissingColumns(missing);
    } catch (err) {
      console.error("Parse error:", err);
      setError(
        "Failed to parse file for preview. Please ensure it is a valid Excel or CSV file."
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    if (missingColumns.length > 0) {
      if (
        !confirm(
          `Missing columns: ${missingColumns.join(", ")}. Upload anyway?`
        )
      ) {
        return;
      }
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    // Two-step process: Upload -> Process with AI/RFM
    try {
      // 1. Upload
      const uploadResp = await uploadApi.uploadFile(file);

      // 2. Process
      // We start processing immediately
      setIsUploading(true); // Keep loading true
      // Maybe add a specific 'processing' state if we want to change text dynamically,
      // but for now we can just rely on the UI checking isUploading

      // We will show "Processing" text in the button by checking isUploading
      // Note: In a real app we might want separate states, but let's keep it simple.

      await rfmApi.process(uploadResp.upload_id);

      // Save ID for auto-selection in segments page
      localStorage.setItem(
        "last_processed_file_id",
        uploadResp.upload_id.toString()
      );

      setSuccess("File uploaded and processed successfully! Redirecting...");

      // Redirect to results
      setTimeout(() => {
        window.location.href = "/dashboard/segments";
      }, 1500);

      setFile(null);
      setPreviewData([]);
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      loadHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Operation failed. Please try again.");
    } finally {
      // Only stop loading if we failed (because success redirects)
      // or if we decide not to redirect immediately.
      // But we set a timeout for redirect, so we can clear it.
      // Ideally we keep it true until redirect, but if error happens we must clear.

      // Logic: If error is set, clear loading. If success, keep loading until redirect?
      // Actually safe to always clear for now, the toast/success message persists.
      // But button re-enables. Let's keep it simple.
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Data</h1>
        <p className="text-muted-foreground">
          Upload your customer transaction data (CSV or XLSX) to begin analysis.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Form */}
        <div>
          <Card className="p-6">
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: .csv, .xlsx. Required headers: CustomerID,
                  InvoiceNo, InvoiceDate, Quantity, UnitPrice.
                </p>
              </div>

              {/* Preview Section */}
              {file && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4" />
                    File Preview
                  </div>

                  {isParsing ? (
                    <div className="text-sm text-muted-foreground">
                      Parsing file...
                    </div>
                  ) : (
                    <>
                      {/* Validation Warning */}
                      {missingColumns.length > 0 ? (
                        <div className="p-3 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 rounded-md text-sm border border-amber-200 dark:border-amber-900 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold">
                              Missing Columns:
                            </span>{" "}
                            {missingColumns.join(", ")}
                            <br />
                            <span className="text-xs opacity-90">
                              Analysis may fail without these columns.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" /> All required
                          columns found.
                        </div>
                      )}

                      {/* Data Table */}
                      {previewColumns.length > 0 && (
                        <div className="mt-2 text-xs overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                {previewColumns.map((col, i) => (
                                  <th
                                    key={i}
                                    className="text-left p-1 text-muted-foreground font-medium whitespace-nowrap"
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.map((row, i) => (
                                <tr
                                  key={i}
                                  className="border-b last:border-0 hover:bg-muted/50"
                                >
                                  {previewColumns.map((col, j) => (
                                    <td
                                      key={j}
                                      className="p-1 whitespace-nowrap max-w-[150px] truncate"
                                    >
                                      {row[j]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                            {/* Simple table for preview, lighter than the component */}
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!file || isUploading || isParsing}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Processing Data (this may take a minute)...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload & Process
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* History List */}
        <div>
          <Card className="p-6 h-full">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Upload History
            </h2>

            {isLoadingHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                <Upload className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No uploads yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[200px] sm:max-w-md">
                          {item.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {item.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {item.uploaded_at
                        ? new Date(item.uploaded_at).toLocaleDateString() +
                          " " +
                          new Date(item.uploaded_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown date"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
