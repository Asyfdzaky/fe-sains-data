import { API_BASE_URL, getToken } from "./auth";

export interface UploadResponse {
  message: string;
  upload_id: number;
  filename: string;
}

export interface UploadHistoryItem {
  id: number;
  filename: string;
  uploaded_at: string;
}

export const uploadApi = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    return response.json();
  },

  async getHistory(): Promise<UploadHistoryItem[]> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If 404, it might just mean no history, but let's throw for now to be safe or return empty?
      // Backend returns list, so 200 [] if empty.
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch history");
    }

    return response.json();
  },
};
