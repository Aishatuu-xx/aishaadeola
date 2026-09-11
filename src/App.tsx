/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { Drink3DViewer } from './components/Drink3DViewer';
import { OrderMenu } from './components/OrderMenu';
import { CustomizeModal } from './components/CustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { CustomerCareChat } from './components/CustomerCareChat';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { Footer } from './components/Footer';
import { MenuItem, CartItem, DrinkCustomizationOptions, OrderSuccessData } from './types';
import { MENU_ITEMS } from './data/menu';
import { Truck, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shatu_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [customizerItem, setCustomizerItem] = useState<MenuItem | null>(null);
  const [active3DDrinkId, setActive3DDrinkId] = useState<string>('cappuccino');
  const [orderSuccessInfo, setOrderSuccessInfo] = useState<OrderSuccessData | null>(null);

  // Sync cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shatu_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    customization: DrinkCustomizationOptions,
    quantity: number,
    totalPrice: number
  ) => {
    const newCartItem: CartItem = {
      cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      item,
      quantity,
      customization,
      itemTotalPrice: totalPrice,
    };

    setCart((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          const singleUnitPrice = item.itemTotalPrice / item.quantity;
          return {
            ...item,
            quantity: newQty,
            itemTotalPrice: singleUnitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleViewIn3D = (threeDType: string) => {
    setActive3DDrinkId(threeDType);
    scrollToSection('drink-3d-studio');
  };

  const handleOrderFrom3DPreset = (menuItemId: string) => {
    const foundItem = MENU_ITEMS.find((m) => m.id === menuItemId);
    if (foundItem) {
      setCustomizerItem(foundItem);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#180F0C] text-[#F7F0E3]' : 'bg-[#F7F0E3] text-[#2B1B16]'
      } selection:bg-[#C28E5C]/30 selection:text-[#2B1B16]`}
    >
      {/* Top Navbar */}
      <Navbar
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onNavigate={scrollToSection}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main>
        {/* Hero Section */}
        <HeroSection
          onExplore3D={() => scrollToSection('drink-3d-studio')}
          onOrderNow={() => scrollToSection('menu-section')}
          theme={theme}
        />

        {/* 3D Animated Drink Studio Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Drink3DViewer
              initialDrinkId={active3DDrinkId}
              onSelectForOrder={handleOrderFrom3DPreset}
              theme={theme}
            />
          </div>
        </section>

        {/* Menu & Online Ordering Section */}
        <OrderMenu
          onOpenCustomizer={(item) => setCustomizerItem(item)}
          onViewIn3D={handleViewIn3D}
          theme={theme}
        />

        {/* Online Ordering Guarantee & Fast Delivery Details */}
        <section
          id="delivery-info"
          className={`py-16 sm:py-20 transition-colors duration-200 ${
            isDark ? 'bg-[#180F0C]' : 'bg-[#F7F0E3]'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm border ${
                  isDark
                    ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                    : 'bg-[#FFFFFF] text-[#6F4E37] border-[#C28E5C]/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C28E5C]" />
                Online Coffee Experience
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight ${
                  isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
                }`}
              >
                Freshly Brewed & Delivered To You <span className="text-[#C28E5C]">⚡☕</span>
              </h2>
              <p
                className={`text-sm sm:text-base mt-2 leading-relaxed ${
                  isDark ? 'text-[#F7F0E3]/80' : 'text-[#2B1B16]/80'
                }`}
              >
                We focus 100% on handcrafted quality and speedy delivery. While we do not operate a walk-in retail store, every order is treated like a work of art.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div
                className={`p-8 rounded-3xl border shadow-md hover:shadow-xl transition-shadow text-center space-y-3 ${
                  isDark
                    ? 'bg-[#231612] border-[#C28E5C]/30 text-[#F7F0E3]'
                    : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto text-2xl shadow-inner ${
                    isDark
                      ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                      : 'bg-[#F7F0E3] text-[#6F4E37] border-[#C28E5C]/40'
                  }`}
                >
                  <Clock className="w-6 h-6 text-[#C28E5C]" />
                </div>
                <h3
                  className={`font-serif font-bold text-xl ${
                    isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
                  }`}
                >
                  25–35 Min Express Delivery
                </h3>
                <p className="text-xs opacity-75 leading-relaxed">
                  Couriers equipped with heated and chilled thermal bags ensure your latte stays piping hot and your boba remains iced and frosty.
                </p>
              </div>

              <div
                className={`p-8 rounded-3xl border shadow-md hover:shadow-xl transition-shadow text-center space-y-3 ${
                  isDark
                    ? 'bg-[#231612] border-[#C28E5C]/30 text-[#F7F0E3]'
                    : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto text-2xl shadow-inner ${
                    isDark
                      ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                      : 'bg-[#F7F0E3] text-[#6F4E37] border-[#C28E5C]/40'
                  }`}
                >
                  <Truck className="w-6 h-6 text-[#C28E5C]" />
                </div>
                <h3
                  className={`font-serif font-bold text-xl ${
                    isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
                  }`}
                >
                  Spill-Proof Eco Packaging
                </h3>
                <p className="text-xs opacity-75 leading-relaxed">
                  Airtight heat-sealed lids, double-walled recyclable insulated cups, and straw sleeves keep your drinks safe from transit bumps.
                </p>
              </div>

              <div
                className={`p-8 rounded-3xl border shadow-md hover:shadow-xl transition-shadow text-center space-y-3 ${
                  isDark
                    ? 'bg-[#231612] border-[#C28E5C]/30 text-[#F7F0E3]'
                    : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto text-2xl shadow-inner ${
                    isDark
                      ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                      : 'bg-[#F7F0E3] text-[#6F4E37] border-[#C28E5C]/40'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6 text-[#C28E5C]" />
                </div>
                <h3
                  className={`font-serif font-bold text-xl ${
                    isDark ? 'text-[#FFFFFF]' : 'text-[#2B1B16]'
                  }`}
                >
                  100% Quality Guarantee
                </h3>
                <p className="text-xs opacity-75 leading-relaxed">
                  If your drink isn't balanced to your exact sweetness and temperature preference, our concierge chat will remake or refund it instantly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenChat={() => setIsChatOpen(true)}
        theme={theme}
      />

      {/* Modals & Overlays */}
      <CustomizeModal
        item={customizerItem}
        isOpen={!!customizerItem}
        theme={theme}
        onClose={() => setCustomizerItem(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        theme={theme}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOpenCheckoutSuccess={(info) => setOrderSuccessInfo(info)}
      />

      <CustomerCareChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        onSelectDrink={handleViewIn3D}
        theme={theme}
      />

      <OrderSuccessModal
        orderData={orderSuccessInfo}
        theme={theme}
        onClose={() => setOrderSuccessInfo(null)}
        onOpenChat={() => setIsChatOpen(true)}
      />
    </div>
  );
}

