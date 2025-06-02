import HttpClient from "@/lib/HttpClient";
import env from "@/lib/env";

export interface UpdateProfileRequest {
  full_name: string;
  email: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface ProfileResponse {
  message: string;
  user?: UserProfile;
}

class ProfileApi {
  private httpClient;

  constructor() {
    this.httpClient = HttpClient;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    return await this.httpClient.Put(`${env.BACKEND_URL}/api/v1/auth/profile`, data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<ProfileResponse> {
    return await this.httpClient.Put(`${env.BACKEND_URL}/api/v1/auth/change-password`, data);
  }

  async getProfile(): Promise<UserProfile> {
    return await this.httpClient.Get(`${env.BACKEND_URL}/api/v1/auth/me`);
  }
}

export const profileApi = new ProfileApi();
