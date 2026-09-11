import React, { useState, useMemo } from 'react';
import { MENU_ITEMS } from '../data/menu';
import { MenuItem, DrinkCategory, ThemeMode } from '../types';
import { formatNaira } from '../utils/formatCurrency';
import { Sparkles, Search, Plus, Eye } from 'lucide-react';

interface OrderMenuProps {
  onOpenCustomizer: (item: MenuItem) => void;
  onViewIn3D: (threeDType: string) => void;
  theme: ThemeMode;
}

export const OrderMenu: React.FC<OrderMenuProps> = ({
  onOpenCustomizer,
  onViewIn3D,
  theme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isDark = theme === 'dark';

  const categories: { id: DrinkCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Delights', icon: '✨' },
    { id: 'coffee', label: 'Artisan Coffee', icon: '☕' },
    { id: 'matcha', label: 'Matcha Magic', icon: '🍵' },
    { id: 'boba', label: 'Boba & Teas', icon: '🧋' },
    { id: 'cold-brew', label: 'Cold Brews', icon: '🧊' },
    { id: 'pastries', label: 'Bakery & Sweets', icon: '🥐' },
  ];

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.flavorNotes &&
          item.flavorNotes.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      id="menu-section"
      className={`py-16 sm:py-24 transition-colors duration-200 ${
        isDark ? 'bg-[#180F0C]' : 'bg-[#F7F0E3]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border mb-3 shadow-sm ${
                isDark
                  ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                  : 'bg-[#FFFFFF] text-[#6F4E37] border-[#C28E5C]/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C28E5C]" />
              Handcrafted With Love
            </div>
            <h2
              className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
              }`}
            >
              Order Online From Our Menu <span className="text-[#C28E5C]">☕✨</span>
            </h2>
            <p
              className={`text-sm sm:text-base max-w-xl mt-2 leading-relaxed ${
                isDark ? 'text-[#F7F0E3]/80' : 'text-[#2B1B16]/80'
              }`}
            >
              Every bean ethically sourced, every matcha whisked fresh, and every boba pearl simmered in rich black sugar. Pre-order online for express doorstep delivery.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#C28E5C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cappuccino, boba, matcha..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm focus:outline-none focus:border-[#6F4E37] transition-colors shadow-sm ${
                isDark
                  ? 'bg-[#231612] border-[#C28E5C]/40 text-[#FFFFFF] placeholder-[#F7F0E3]/40'
                  : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16] placeholder-[#2B1B16]/50'
              }`}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-tab-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-[#6F4E37] text-[#FFFFFF] shadow-md ring-1 ring-[#C28E5C] font-semibold'
                  : isDark
                  ? 'bg-[#231612] text-[#F7F0E3]/80 hover:bg-[#34201A] border border-[#C28E5C]/30 shadow-sm'
                  : 'bg-[#FFFFFF] text-[#2B1B16] hover:bg-[#F7F0E3] border border-[#C28E5C]/30 shadow-sm'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div
            className={`text-center py-16 p-6 rounded-3xl border shadow-sm ${
              isDark
                ? 'bg-[#231612] border-[#C28E5C]/30 text-[#F7F0E3]'
                : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
            }`}
          >
            <p className="text-sm opacity-80">No delicious items match your search.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-[#6F4E37] text-[#FFFFFF] text-xs font-semibold hover:bg-[#5A3E2B]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                id={`menu-card-${item.id}`}
                className={`group relative rounded-3xl border shadow-md hover:shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'bg-[#231612] border-[#C28E5C]/30 hover:border-[#C28E5C]'
                    : 'bg-[#FFFFFF] border-[#C28E5C]/30 hover:border-[#6F4E37]/60'
                }`}
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-52 w-full overflow-hidden bg-[#2B1B16]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Popular / Dietary Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {item.popular && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C28E5C] text-[#FFFFFF] shadow-md">
                          Artisan Pick 🌟
                        </span>
                      )}
                      {item.dietary?.map((diet, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2B1B16]/85 backdrop-blur-md text-[#FFFFFF] border border-[#C28E5C]/40"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>

                    {/* Price tag in Naira */}
                    <div
                      className={`absolute bottom-3 right-3 px-3 py-1 rounded-xl backdrop-blur-md border font-mono font-bold text-sm shadow-md ${
                        isDark
                          ? 'bg-[#2B1B16]/90 border-[#C28E5C]/50 text-[#C28E5C]'
                          : 'bg-[#FFFFFF]/95 border-[#C28E5C]/40 text-[#6F4E37]'
                      }`}
                    >
                      {formatNaira(item.price)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3
                      className={`text-xl font-serif font-bold transition-colors ${
                        isDark
                          ? 'text-[#FFFFFF] group-hover:text-[#C28E5C]'
                          : 'text-[#2B1B16] group-hover:text-[#6F4E37]'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <p
                      className={`text-xs mt-2 leading-relaxed line-clamp-2 ${
                        isDark ? 'text-[#F7F0E3]/75' : 'text-[#2B1B16]/75'
                      }`}
                    >
                      {item.description}
                    </p>

                    {/* Flavor Notes */}
                    {item.flavorNotes && item.flavorNotes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {item.flavorNotes.map((note, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              isDark
                                ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                                : 'bg-[#F7F0E3] text-[#6F4E37] border-[#C28E5C]/30'
                            }`}
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 pt-0 flex items-center gap-2">
                  {item.threeDType && (
                    <button
                      type="button"
                      id={`view-3d-btn-${item.id}`}
                      onClick={() => onViewIn3D(item.threeDType!)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isDark
                          ? 'bg-[#2B1B16] hover:bg-[#34201A] text-[#C28E5C] border-[#C28E5C]/40'
                          : 'bg-[#F7F0E3] hover:bg-[#EFE4D2] text-[#6F4E37] border-[#C28E5C]/30'
                      }`}
                      title="Inspect 3D Animation & Layers"
                    >
                      <Eye className="w-4 h-4 text-[#C28E5C]" />
                      <span className="hidden sm:inline">3D</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id={`customize-order-btn-${item.id}`}
                    onClick={() => onOpenCustomizer(item)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 border border-[#C28E5C]/40 active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 text-[#C28E5C]" />
                    <span>Customize & Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
