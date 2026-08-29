"use client";

import Link from "next/link";
import { Heart, ImageOff } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useFavorites } from "@/lib/useFavorites";
import { hapticImpact } from "@/lib/telegram";

function buildSpecLine(product: Product): string {
  const specs = product.specifications ?? [];
  if (specs.length === 0) return product.category;
  return specs
    .slice(0, 2)
    .map((spec) => spec.value)
    .join(" • ");
}

const BADGE_CLASS: Record<string, string> = {
  Available: "",
  "Low Stock": "product-card__badge--low-stock",
  Sold: "product-card__badge--sold",
  Unavailable: "product-card__badge--unavailable",
  "Out of Stock": "product-card__badge--out-of-stock",
};

export default function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const image = product.images?.[0];
  const favorite = isFavorite(product.id);

  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <div className="product-card__image-wrap">
        {image ? (
          <img src={image.image_url} alt={product.name} className="product-card__image" loading="lazy" />
        ) : (
          <div className="product-card__image" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--store-text-muted)" }}>
            <ImageOff size={28} />
          </div>
        )}
        <span className={`product-card__badge ${BADGE_CLASS[product.availability] ?? ""}`}>
          {product.availability}
        </span>
        <button
          type="button"
          className={`product-card__favorite ${favorite ? "product-card__favorite--active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            hapticImpact("light");
            toggleFavorite(product.id);
          }}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
        >
          <Heart size={15} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__spec">{buildSpecLine(product)}</p>
        <div className="product-card__footer">
          <span className="product-card__price">{formatPrice(product.price, product.currency)}</span>
        </div>
      </div>
    </Link>
  );
}
