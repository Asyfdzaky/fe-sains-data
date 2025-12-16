import { API_BASE_URL, getToken } from "./auth";

export interface RfmProcessResponse {
  message: string;
  total_customers: number;
  clusters: number;
}

export interface RfmResultItem {
  customer_id: string;
  recency: number;
  frequency: number;
  monetary: number;
  cluster: number;
}

export interface RfmResultsResponse {
  message: string;
  file_id: number;
  total: number;
  data: RfmResultItem[];
}

export interface RfmInsightResponse {
  message: string;
  insight: string;
}

export const rfmApi = {
  async process(fileId: number): Promise<RfmProcessResponse> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/rfm/process/${fileId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Processing failed");
    }

    return response.json();
  },

  async getResults(fileId: number): Promise<RfmResultsResponse> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/rfm/results/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch results");
    }

    return response.json();
  },

  async getInsight(data: {
    cluster: number;
    recency: number;
    frequency: number;
    monetary: number;
    total: number;
    label: string;
  }): Promise<{ data: any }> {
    const token = getToken();
    // Call internal Next.js API route instead of Backend
    const response = await fetch(`/api/insight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization header is not needed for internal route if we don't protect it middleware-side yet,
        // but kept if you want to verify user session in the route (which is good practice).
        // For now, removing Auth header for internal call to simplify, or passing it if route checks it.
        // Let's pass it just in case we add auth check later.
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to fetch insight");
    const jsonData = await response.json();
    // Wrap in 'data' to match the Promise<{ data: any }> return type
    return { data: jsonData };
  },
};
