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
  menu: "Admin Dashboard",
  products: "Products",
  "add-product": "Add Product",
  "edit-product": "Edit Product",
  orders: "Orders",
  requests: "Requests",
  stock: "Manage Stock",
  analytics: "Analytics",
  featured: "Featured Products",
  settings: "Settings",
};

export default function AdminPage() {
  useTelegramUser();
  const router = useRouter();
  const { showToast } = useToast();

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
          title={VIEW_TITLES[view]}
          subtitle={view === "menu" ? "Manage your electronics store" : undefined}
          onBack={view === "menu" ? undefined : handleBack}
        />

        {view === "menu" && (
          <div className="admin-grid">
            <AdminActionCard
              icon={Package}
              label="Products"
              description="View and manage all products"
              onClick={() => goTo("products")}
            />
            <AdminActionCard
              icon={PlusCircle}
              label="Add Product"
              description="Publish a new product"
              tone="accent"
              onClick={() => goTo("add-product")}
            />
            <AdminActionCard
              icon={ShoppingCart}
              label="Orders"
              description="Track customer orders"
              tone="success"
              onClick={() => goTo("orders")}
            />
            <AdminActionCard
              icon={MessageSquareText}
              label="Requests"
              description="Respond to product requests"
              tone="warning"
              onClick={() => goTo("requests")}
            />
            <AdminActionCard
              icon={Smartphone}
              label="Sell Requests"
              description="Review customer devices for sale"
              tone="accent"
              onClick={() => router.push("/admin/sell-requests")}
            />
            <AdminActionCard
              icon={PencilLine}
              label="Edit Product"
              description="Update product details"
              onClick={() => goTo("products")}
            />
            <AdminActionCard
              icon={Boxes}
              label="Manage Stock"
              description="Update product availability"
              tone="accent"
              onClick={() => goTo("stock")}
            />
            <AdminActionCard
              icon={Warehouse}
              label="Inventory"
              description="Quantities, cost & stock history"
              tone="success"
              onClick={() => router.push("/admin/inventory")}
            />
            <AdminActionCard
              icon={BarChart3}
              label="Analytics"
              description="Store performance at a glance"
              tone="success"
              onClick={() => goTo("analytics")}
            />
            <AdminActionCard
              icon={Star}
              label="Featured Products"
              description="Highlight products on the store"
              tone="warning"
              onClick={() => goTo("featured")}
            />
            <AdminActionCard
              icon={Settings}
              label="Settings"
              description="Store profile & channel"
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
