import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Grid, ArrowLeft, ArrowRight } from 'lucide-react';

export const CategoriesScreen: React.FC = () => {
  const {
    t,
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    setScreen
  } = useStore();

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <div className="space-y-4 pb-20">
      {/* Category selector chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-[#0F2C59] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Items ({products.length})
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.name)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c.name
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid of Categories if none selected */}
      {selectedCategory === null && (
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat) => {
            const count = products.filter(p => p.category === cat.name).length;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer shadow-xs active:scale-[0.98] transition-transform"
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-75"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-3 text-white">
                  <h3 className="font-extrabold text-xs sm:text-sm leading-tight">{cat.name}</h3>
                  <p className="text-[10px] text-emerald-300 font-semibold">{count} products</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products under category */}
      <div className="space-y-2">
        {selectedCategory && (
          <div className="flex items-center justify-between px-1">
            <h2 className="font-extrabold text-sm text-slate-900">
              {selectedCategory}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 text-xs space-y-2">
            <p>No products available in this category yet.</p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl font-bold"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
