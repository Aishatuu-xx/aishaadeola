import React from 'react';
import { Coffee, Sparkles, Star, Truck, Clock, ShieldCheck } from 'lucide-react';
import cafeBackground from '../assets/images/shatu_cozy_cup_1789069803155.jpg';
import { ThemeMode } from '../types';

interface HeroSectionProps {
  onExplore3D: () => void;
  onOrderNow: () => void;
  theme: ThemeMode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore3D,
  onOrderNow,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <section id="hero" className="relative pt-8 pb-16 sm:py-20 overflow-hidden">
      {/* Background Image with Luxury Coffee Atmosphere Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={cafeBackground}
          alt="Shatu's Cozy Cup Luxury Coffee Studio"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2B1B16]/95 via-[#2B1B16]/85 to-[#2B1B16]/75" />
        <div
          className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-95 transition-colors duration-200 ${
            isDark ? 'from-[#180F0C]' : 'from-[#F7F0E3]'
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Online-Only Notice & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Online Only Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#C28E5C]/20 text-[#F7F0E3] border border-[#C28E5C]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C28E5C]" />
              <span>100% Online Artisan Bar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C28E5C]" />
              <span className="text-[#C28E5C]">Fast Doorstep Delivery</span>
            </div>

            {/* Display Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#FFFFFF] tracking-tight leading-[1.12]">
              Coffee crafted to{' '}
              <span className="text-[#C28E5C] italic font-serif">perfection.</span>
              <span className="inline-block text-[#C28E5C] ml-2">☕</span>
            </h1>

            <p className="text-[#F7F0E3]/90 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Welcome to <strong>Shatu's Cozy Cup</strong>. We operate exclusively as an online artisan coffee and boba studio — order your favorite single-origin espresso, heart latte art, ceremonial Kyoto matcha, and brown sugar boba directly online with express doorstep delivery.
            </p>

            {/* Online Store Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#C28E5C]/40 text-[#2B1B16] text-xs flex items-center gap-3 shadow-lg max-w-xl mx-auto lg:mx-0">
              <div className="w-8 h-8 rounded-xl bg-[#6F4E37] text-[#FFFFFF] flex items-center justify-center flex-shrink-0 font-bold">
                🛵
              </div>
              <div className="text-left">
                <span className="font-bold text-[#2B1B16]">Online Orders Only: </span>
                <span className="text-[#2B1B16]/80">
                  No physical walk-in store yet! Pre-order online for contact-free doorstep delivery or fast counter pickup.
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="hero-order-now-btn"
                onClick={onOrderNow}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] font-semibold text-sm transition-all shadow-xl shadow-[#2B1B16]/50 flex items-center justify-center gap-2 active:scale-95 border border-[#C28E5C]/40"
              >
                <Coffee className="w-4 h-4 text-[#C28E5C]" />
                <span>Order Online Now (₦)</span>
              </button>

              <button
                id="hero-explore-3d-btn"
                onClick={onExplore3D}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F7F0E3] text-[#2B1B16] border border-[#C28E5C]/50 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#C28E5C]" />
                <span>Interactive 3D Drink Studio</span>
              </button>
            </div>

            {/* Highlights Bar */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#C28E5C]/30 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-xl font-serif font-bold text-[#C28E5C]">25-35m</div>
                <div className="text-[11px] text-[#F7F0E3]/80">Express Delivery</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-serif font-bold text-[#FFFFFF]">100%</div>
                <div className="text-[11px] text-[#F7F0E3]/80">Arabica Specialty</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-serif font-bold text-[#C28E5C]">Fresh Boba</div>
                <div className="text-[11px] text-[#F7F0E3]/80">Simmered Daily</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#C28E5C]/40 shadow-2xl bg-[#FFFFFF]">
              <img
                src={cafeBackground}
                alt="Shatu's Cozy Cup Aesthetic Concept"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B16] via-[#2B1B16]/30 to-transparent" />

              {/* Floating highlight badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#FFFFFF] shadow-xl border border-[#C28E5C]/40 text-[#2B1B16] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[#C28E5C] text-xs mb-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#C28E5C] text-[#C28E5C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C28E5C] text-[#C28E5C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C28E5C] text-[#C28E5C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C28E5C] text-[#C28E5C]" />
                    <Star className="w-3.5 h-3.5 fill-[#C28E5C] text-[#C28E5C]" />
                    <span className="text-[#2B1B16] font-bold ml-1">4.9/5.0</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#2B1B16]">
                    "Best iced matcha and boba delivery in town!"
                  </h4>
                  <p className="text-[11px] text-[#6F4E37] font-medium">Handcrafted fresh upon every order</p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#6F4E37] text-[#FFFFFF] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                  🧋
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
