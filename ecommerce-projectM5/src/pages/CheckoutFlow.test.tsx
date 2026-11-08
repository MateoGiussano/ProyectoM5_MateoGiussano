import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppRoutes } from "../routes/AppRoutes";
import { createOrder } from "../services/orderService";
import { getProductById } from "../services/productService";
import { customerUserFixture, productFixture } from "../test/fixtures";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../services/productService", () => ({ getProductById: vi.fn(), getProducts: vi.fn() }));
vi.mock("../services/orderService", () => ({ createOrder: vi.fn() }));

function cartIcon() {
  return within(screen.getByRole("banner")).getByRole("link", { name: /ver carrito/i });
}

async function addProductAndGoToCheckout() {
  const user = userEvent.setup();
  vi.mocked(getProductById).mockResolvedValue(productFixture);
  renderWithProviders(<AppRoutes />, {
    route: `/products/${productFixture.id}`,
    user: customerUserFixture,
  });

  await user.click(await screen.findByRole("button", { name: /agregar al carrito/i }));
  expect(cartIcon()).toHaveTextContent("1");

  await user.click(cartIcon());
  await user.click(await screen.findByRole("link", { name: /finalizar compra/i }));

  return user;
}

describe("flujo de compra", () => {
  it("agregar al carrito y confirmar crea UNA sola orden y vacía el carrito", async () => {
    const user = await addProductAndGoToCheckout();
    let finishOrder: (orderId: string) => void = () => {};
    vi.mocked(createOrder).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishOrder = resolve;
        }),
    );

    const confirmButton = await screen.findByRole("button", { name: /confirmar compra/i });
    await user.click(confirmButton);
    await user.click(confirmButton);
    await act(async () => finishOrder("orden_123"));

    expect(await screen.findByText(/compra confirmada/i)).toBeInTheDocument();
    expect(screen.getByText("orden_123")).toBeInTheDocument();
    expect(cartIcon()).not.toHaveTextContent("1");
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(createOrder).toHaveBeenCalledWith(customerUserFixture.uid, customerUserFixture.email, [
      expect.objectContaining({ product: productFixture, quantity: 1 }),
    ]);
  });

  it("si falla la compra, avisa y el carrito queda intacto", async () => {
    const user = await addProductAndGoToCheckout();
    vi.mocked(createOrder).mockRejectedValue(new Error("sin conexión"));

    await user.click(await screen.findByRole("button", { name: /confirmar compra/i }));

    expect(await screen.findByText(/no pudimos confirmar tu compra/i)).toBeInTheDocument();
    expect(cartIcon()).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: /confirmar compra/i })).toBeEnabled();
  });
});
