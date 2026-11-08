import { render, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { getUserRole } from "../services/authService";
import { adminUserFixture, customerUserFixture } from "../test/fixtures";
import { createWrapper, renderWithProviders } from "../test/renderWithProviders";
import type { ProvidersOptions } from "../test/renderWithProviders";
import { AdminRoute } from "./AdminRoute";

const adminArea = (
  <Routes>
    <Route path="/" element={<p>Tienda</p>} />
    <Route path="/login" element={<p>Pantalla de login</p>} />
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <p>Panel de administración</p>
        </AdminRoute>
      }
    />
  </Routes>
);

function visitAdmin(options: ProvidersOptions = {}) {
  return renderWithProviders(adminArea, { route: "/admin", ...options });
}

describe("AdminRoute", () => {
  it("sin sesión, manda al login", async () => {
    visitAdmin();

    expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
    expect(screen.queryByText("Panel de administración")).not.toBeInTheDocument();
  });

  it("un customer no puede ver el panel: vuelve a la tienda", async () => {
    visitAdmin({ user: customerUserFixture, role: "customer" });

    expect(await screen.findByText("Tienda")).toBeInTheDocument();
    expect(screen.queryByText("Panel de administración")).not.toBeInTheDocument();
  });

  it("un admin entra al panel", async () => {
    visitAdmin({ user: adminUserFixture, role: "admin" });

    expect(await screen.findByText("Panel de administración")).toBeInTheDocument();
  });

  it("si no se puede leer el rol, no entra al panel aunque sea admin", async () => {
    const wrapper = createWrapper({ route: "/admin", user: adminUserFixture });
    vi.mocked(getUserRole).mockRejectedValue(new Error("sin conexión"));

    render(adminArea, { wrapper });

    expect(await screen.findByText("Tienda")).toBeInTheDocument();
    expect(screen.queryByText("Panel de administración")).not.toBeInTheDocument();
  });
});
