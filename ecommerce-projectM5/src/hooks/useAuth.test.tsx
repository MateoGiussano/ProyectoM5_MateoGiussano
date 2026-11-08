import { act, renderHook, waitFor } from "@testing-library/react";
import type { User as FirebaseUser } from "firebase/auth";
import { describe, expect, it, vi } from "vitest";
import { getUserRole, subscribeToAuthChanges } from "../services/authService";
import { adminUserFixture, customerUserFixture } from "../test/fixtures";
import { createWrapper } from "../test/renderWithProviders";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  it("sin sesión: no hay usuario ni rol", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it("con un admin logueado: expone el usuario y el rol admin", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper({ user: adminUserFixture, role: "admin" }),
    });

    await waitFor(() => expect(result.current.role).toBe("admin"));
    expect(result.current.user?.uid).toBe("u_admin");
    expect(result.current.loading).toBe(false);
  });

  it("si falla la lectura del rol, el usuario queda como customer", async () => {
    const wrapper = createWrapper({ user: customerUserFixture });
    vi.mocked(getUserRole).mockRejectedValue(new Error("sin conexión"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.role).toBe("customer");
  });

  it("cuando la sesión se cierra o vence, se queda sin usuario", async () => {
    let notifyAuthChange: (user: FirebaseUser | null) => void = () => {};
    const wrapper = createWrapper({ role: "admin" });
    vi.mocked(subscribeToAuthChanges).mockImplementation((callback) => {
      notifyAuthChange = callback;
      callback(adminUserFixture);
      return () => {};
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.role).toBe("admin"));

    await act(async () => {
      notifyAuthChange(null);
    });

    await waitFor(() => expect(result.current.user).toBeNull());
    expect(result.current.role).toBeNull();
  });
});
