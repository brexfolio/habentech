"use client";

import { useEffect, useState } from "react";
import Header from "@/components/store/Header";
import SearchBar from "@/components/store/SearchBar";
import PromoBanner from "@/components/store/PromoBanner";
import CategoryFilter from "@/components/store/CategoryFilter";
import ProductGrid from "@/components/store/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Loading";
import { apiGet } from "@/lib/apiClient";
import type { Product } from "@/types/product";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search.trim()) params.set("search", search.trim());

    const timeout = setTimeout(() => {
      apiGet<{ products: Product[] }>(`/api/products?${params.toString()}`)
        .then((data) => setProducts(data.products))
        .catch(() => setProducts([]))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="store-shell">
      <Header />
      <SearchBar value={search} onChange={setSearch} />
      <PromoBanner />
      <CategoryFilter selected={category} onSelect={setCategory} />

      {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={products} />}
    </div>
  );
}
