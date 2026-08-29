"use client";

import { useCallback, useEffect, useState } from "react";
import { Package, Pencil, Trash2, Send, Star, ImageOff } from "lucide-react";
import { apiGet, apiDelete, apiPatch, apiPost, ApiError } from "@/lib/apiClient";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { PRODUCT_AVAILABILITIES, type Product, type ProductAvailability } from "@/types/product";

interface ProductListProps {
  mode: "manage" | "stock" | "featured";
  onEdit?: (product: Product) => void;
}

export default function ProductList({ mode, onEdit }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [removeChannelPost, setRemoveChannelPost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    apiGet<{ products: Product[] }>("/api/products")
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleAvailabilityChange(product: Product, availability: ProductAvailability) {
    const previous = products;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, availability } : p)));
    try {
      await apiPatch(`/api/products/${product.id}`, { availability });
      showToast("success", `${product.name} marked as ${availability}.`);
    } catch (error) {
      setProducts(previous);
      showToast("error", error instanceof ApiError ? error.message : "Unable to update availability.");
    }
  }

  async function handleFeaturedToggle(product: Product) {
    const nextFeatured = !product.featured;
    const previous = products;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, featured: nextFeatured } : p)));
    try {
      await apiPatch(`/api/products/${product.id}`, { featured: nextFeatured });
      showToast("success", nextFeatured ? `${product.name} is now featured.` : `${product.name} removed from featured.`);
    } catch (error) {
      setProducts(previous);
      showToast("error", error instanceof ApiError ? error.message : "Unable to update product.");
    }
  }

  async function handlePublish(product: Product) {
    setPublishingId(product.id);
    try {
      const result = await apiPost<{ product: Product }>(`/api/products/${product.id}/publish-channel`);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? result.product : p)));
      showToast("success", "Product published to the Telegram channel.");
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Unable to publish to the channel.");
    } finally {
      setPublishingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const query = removeChannelPost ? "?remove_channel_post=true" : "";
      await apiDelete(`/api/products/${pendingDelete.id}${query}`);
      setProducts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      showToast("success", "Product deleted.");
      setPendingDelete(null);
      setRemoveChannelPost(false);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Unable to delete product.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="loading-page">
        <Spinner surface="admin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        surface="admin"
        icon={<Package size={24} />}
        title="No products yet."
        description="Add your first product to get started."
      />
    );
  }

  return (
    <>
      <div className="admin-list">
        {products.map((product) => (
          <div className="admin-list-item" key={product.id}>
            <div className="admin-list-item__top">
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "var(--admin-surface-alt)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageOff size={16} color="var(--admin-text-muted)" />
                  )}
                </div>
                <div>
                  <p className="admin-list-item__title">{product.name}</p>
                  <p className="admin-list-item__subtitle">
                    {product.category} · {formatPrice(product.price, product.currency)}
                  </p>
                </div>
              </div>
              <span className={`admin-badge admin-badge--${product.availability.toLowerCase().replace(" ", "-")}`}>
                {product.availability}
              </span>
            </div>

            <div className="admin-list-item__meta-row">
              {product.featured && <span className="admin-badge admin-badge--featured">Featured</span>}
              <span className={`admin-badge ${product.channel_published ? "admin-badge--completed" : "admin-badge--muted"}`}>
                {product.channel_published ? "Published to channel" : "Not published"}
              </span>
            </div>

            {mode === "stock" ? (
              <Select
                surface="admin"
                aria-label="Update availability"
                value={product.availability}
                onChange={(e) => handleAvailabilityChange(product, e.target.value as ProductAvailability)}
                options={PRODUCT_AVAILABILITIES.map((a) => ({ value: a, label: a }))}
              />
            ) : mode === "featured" ? (
              <Button
                surface="admin"
                variant={product.featured ? "secondary" : "primary"}
                size="sm"
                onClick={() => handleFeaturedToggle(product)}
              >
                <Star size={14} fill={product.featured ? "currentColor" : "none"} />
                {product.featured ? "Remove from Featured" : "Mark as Featured"}
              </Button>
            ) : (
              <div className="admin-list-item__actions">
                <Button surface="admin" variant="secondary" size="sm" onClick={() => onEdit?.(product)}>
                  <Pencil size={14} />
                  Edit
                </Button>
                {!product.channel_published && (
                  <Button
                    surface="admin"
                    variant="secondary"
                    size="sm"
                    loading={publishingId === product.id}
                    onClick={() => handlePublish(product)}
                  >
                    <Send size={14} />
                    Publish to Channel
                  </Button>
                )}
                <Button
                  surface="admin"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setPendingDelete(product);
                    setRemoveChannelPost(false);
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete Product"
        surface="admin"
        footer={
          <>
            <Button surface="admin" variant="secondary" block onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button surface="admin" variant="danger" block loading={isDeleting} onClick={confirmDelete}>
              Delete Product
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{pendingDelete?.name}</strong>? This cannot be undone.
        </p>
        {pendingDelete?.channel_published && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
            <input
              type="checkbox"
              checked={removeChannelPost}
              onChange={(e) => setRemoveChannelPost(e.target.checked)}
            />
            Also remove the Telegram channel post
          </label>
        )}
      </Modal>
    </>
  );
}
