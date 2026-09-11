import React from 'react';
import { Coffee, Heart, Truck, Clock, Phone, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { ThemeMode } from '../types';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenChat: () => void;
  theme?: ThemeMode;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenChat, theme }) => {
  const isDark = theme === 'dark';
  return (
    <footer
      className={`border-t transition-colors duration-200 pt-16 pb-12 ${
        isDark
          ? 'bg-[#180F0C] border-[#C28E5C]/25 text-[#F7F0E3]/85'
          : 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3]/85'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#C28E5C]/20">
          {/* Col 1: Brand & Online Model */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#6F4E37] border border-[#C28E5C]/40 flex items-center justify-center text-xl text-[#FFFFFF] shadow-inner">
                ☕
              </div>
              <span className="font-serif font-bold text-xl text-[#FFFFFF] tracking-tight flex items-center gap-1">
                Shatu's Cozy Cup <span className="text-[#C28E5C]">✨</span>
              </span>
            </div>
            <p className="text-xs text-[#F7F0E3]/75 leading-relaxed">
              An artisan online coffee studio, ceremonial matcha bar, and boba kitchen crafted for doorstep indulgence. Pure Arabica espresso, heart microfoam latte art, and slow-simmered tiger boba delivered straight to your door.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#6F4E37]/30 border border-[#C28E5C]/40 text-[11px] text-[#C28E5C] font-medium">
              <Truck className="w-3.5 h-3.5 text-[#C28E5C]" />
              <span>100% Online Delivery — No Walk-In Store</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C28E5C]">
              Online Studio
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('hero')}
                  className="hover:text-[#FFFFFF] transition-colors text-[#F7F0E3]/75 hover:underline"
                >
                  Home & Studio Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('drink-3d-studio')}
                  className="hover:text-[#FFFFFF] transition-colors text-[#F7F0E3]/75 hover:underline"
                >
                  Interactive 3D Drink Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu-section')}
                  className="hover:text-[#FFFFFF] transition-colors text-[#F7F0E3]/75 hover:underline"
                >
                  Order Handcrafted Menu (₦)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('delivery-info')}
                  className="hover:text-[#FFFFFF] transition-colors text-[#F7F0E3]/75 hover:underline"
                >
                  Doorstep Delivery & Spill-Proof Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenChat}
                  className="hover:text-[#FFFFFF] transition-colors text-[#F7F0E3]/75 hover:underline"
                >
                  Barista Concierge Chat 💬
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Dispatch Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C28E5C] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C28E5C]" />
              Online Dispatch Hours
            </h4>
            <div className="space-y-1.5 text-xs text-[#F7F0E3]/75">
              <div className="flex justify-between">
                <span className="text-[#FFFFFF]">Monday – Friday:</span>
                <span className="font-mono text-[#C28E5C]">7:00 AM – 9:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#FFFFFF]">Saturday:</span>
                <span className="font-mono text-[#C28E5C]">8:00 AM – 10:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#FFFFFF]">Sunday:</span>
                <span className="font-mono text-[#C28E5C]">8:00 AM – 9:00 PM</span>
              </div>
            </div>
            <p className="text-[11px] text-[#F7F0E3]/70 pt-1">
              Average delivery time: 25–35 mins. Insulated thermal pouches keep cold drinks chilled & hot drinks steaming.
            </p>
          </div>

          {/* Col 4: Online Order Support & Dispatch Hub */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C28E5C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C28E5C]" />
              Online Support & Dispatch
            </h4>
            <p className="text-xs text-[#F7F0E3]/75 leading-relaxed">
              Cloud Kitchen Dispatch Center
              <br />
              Delivering across Victoria Island, Lekki & Central Metro
            </p>
            <div className="space-y-1 text-xs text-[#F7F0E3]/75 pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-[#C28E5C]" />
                <span>+234 800 234 COZY (2699)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-[#C28E5C]" />
                <span>orders@shatuscozycup.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F0E3]/70">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Shatu's Cozy Cup ☕. Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#C28E5C] fill-[#C28E5C] inline" />
            <span>and fresh roasted beans.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Online Store</span>
            <span>•</span>
            <span>Insulated Spill-Proof Delivery</span>
            <span>•</span>
            <span>Zero Plastic Cups</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

