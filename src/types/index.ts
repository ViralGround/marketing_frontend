export type UserRole = "CREATOR" | "ADMIN";

export interface Member {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface Content {
  id: number;
  title: string;
  body: string;
  status: "DRAFT" | "PUBLISHED";
  author: Member;
  createdAt: string;
  updatedAt: string;
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

export interface ContentRequest {
  title: string;
  body: string;
  status: "DRAFT" | "PUBLISHED";
}
