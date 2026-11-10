import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { MainLayout } from "../components/layouts/MainLayout";
import { AdminLayout } from "../components/layouts/AdminLayout";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartPage } from "../pages/CartPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { OrdersPage } from "../pages/OrdersPage";
import { OrderDetailPage } from "../pages/OrderDetailPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "../pages/admin/AdminProductFormPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminAnalyticsPage } from "../pages/admin/AdminAnalyticsPage";
import { AdminProductsProvider } from "../providers/AdminProductsProvider";

export function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Tienda (layout con el Header de la tienda) ---------- */}
      <Route element={<MainLayout />}>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />

        {/* Rutas que requieren sesión */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Cualquier otra dirección: página 404 (siempre al final) */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ---------- Panel admin (layout propio, protegido UNA sola vez) ---------- */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminProductsProvider>
              <AdminLayout />
            </AdminProductsProvider>
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>
    </Routes>
  );
}
