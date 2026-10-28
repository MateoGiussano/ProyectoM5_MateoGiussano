export type UserRole = "customer" | "admin";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}
