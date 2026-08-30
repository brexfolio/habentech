"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Heart,
  ImageOff,
  MessageSquareText,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { apiGet, apiPost, ApiError } from "@/lib/apiClient";
import { useFavorites } from "@/lib/useFavorites";
import { useTelegramUser } from "@/lib/useTelegramUser";
import { hapticNotification } from "@/lib/telegram";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/i18n";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { LoadingPage } from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

const BADGE_CLASS: Record<string, string> = {
  Available: "status-pill--available",
  "Low Stock": "status-pill--pending",
  Sold: "status-pill--sold",
  Unavailable: "status-pill--unavailable",
  "Out of Stock": "status-pill--out-of-stock",
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useTelegramUser();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, tv } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<{ product: Product }>(`/api/products/${params.id}`)
      .then((data) => setProduct(data.product))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) return <LoadingPage />;

  if (notFound || !product) {
    return (
      <div className="store-shell">
        <EmptyState
          icon={<ImageOff size={26} />}
          title={t("product.notFoundTitle")}
          description={t("product.notFoundDescription")}
          action={
            <Button onClick={() => router.push("/")} style={{ marginTop: 12 }}>
              {t("product.backToStore")}
            </Button>
          }
        />
      </div>
    );
  }

  const images = product.images ?? [];
  const specs = product.specifications ?? [];
  const favorite = isFavorite(product.id);
  const isOrderable = product.availability === "Available" || product.availability === "Low Stock";

  function scrollToImage(index: number) {
    const track = galleryRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActiveImage(clamped);
  }

  async function submitRequest() {
    setIsSubmitting(true);
    try {
      await apiPost(`/api/requests`, { product_id: product!.id });
      hapticNotification("success");
      showToast("success", t("product.requestSent"));
      setShowRequestModal(false);
    } catch (error) {
      hapticNotification("error");
      showToast("error", error instanceof ApiError ? error.message : t("product.unableToSendRequest"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitOrder() {
    setIsSubmitting(true);
    try {
      await apiPost(`/api/orders`, { product_id: product!.id, quantity });
      hapticNotification("success");
      showToast("success", t("product.orderPlaced"));
      setShowOrderModal(false);
      setQuantity(1);
    } catch (error) {
      hapticNotification("error");
      showToast("error", error instanceof ApiError ? error.message : t("product.unableToPlaceOrder"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="product-detail">
      <div className="product-gallery">
        <div className="product-detail__topbar">
          <button type="button" className="product-detail__icon-btn" onClick={() => router.back()} aria-label={t("product.goBack")}>
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            className="product-detail__icon-btn"
            onClick={() => toggleFavorite(product.id)}
            aria-label={favorite ? t("favorites.remove") : t("favorites.add")}
            aria-pressed={favorite}
            style={favorite ? { color: "#ff5470" } : undefined}
          >
            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>

        {images.length > 0 ? (
          <>
            <div
              className="product-gallery__track"
              ref={galleryRef}
              onScroll={(e) => {
                const target = e.currentTarget;
                const index = Math.round(target.scrollLeft / target.clientWidth);
                setActiveImage(index);
              }}
            >
              {images.map((image) => (
                <div key={image.id} className="product-gallery__slide">
                  <img src={image.image_url} alt={product.name} className="product-gallery__image" />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="product-gallery__nav-btn product-gallery__nav-btn--prev"
                  onClick={() => scrollToImage(activeImage - 1)}
                  aria-label={t("product.previousImage")}
                  disabled={activeImage === 0}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="product-gallery__nav-btn product-gallery__nav-btn--next"
                  onClick={() => scrollToImage(activeImage + 1)}
                  aria-label={t("product.nextImage")}
                  disabled={activeImage === images.length - 1}
                >
                  <ChevronRight size={18} />
                </button>
                <div className="product-gallery__dots">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      className={`product-gallery__dot ${
                        index === activeImage ? "product-gallery__dot--active" : ""
                      }`}
                      onClick={() => scrollToImage(index)}
                      aria-label={t("product.goToImage", { index: index + 1 })}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--store-text-muted)",
            }}
          >
            <ImageOff size={40} />
          </div>
        )}
      </div>

      <div className="product-detail__info">
        <p className="product-detail__category">{tv("productCategory", product.category)}</p>
        <h1 className="product-detail__title">{product.name}</h1>
        <div className="product-detail__price-row">
          <span className="product-detail__price">{formatPrice(product.price, product.currency)}</span>
          <span className={`status-pill ${BADGE_CLASS[product.availability] ?? ""}`}>
            {tv("availability", product.availability)}
          </span>
        </div>

        <div className="product-detail__meta-grid">
          <div className="product-detail__meta-item">
            <p className="product-detail__meta-label">{t("product.condition")}</p>
            <p className="product-detail__meta-value">{tv("condition", product.condition)}</p>
          </div>
          <div className="product-detail__meta-item">
            <p className="product-detail__meta-label">{t("product.category")}</p>
            <p className="product-detail__meta-value">{tv("productCategory", product.category)}</p>
          </div>
        </div>

        {specs.length > 0 && (
          <>
            <h2 className="product-detail__section-title">{t("product.specifications")}</h2>
            <div className="spec-table">
              {specs.map((spec) => (
                <div key={spec.id} className="spec-table__row">
                  <span className="spec-table__label">{spec.label}</span>
                  <span className="spec-table__value">{spec.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {product.description && (
          <>
            <h2 className="product-detail__section-title">{t("product.description")}</h2>
            <p className="product-detail__description">{product.description}</p>
          </>
        )}
      </div>

      <div className="product-detail__actions">
        <Button
          variant="secondary"
          block
          disabled={!isOrderable}
          onClick={() => setShowRequestModal(true)}
        >
          <MessageSquareText size={17} />
          {t("product.requestProduct")}
        </Button>
        <Button variant="primary" block disabled={!isOrderable} onClick={() => setShowOrderModal(true)}>
          <ShoppingCart size={17} />
          {t("product.orderNow")}
        </Button>
      </div>

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={t("product.confirmRequest")}
        footer={
          <>
            <Button variant="secondary" block onClick={() => setShowRequestModal(false)}>
              {t("product.cancel")}
            </Button>
            <Button variant="primary" block loading={isSubmitting} onClick={submitRequest}>
              {t("product.sendRequest")}
            </Button>
          </>
        }
      >
        <div className="modal__summary-row">
          <span>{t("product.product")}</span>
          <strong>{product.name}</strong>
        </div>
        <div className="modal__summary-row">
          <span>{t("product.price")}</span>
          <strong>{formatPrice(product.price, product.currency)}</strong>
        </div>
        <div className="modal__summary-row">
          <span>{t("product.yourName")}</span>
          <strong>
            {user
              ? [user.first_name, user.last_name].filter(Boolean).join(" ") || t("home.telegramUser")
              : t("home.telegramUser")}
          </strong>
        </div>
      </Modal>

      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={t("product.confirmOrder")}
        footer={
          <>
            <Button variant="secondary" block onClick={() => setShowOrderModal(false)}>
              {t("product.cancel")}
            </Button>
            <Button variant="primary" block loading={isSubmitting} onClick={submitOrder}>
              {t("product.confirmOrderButton")}
            </Button>
          </>
        }
      >
        <div className="modal__summary-row">
          <span>{t("product.product")}</span>
          <strong>{product.name}</strong>
        </div>
        <div className="modal__summary-row">
          <span>{t("product.price")}</span>
          <strong>{formatPrice(product.price, product.currency)}</strong>
        </div>
        <div className="modal__summary-row">
          <span>{t("product.quantity")}</span>
          <div className="quantity-stepper">
            <button
              type="button"
              className="quantity-stepper__btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="quantity-stepper__value">{quantity}</span>
            <button
              type="button"
              className="quantity-stepper__btn"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="modal__summary-row modal__summary-row--total">
          <span>{t("product.total")}</span>
          <strong>{formatPrice(product.price * quantity, product.currency)}</strong>
        </div>
      </Modal>
    </div>
  );
}
