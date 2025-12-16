import { API_BASE_URL, getToken, User } from "./auth";

export interface ProfileResponse {
  profile: User & { created_at: string };
}

export const userApi = {
  async getProfile(): Promise<ProfileResponse> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return response.json();
  },

  async updateProfile(data: {
    username: string;
    email: string;
  }): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Update failed");
    }
  },

  async updatePassword(data: {
    old_password: string;
    new_password: string;
  }): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/user/profile/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Password update failed");
    }
  },

  async deleteAccount(): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete account");
    }
  },
};
