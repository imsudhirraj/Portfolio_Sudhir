export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  picture?: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  name: string;
  picture?: string;
}
