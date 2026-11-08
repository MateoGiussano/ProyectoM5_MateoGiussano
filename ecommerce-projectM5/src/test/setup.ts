import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("../services/firebase", () => ({ auth: { currentUser: null }, db: {} }));

vi.mock("../services/authService", () => ({
  subscribeToAuthChanges: vi.fn((callback: (user: null) => void) => {
    callback(null);
    return () => {};
  }),
  getUserRole: vi.fn(),
}));

afterEach(() => {
  cleanup();
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
  vi.resetAllMocks();
});
