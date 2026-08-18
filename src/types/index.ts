export type UserRole = "CREATOR" | "COMPANY" | "ADMIN";

export interface Member {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}
