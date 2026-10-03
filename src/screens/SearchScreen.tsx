import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const {
    t,
    products,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory
  } = useStore();

  const [sortOption, setSortOption] = useState<'default' | 'price_low' | 'price_high'>('default');

  const filtered = products
    .filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      const matchesCat = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
      const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;
      if (sortOption === 'price_low') return priceA - priceB;
      if (sortOption === 'price_high') return priceB - priceA;
      return 0;
    });

  return (
    <div className="space-y-3.5 pb-20">
      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          autoFocus
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 text-xs sm:text-sm text-slate-900 shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear Search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
              selectedCategory === null ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedCategory === c.name ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as any)}
          className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-bold text-slate-700 focus:outline-none flex-shrink-0"
        >
          <option value="default">Sort: Recommended</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Found {filtered.length} products</span>
        {searchQuery && <span>Keywords: "{searchQuery}"</span>}
      </div>

      {/* Product Results Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-800">No matching products found</h3>
          <p className="text-xs text-slate-500">
            Try searching for something else like "mango", "cinnamon", "milk" or "bread".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
