export type UserRole = "CREATOR" | "COMPANY" | "ADMIN";

export interface Member {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
