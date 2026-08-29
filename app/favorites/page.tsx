"use client";

import { useEffect, useState } from "react";
import { HeartOff } from "lucide-react";
import Header from "@/components/store/Header";
import ProductGrid from "@/components/store/ProductGrid";
import BottomNavigation from "@/components/store/BottomNavigation";
import { ProductGridSkeleton } from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { apiGet } from "@/lib/apiClient";
import { useFavorites } from "@/lib/useFavorites";
import type { Product } from "@/types/product";

export default function FavoritesPage() {
  const { favorites, isLoaded } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    apiGet<{ products: Product[] }>("/api/products")
      .then((data) => setProducts(data.products.filter((p) => favorites.includes(p.id))))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [isLoaded, favorites]);

  return (
    <div className="store-shell">
      <Header />
      <div className="page-header">
        <h1 className="page-header__title">Favorites</h1>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<HeartOff size={26} />}
          title="No favorites yet."
          description="Tap the heart icon on any product to save it here."
        />
      ) : (
        <ProductGrid products={products} />
      )}

      <BottomNavigation />
    </div>
  );
}
