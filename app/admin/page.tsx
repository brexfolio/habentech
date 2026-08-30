"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  PlusCircle,
  ShoppingCart,
  MessageSquareText,
  PencilLine,
  Boxes,
  BarChart3,
  Star,
  Settings,
  Smartphone,
  Warehouse,
} from "lucide-react";
import AdminGate from "@/components/admin/AdminGate";
import AdminNavigation from "@/components/admin/AdminNavigation";
import AdminActionCard from "@/components/admin/AdminActionCard";
import ProductForm from "@/components/admin/ProductForm";
import ProductList from "@/components/admin/ProductList";
import OrdersList from "@/components/admin/OrdersList";
import RequestsList from "@/components/admin/RequestsList";
import AnalyticsCards from "@/components/admin/AnalyticsCards";
import SettingsForm from "@/components/admin/SettingsForm";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/i18n";
import { useTelegramUser } from "@/lib/useTelegramUser";
import type { Product } from "@/types/product";

type AdminView =
  | "menu"
  | "products"
  | "add-product"
  | "edit-product"
  | "orders"
  | "requests"
  | "stock"
  | "analytics"
  | "featured"
  | "settings";

const VIEW_TITLES: Record<AdminView, string> = {
  menu: "admin.menu.title",
  products: "admin.products",
  "add-product": "admin.addProduct",
  "edit-product": "admin.editProduct",
  orders: "admin.orders",
  requests: "admin.requests",
  stock: "admin.stock",
  analytics: "admin.analytics",
  featured: "admin.featured",
  settings: "admin.settings",
};

export default function AdminPage() {
  useTelegramUser();
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [view, setView] = useState<AdminView>("menu");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [listKey, setListKey] = useState(0);

  function goTo(next: AdminView) {
    setView(next);
  }

  function handleBack() {
    if (view === "edit-product") {
      setView("products");
      setEditingProduct(null);
      return;
    }
    setView("menu");
  }

  function handleProductSaved(_product: Product, channelWarning: string | null) {
    showToast(channelWarning ? "warning" : "success", channelWarning ?? "Product saved successfully.");
    setListKey((k) => k + 1);
    setEditingProduct(null);
    setView("products");
  }

  return (
    <AdminGate>
      <div className="admin-shell">
        <AdminNavigation
          title={t(VIEW_TITLES[view])}
          subtitle={view === "menu" ? t("admin.menu.subtitle") : undefined}
          onBack={view === "menu" ? undefined : handleBack}
        />

        {view === "menu" && (
          <div className="admin-grid">
            <AdminActionCard
              icon={Package}
              label={t("admin.products")}
              description={t("admin.card.viewProducts")}
              onClick={() => goTo("products")}
            />
            <AdminActionCard
              icon={PlusCircle}
              label={t("admin.addProduct")}
              description={t("admin.card.publishProduct")}
              tone="accent"
              onClick={() => goTo("add-product")}
            />
            <AdminActionCard
              icon={ShoppingCart}
              label={t("admin.orders")}
              description={t("admin.card.trackOrders")}
              tone="success"
              onClick={() => goTo("orders")}
            />
            <AdminActionCard
              icon={MessageSquareText}
              label={t("admin.requests")}
              description={t("admin.card.respondRequests")}
              tone="warning"
              onClick={() => goTo("requests")}
            />
            <AdminActionCard
              icon={Smartphone}
              label={t("admin.sellRequests")}
              description={t("admin.card.reviewDevices")}
              tone="accent"
              onClick={() => router.push("/admin/sell-requests")}
            />
            <AdminActionCard
              icon={PencilLine}
              label={t("admin.editProduct")}
              description={t("admin.card.updateProducts")}
              onClick={() => goTo("products")}
            />
            <AdminActionCard
              icon={Boxes}
              label={t("admin.stock")}
              description={t("admin.card.updateAvailability")}
              tone="accent"
              onClick={() => goTo("stock")}
            />
            <AdminActionCard
              icon={Warehouse}
              label={t("admin.inventory")}
              description={t("admin.card.stockHistory")}
              tone="success"
              onClick={() => router.push("/admin/inventory")}
            />
            <AdminActionCard
              icon={BarChart3}
              label={t("admin.analytics")}
              description={t("admin.card.performance")}
              tone="success"
              onClick={() => goTo("analytics")}
            />
            <AdminActionCard
              icon={Star}
              label={t("admin.featured")}
              description={t("admin.card.highlightProducts")}
              tone="warning"
              onClick={() => goTo("featured")}
            />
            <AdminActionCard
              icon={Settings}
              label={t("admin.settings")}
              description={t("admin.card.profileChannel")}
              onClick={() => goTo("settings")}
            />
          </div>
        )}

        {view === "products" && (
          <ProductList
            key={listKey}
            mode="manage"
            onEdit={(product) => {
              setEditingProduct(product);
              setView("edit-product");
            }}
          />
        )}

        {view === "add-product" && (
          <ProductForm onSaved={handleProductSaved} onCancel={() => setView("menu")} />
        )}

        {view === "edit-product" && editingProduct && (
          <ProductForm
            product={editingProduct}
            onSaved={handleProductSaved}
            onCancel={() => {
              setEditingProduct(null);
              setView("products");
            }}
          />
        )}

        {view === "orders" && <OrdersList />}
        {view === "requests" && <RequestsList />}
        {view === "stock" && <ProductList key={listKey} mode="stock" />}
        {view === "analytics" && <AnalyticsCards />}
        {view === "featured" && <ProductList key={listKey} mode="featured" />}
        {view === "settings" && <SettingsForm />}
      </div>
    </AdminGate>
  );
}
