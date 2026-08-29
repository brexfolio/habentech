import { PackageSearch } from "lucide-react";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import EmptyState from "@/components/ui/EmptyState";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch size={26} />}
        title="No products available right now."
        description="Try a different search term or check back later for new arrivals."
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
