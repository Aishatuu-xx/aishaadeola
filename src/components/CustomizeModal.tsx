import React, { useState } from 'react';
import { MenuItem, DrinkCustomizationOptions, ThemeMode } from '../types';
import { formatNaira } from '../utils/formatCurrency';
import { X, Check, Coffee, Sparkles, Plus, Minus } from 'lucide-react';

interface CustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  theme: ThemeMode;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    customization: DrinkCustomizationOptions,
    quantity: number,
    totalPrice: number
  ) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  item,
  isOpen,
  theme,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !item) return null;

  const isDark = theme === 'dark';

  const [size, setSize] = useState<DrinkCustomizationOptions['size']>('Regular (12oz)');
  const [milk, setMilk] = useState<DrinkCustomizationOptions['milk']>('Whole Milk');
  const [sweetness, setSweetness] = useState<DrinkCustomizationOptions['sweetness']>('50% (Half)');
  const [ice, setIce] = useState<DrinkCustomizationOptions['ice']>(
    item.temperature === 'cold' ? 'Regular Ice' : 'Hot'
  );
  const [toppings, setToppings] = useState<string[]>(
    item.category === 'boba' ? ['Brown Sugar Tapioca Boba'] : []
  );
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Price calculations in Naira (₦)
  const sizePriceAddons: Record<string, number> = {
    'Regular (12oz)': 0,
    'Large (16oz)': 800,
    'Grande (20oz)': 1400,
  };

  const milkPriceAddons: Record<string, number> = {
    'Whole Milk': 0,
    'Oat Milk': 700,
    'Almond Milk': 700,
    'Coconut Milk': 700,
    'Soy Milk': 600,
    'Breve': 800,
  };

  const availableToppings = [
    { name: 'Brown Sugar Tapioca Boba', price: 800, icon: '🧋' },
    { name: 'Lychee Popping Boba', price: 900, icon: '✨' },
    { name: 'Cheese Foam Salted Cap', price: 1100, icon: '🧀' },
    { name: 'Extra Double Espresso Shot', price: 1000, icon: '☕' },
    { name: 'Whipped Bourbon Cream', price: 600, icon: '🍦' },
    { name: 'Cinnamon & Brown Sugar Crumble', price: 500, icon: '🧁' },
  ];

  const toggleTopping = (topName: string) => {
    if (toppings.includes(topName)) {
      setToppings(toppings.filter((t) => t !== topName));
    } else {
      setToppings([...toppings, topName]);
    }
  };

  const toppingsTotal = toppings.reduce((acc, topName) => {
    const found = availableToppings.find((t) => t.name === topName);
    return acc + (found ? found.price : 0);
  }, 0);

  const basePrice = item.price;
  const sizeCost = sizePriceAddons[size] || 0;
  const milkCost = milkPriceAddons[milk] || 0;
  const singleItemTotal = basePrice + sizeCost + milkCost + toppingsTotal;
  const grandTotal = singleItemTotal * quantity;

  const handleConfirm = () => {
    onAddToCart(
      item,
      {
        size,
        milk,
        sweetness,
        ice,
        toppings,
        specialInstructions: specialInstructions.trim() || undefined,
      },
      quantity,
      grandTotal
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="drink-customizer-modal"
        className={`relative w-full max-w-xl my-8 rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDark
            ? 'bg-[#231612] border-[#C28E5C]/40 text-[#F7F0E3]'
            : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
        }`}
      >
        {/* Header with image & dismiss */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#2B1B16]">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t via-transparent to-black/30 ${
              isDark ? 'from-[#231612]' : 'from-[#FFFFFF]'
            }`}
          />

          <button
            id="close-customizer-btn"
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border shadow-sm transition-colors ${
              isDark
                ? 'bg-[#2B1B16]/80 text-[#F7F0E3] hover:bg-[#2B1B16] border-[#C28E5C]/40'
                : 'bg-[#FFFFFF]/85 text-[#2B1B16] hover:bg-[#FFFFFF] border-[#C28E5C]/40'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C28E5C] text-[#FFFFFF] mb-1 shadow-sm">
              {item.category.toUpperCase()}
            </span>
            <h3
              className={`text-2xl font-serif font-bold leading-tight ${
                isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
              }`}
            >
              {item.name}
            </h3>
            <p className="text-xs opacity-75 line-clamp-1">{item.description}</p>
          </div>
        </div>

        {/* Customization Options Body */}
        <div
          className={`p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin ${
            isDark ? 'bg-[#231612]' : 'bg-[#FFFFFF]'
          }`}
        >
          {/* Size Option */}
          {item.category !== 'pastries' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C] mb-2">
                Select Cup Size
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Regular (12oz)', 'Large (16oz)', 'Grande (20oz)'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      size === s
                        ? 'bg-[#6F4E37] border-[#C28E5C] text-[#FFFFFF] shadow-md ring-1 ring-[#C28E5C]'
                        : isDark
                        ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3] hover:bg-[#34201A]'
                        : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16] hover:bg-[#EFE4D2]'
                    }`}
                  >
                    <div className="text-xs font-bold">{s.split(' ')[0]}</div>
                    <div
                      className={`text-[11px] ${
                        size === s ? 'text-[#F7F0E3]/80' : 'opacity-70'
                      }`}
                    >
                      {s.split(' ')[1]}
                    </div>
                    <div
                      className={`text-xs font-mono font-bold mt-1 ${
                        size === s ? 'text-[#C28E5C]' : 'text-[#6F4E37] dark:text-[#C28E5C]'
                      }`}
                    >
                      {sizePriceAddons[s] === 0 ? 'Included' : `+${formatNaira(sizePriceAddons[s])}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk / Base Selection */}
          {item.category !== 'pastries' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C] mb-2">
                Choice of Milk / Cream
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    'Whole Milk',
                    'Oat Milk',
                    'Almond Milk',
                    'Coconut Milk',
                    'Soy Milk',
                    'Breve',
                  ] as const
                ).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMilk(m)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      milk === m
                        ? 'bg-[#6F4E37] border-[#C28E5C] text-[#FFFFFF] shadow-sm'
                        : isDark
                        ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3] hover:bg-[#34201A]'
                        : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16] hover:bg-[#EFE4D2]'
                    }`}
                  >
                    <div className="font-semibold">{m}</div>
                    <div
                      className={`text-[10px] font-mono ${
                        milk === m ? 'text-[#C28E5C]' : 'text-[#6F4E37] dark:text-[#C28E5C]'
                      }`}
                    >
                      {milkPriceAddons[m] === 0 ? 'Free' : `+${formatNaira(milkPriceAddons[m])}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ice Level */}
          {item.category !== 'pastries' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C] mb-2">
                Temperature & Ice Level
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['Hot', 'No Ice', 'Less Ice', 'Regular Ice', 'Extra Ice'] as const).map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIce(ic)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs transition-all ${
                      ice === ic
                        ? 'bg-[#6F4E37] border-[#C28E5C] text-[#FFFFFF] font-bold shadow-sm'
                        : isDark
                        ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3] hover:bg-[#34201A]'
                        : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16] hover:bg-[#EFE4D2]'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness Level */}
          {item.category !== 'pastries' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C] mb-2">
                Sweetness Preference
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(
                  [
                    '0% (Unsweetened)',
                    '25% (Light)',
                    '50% (Half)',
                    '75% (Sweet)',
                    '100% (Standard)',
                  ] as const
                ).map((sw) => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => setSweetness(sw)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs transition-all ${
                      sweetness === sw
                        ? 'bg-[#6F4E37] border-[#C28E5C] text-[#FFFFFF] font-bold shadow-sm'
                        : isDark
                        ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3] hover:bg-[#34201A]'
                        : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16] hover:bg-[#EFE4D2]'
                    }`}
                  >
                    {sw.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extra Toppings / Add-ons */}
          {item.category !== 'pastries' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C] mb-2">
                Artisan Toppings & Extras
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableToppings.map((top) => {
                  const isChecked = toppings.includes(top.name);
                  return (
                    <button
                      key={top.name}
                      type="button"
                      onClick={() => toggleTopping(top.name)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isChecked
                          ? 'bg-[#6F4E37] border-[#C28E5C] text-[#FFFFFF] shadow-sm'
                          : isDark
                          ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3] hover:bg-[#34201A]'
                          : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16] hover:bg-[#EFE4D2]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{top.icon}</span>
                        <span className="font-semibold">{top.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold ${
                            isChecked ? 'text-[#C28E5C]' : 'text-[#6F4E37] dark:text-[#C28E5C]'
                          }`}
                        >
                          +{formatNaira(top.price)}
                        </span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-[#C28E5C] border-[#C28E5C] text-[#FFFFFF]'
                              : 'border-current/30 bg-black/10'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C] mb-1.5">
              Barista Note / Special Request (Optional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot, separate lid, sprinkle cinnamon..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm placeholder:opacity-40 focus:outline-none focus:border-[#6F4E37] ${
                isDark
                  ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                  : 'bg-[#F7F0E3] border-[#C28E5C]/40 text-[#2B1B16]'
              }`}
            />
          </div>
        </div>

        {/* Footer with Quantity and Confirm */}
        <div
          className={`p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark
              ? 'bg-[#1D120F] border-[#C28E5C]/30'
              : 'bg-[#F7F0E3] border-[#C28E5C]/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-80 font-medium">Qty:</span>
            <div
              className={`flex items-center rounded-xl border shadow-sm ${
                isDark
                  ? 'bg-[#2B1B16] border-[#C28E5C]/40'
                  : 'bg-[#FFFFFF] border-[#C28E5C]/40'
              }`}
            >
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:text-[#C28E5C] transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 text-sm font-bold font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:text-[#C28E5C] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-lg font-bold font-mono text-[#6F4E37] dark:text-[#C28E5C] ml-2">
              {formatNaira(grandTotal)}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isDark
                  ? 'bg-[#2B1B16] hover:bg-[#34201A] text-[#F7F0E3] border-[#C28E5C]/40'
                  : 'bg-[#FFFFFF] hover:bg-[#F7F0E3] text-[#2B1B16] border-[#C28E5C]/40'
              }`}
            >
              Cancel
            </button>
            <button
              id="confirm-add-to-cart-btn"
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] text-sm font-bold transition-all shadow-md border border-[#C28E5C]/40"
            >
              Add to Order • {formatNaira(grandTotal)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
