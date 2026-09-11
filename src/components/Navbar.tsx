import React from 'react';
import { ShoppingBag, Coffee, MessageSquare, Sparkles, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenChat: () => void;
  onNavigate: (sectionId: string) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenChat,
  onNavigate,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}) => {
  const context = useTheme();
  const activeTheme = propTheme || context.theme;
  const handleToggle = propToggleTheme || context.toggleTheme;
  const isDark = activeTheme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b shadow-md ${
        isDark
          ? 'bg-[#1F130F] border-[#C28E5C]/30 text-[#F7F0E3]'
          : 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#FFFFFF]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#6F4E37] flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform border border-[#C28E5C]/50 text-[#F7F0E3]">
            ☕
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg sm:text-xl text-[#FFFFFF] tracking-tight">
                Shatu's Cozy Cup
              </span>
              <span className="text-[#C28E5C] text-sm animate-pulse">✨</span>
            </div>
            <p className="text-[11px] text-[#C28E5C] font-medium tracking-wide">
              Online Artisan Coffee & Boba Bar
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#F7F0E3]">
          <button
            onClick={() => onNavigate('drink-3d-studio')}
            className="hover:text-[#C28E5C] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C28E5C]" />
            3D Studio
          </button>
          <button
            onClick={() => onNavigate('menu-section')}
            className="hover:text-[#C28E5C] transition-colors flex items-center gap-1.5"
          >
            <Coffee className="w-3.5 h-3.5 text-[#C28E5C]" />
            Order Menu
          </button>
          <button
            onClick={() => onNavigate('delivery-info')}
            className="hover:text-[#C28E5C] transition-colors flex items-center gap-1.5"
          >
            <span className="text-[#C28E5C]">⚡</span>
            Doorstep Delivery
          </button>
          <button
            onClick={onOpenChat}
            className="hover:text-[#C28E5C] transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C28E5C]" />
            Customer Care
          </button>
        </nav>

        {/* Right Actions: Theme Toggle, Order Now & Cart */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={handleToggle}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="px-3 py-2 rounded-xl bg-[#6F4E37]/80 hover:bg-[#6F4E37] text-[#F7F0E3] border border-[#C28E5C]/50 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-semibold text-amber-200">
                  Light
                </span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#C28E5C]" />
                <span className="text-[11px] font-semibold text-[#F7F0E3]">
                  Dark
                </span>
              </>
            )}
          </button>

          <button
            id="nav-order-online-btn"
            onClick={() => onNavigate('menu-section')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] border border-[#C28E5C]/40 text-xs font-semibold text-[#FFFFFF] transition-all shadow-sm"
          >
            <Coffee className="w-3.5 h-3.5 text-[#C28E5C]" />
            Order Online
          </button>

          <button
            id="navbar-cart-btn"
            onClick={onOpenCart}
            className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] transition-all shadow-md flex items-center gap-2 border border-[#C28E5C]/40 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-[#C28E5C]" />
            <span className="hidden sm:inline text-xs font-semibold">My Cup</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#2B1B16] text-[#FFFFFF] font-mono text-[11px] font-bold flex items-center justify-center ring-2 ring-[#C28E5C]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
