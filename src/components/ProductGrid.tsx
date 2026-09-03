import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { FilterBar, FilterStatus } from './FilterBar';
import { EmptyState } from './EmptyState';
import { Sparkles, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getProductSaleState } from '../utils/timeUtils';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  onOpenAddProductModal?: () => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  searchQuery,
  onOpenAddProductModal,
  onEditProduct
}) => {
  const { currentUser, serverTime } = useStore();
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      const saleState = getProductSaleState(product, serverTime);

      // Status filter
      if (filter === 'AVAILABLE') return saleState === 'AVAILABLE';
      if (filter === 'UPCOMING') return saleState === 'UPCOMING';
      if (filter === 'SOLD_OUT') return saleState === 'SOLD_OUT';
      return true;
    });
  }, [products, searchQuery, filter, serverTime]);

  const availableCount = products.filter(p => getProductSaleState(p, serverTime) === 'AVAILABLE').length;
  const upcomingCount = products.filter(p => getProductSaleState(p, serverTime) === 'UPCOMING').length;
  const soldOutCount = products.filter(p => getProductSaleState(p, serverTime) === 'SOLD_OUT').length;

  return (
    <section id="products-section" className="px-3 sm:px-6 py-6 sm:py-10 max-w-7xl mx-auto">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#6C9A4A]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C9A4A]">
              1 / 1 EXCLUSIVE COLLECTION
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#283124] font-heading">
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : 'Sản phẩm mới nhất'}
          </h2>
        </div>

        {/* Filter Bar & Seller Add Action */}
        <div className="flex items-center gap-3 flex-wrap">
          {products.length > 0 && (
            <FilterBar
              activeFilter={filter}
              onFilterChange={setFilter}
              availableCount={availableCount}
              upcomingCount={upcomingCount}
              soldOutCount={soldOutCount}
              totalCount={products.length}
            />
          )}

          {currentUser?.role === 'SELLER' && onOpenAddProductModal && (
            <button
              onClick={onOpenAddProductModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C9A4A] hover:bg-[#405B32] text-white rounded-full text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng sản phẩm mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Content or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              onEdit={onEditProduct}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type={products.length === 0 ? 'products' : 'search'}
          isSeller={currentUser?.role === 'SELLER'}
          onAction={
            currentUser?.role === 'SELLER' && onOpenAddProductModal
              ? onOpenAddProductModal
              : undefined
          }
        />
      )}

    </section>
  );
};
