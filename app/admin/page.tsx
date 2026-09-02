"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  Settings,
  BarChart3,
  ClipboardList,
  Archive,
  Zap,
  ShoppingBag,
  CircleAlert,
  DollarSign,
  Package,
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
import LanguageSwitcher from "@/components/store/LanguageSwitcher";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/i18n";
import { useTelegramUser } from "@/lib/useTelegramUser";
import { apiGet } from "@/lib/apiClient";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";
import type { StoreSettings } from "@/types/settings";

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

interface DashboardAnalytics {
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  inventoryValue: number;
}

interface ActivityItem {
  id: string;
  type: "order" | "stock" | "alert";
  title: string;
  description: string;
  time: string;
  dotColor: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function AdminPage() {
  useTelegramUser();
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [view, setView] = useState<AdminView>("menu");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [listKey, setListKey] = useState(0);

  const [storeName, setStoreName] = useState("Haben Tech");
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    apiGet<{ settings: StoreSettings | null }>("/api/settings")
      .then((res) => {
        if (res.settings?.store_name) setStoreName(res.settings.store_name);
      })
      .catch(() => {});

    apiGet<{ totalProducts: number; pendingOrders: number; lowStockProducts: number; inventoryValue: number }>("/api/analytics")
      .then(setAnalytics)
      .catch(() => {});

    apiGet<{ orders: Order[] }>("/api/orders")
      .then((res) => {
        const orders = (res.orders ?? []).slice(0, 5);
        const items: ActivityItem[] = orders.map((o) => ({
          id: o.id,
          type: "order" as const,
          title: `New order #${o.id.slice(0, 8)}`,
          description: o.product
            ? `${o.quantity}x ${o.product.name} \u2022 ${o.status}`
            : `${o.quantity} item(s) \u2022 ${o.status}`,
          time: formatRelativeTime(o.created_at),
          dotColor: o.status === "Pending" ? "blue" : o.status === "Completed" ? "green" : o.status === "Cancelled" ? "red" : "amber",
        }));
        setActivity(items);
      })
      .catch(() => {});
  }, []);

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
        {view === "menu" ? (
          <div className="admin-dashboard">
            <div className="admin-welcome">
              <div className="admin-welcome__top">
                <div className="admin-welcome__brand">
                  <div className="admin-welcome__logo">
                    <Zap size={22} strokeWidth={2} />
                  </div>
                  <p className="admin-welcome__store-name">{storeName}</p>
                </div>
                <LanguageSwitcher surface="admin" />
              </div>
              <div className="admin-welcome__message">
                <h1 className="admin-welcome__greeting">Welcome back, Admin 👋</h1>
                <p className="admin-welcome__subtitle">
                  You have{" "}
                  <strong>{analytics?.pendingOrders ?? "\u2014"} pending orders</strong>{" "}
                  to review today.
                </p>
              </div>
            </div>

            <div>
              <div className="admin-section-header">
                <h2 className="admin-section-title">Key Analytics</h2>
              </div>
              <div className="admin-dashboard-analytics" style={{ marginTop: 16 }}>
                <div className="admin-dashboard-stat">
                  <div className="admin-dashboard-stat__header">
                    <div className="admin-dashboard-stat__icon admin-dashboard-stat__icon--primary">
                      <Package size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <p className="admin-dashboard-stat__value">{analytics?.totalProducts ?? "\u2014"}</p>
                  <p className="admin-dashboard-stat__label">Total Products</p>
                </div>

                <div className="admin-dashboard-stat">
                  <div className="admin-dashboard-stat__header">
                    <div className="admin-dashboard-stat__icon admin-dashboard-stat__icon--warning">
                      <ShoppingBag size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <p className="admin-dashboard-stat__value">{analytics?.pendingOrders ?? "\u2014"}</p>
                  <p className="admin-dashboard-stat__label">Pending Orders</p>
                </div>

                <div className="admin-dashboard-stat">
                  <div className="admin-dashboard-stat__header">
                    <div className="admin-dashboard-stat__icon admin-dashboard-stat__icon--danger">
                      <CircleAlert size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <p className="admin-dashboard-stat__value">{analytics?.lowStockProducts ?? "\u2014"}</p>
                  <p className="admin-dashboard-stat__label">Low Stock Alerts</p>
                  {analytics && analytics.lowStockProducts > 0 && (
                    <span className="admin-dashboard-stat__change admin-dashboard-stat__change--neutral">Check</span>
                  )}
                </div>

                <div className="admin-dashboard-stat">
                  <div className="admin-dashboard-stat__header">
                    <div className="admin-dashboard-stat__icon admin-dashboard-stat__icon--teal">
                      <DollarSign size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <p className="admin-dashboard-stat__value">
                    {analytics?.inventoryValue != null ? formatPrice(analytics.inventoryValue) : "\u2014"}
                  </p>
                  <p className="admin-dashboard-stat__label">Revenue Today</p>
                </div>
              </div>
            </div>

            <div>
              <div className="admin-section-header">
                <h2 className="admin-section-title">Quick Actions</h2>
              </div>
              <div className="admin-grid" style={{ marginTop: 16 }}>
                <AdminActionCard
                  icon={Plus}
                  label={t("admin.addProduct")}
                  description="New electronics"
                  tone="accent"
                  onClick={() => goTo("add-product")}
                />
                <AdminActionCard
                  icon={ClipboardList}
                  label={t("admin.orders")}
                  description="Review queue"
                  tone="primary"
                  badge={analytics?.pendingOrders}
                  onClick={() => goTo("orders")}
                />
                <AdminActionCard
                  icon={Archive}
                  label={t("admin.stock")}
                  description="Update counts"
                  tone="accent"
                  onClick={() => goTo("stock")}
                />
                <AdminActionCard
                  icon={MessageSquare}
                  label={t("admin.requests")}
                  description="User inquiries"
                  tone="warning"
                  onClick={() => goTo("requests")}
                />
                <AdminActionCard
                  icon={BarChart3}
                  label={t("admin.analytics")}
                  description="Shop performance"
                  tone="success"
                  onClick={() => goTo("analytics")}
                />
                <AdminActionCard
                  icon={Settings}
                  label={t("admin.settings")}
                  description="Configurations"
                  tone="primary"
                  onClick={() => goTo("settings")}
                />
              </div>
            </div>

            <div>
              <div className="admin-section-header">
                <h2 className="admin-section-title">Recent Activity</h2>
              </div>
              <div className="admin-activity" style={{ marginTop: 16 }}>
                {activity.length === 0 ? (
                  <div className="admin-activity__empty">No recent activity</div>
                ) : (
                  activity.map((item) => (
                    <div className="admin-activity__item" key={item.id}>
                      <div className={`admin-activity__dot admin-activity__dot--${item.dotColor}`} />
                      <div className="admin-activity__body">
                        <p className="admin-activity__title">{item.title}</p>
                        <p className="admin-activity__desc">{item.description}</p>
                      </div>
                      <span className="admin-activity__time">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <AdminNavigation
              title={t(VIEW_TITLES[view])}
              onBack={handleBack}
            />

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
          </>
        )}
      </div>
    </AdminGate>
  );
}
