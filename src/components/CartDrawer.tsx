import React, { useState } from 'react';
import { CartItem, OrderSuccessData, OrderPaymentDetails, ThemeMode } from '../types';
import { formatNaira } from '../utils/formatCurrency';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  CreditCard,
  Building2,
  Lock,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OnlinePaymentModal } from './OnlinePaymentModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  theme: ThemeMode;
  onUpdateQuantity: (cartId: string, newQty: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onOpenCheckoutSuccess: (orderData: OrderSuccessData) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  theme,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckoutSuccess,
}) => {
  const [orderType, setOrderType] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [tableOrAddress, setTableOrAddress] = useState<string>('');
  const [paymentChoice, setPaymentChoice] = useState<'online' | 'delivery'>('online');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOnlinePaymentModalOpen, setIsOnlinePaymentModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const subtotal = cart.reduce((acc, item) => acc + item.itemTotalPrice, 0);
  const vatTax = subtotal * 0.075; // 7.5% Nigerian VAT
  const deliveryFee = orderType === 'Delivery' ? 1500 : 0;
  const tipAmount = (subtotal * tipPercentage) / 100;
  const grandTotal = subtotal + vatTax + deliveryFee + tipAmount;

  // Handles placing order when Pay on Delivery is chosen
  const handlePlaceOrderWithPayOnDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    setIsSubmitting(true);
    const orderId = `SC-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentDetails: OrderPaymentDetails = {
      method: 'pay_on_delivery',
      methodLabel: 'Cash / POS Machine on Doorstep Delivery',
      referenceId: `REF-POD-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'pending_on_delivery',
      paidAt: 'Pay Upon Arrival',
    };

    try {
      await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName,
          customerPhone,
          orderType,
          tableOrAddress,
          cart,
          subtotal,
          vatTax,
          deliveryFee,
          tipAmount,
          grandTotal,
          payment: paymentDetails,
        }),
      }).catch(() => null);
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#2B1B16', '#6F4E37', '#C28E5C', '#F7F0E3', '#FFFFFF'],
    });

    onOpenCheckoutSuccess({
      id: orderId,
      customerName,
      customerPhone,
      total: grandTotal,
      orderType,
      address: tableOrAddress || 'Studio Curbside Dispatch',
      payment: paymentDetails,
      items: [...cart],
    });

    onClearCart();
    setIsCheckingOut(false);
    onClose();
  };

  // Triggered when user selects Online Payment
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    if (orderType === 'Delivery' && !tableOrAddress.trim()) return;

    if (paymentChoice === 'online') {
      setIsOnlinePaymentModalOpen(true);
    } else {
      handlePlaceOrderWithPayOnDelivery(e);
    }
  };

  // Called when OnlinePaymentModal completes payment
  const handleOnlinePaymentSuccess = async (paymentDetails: OrderPaymentDetails) => {
    setIsOnlinePaymentModalOpen(false);
    const orderId = `SC-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName,
          customerPhone,
          orderType,
          tableOrAddress,
          cart,
          subtotal,
          vatTax,
          deliveryFee,
          tipAmount,
          grandTotal,
          payment: paymentDetails,
        }),
      }).catch(() => null);
    } catch {
      // ignore
    }

    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#2B1B16', '#6F4E37', '#C28E5C', '#F7F0E3', '#FFFFFF'],
    });

    onOpenCheckoutSuccess({
      id: orderId,
      customerName,
      customerPhone,
      total: grandTotal,
      orderType,
      address: tableOrAddress || 'Doorstep Delivery',
      payment: paymentDetails,
      items: [...cart],
    });

    onClearCart();
    setIsCheckingOut(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div
            id="cart-drawer-panel"
            className={`w-screen max-w-md flex flex-col shadow-2xl transition-colors ${
              isDark
                ? 'bg-[#231612] border-l border-[#C28E5C]/30 text-[#F7F0E3]'
                : 'bg-[#FFFFFF] border-l border-[#C28E5C]/30 text-[#2B1B16]'
            }`}
          >
            {/* Header - Dark Espresso */}
            <div className="p-6 bg-[#2B1B16] border-b border-[#C28E5C]/20 flex items-center justify-between text-[#FFFFFF]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#6F4E37] text-[#FFFFFF] border border-[#C28E5C]/40">
                  <ShoppingBag className="w-5 h-5 text-[#C28E5C]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#FFFFFF]">Your Online Order</h3>
                  <p className="text-xs text-[#F7F0E3]/70">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'} ready for fresh prep
                  </p>
                </div>
              </div>

              <button
                id="close-cart-btn"
                onClick={onClose}
                className="p-2 rounded-xl text-[#F7F0E3]/75 hover:text-[#FFFFFF] hover:bg-[#6F4E37]/40 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: Cart Items or Checkout View */}
            <div
              className={`flex-1 overflow-y-auto p-6 space-y-4 ${
                isDark ? 'bg-[#1D120F]' : 'bg-[#F7F0E3]/40'
              }`}
            >
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border shadow-sm ${
                      isDark
                        ? 'bg-[#2B1B16] text-[#C28E5C] border-[#C28E5C]/40'
                        : 'bg-[#FFFFFF] text-[#6F4E37] border-[#C28E5C]/40'
                    }`}
                  >
                    ☕
                  </div>
                  <h4 className="font-serif text-lg font-bold">Your Cup is Empty</h4>
                  <p className="text-xs opacity-75 max-w-xs leading-relaxed">
                    Treat yourself to a velvety cappuccino, artisan heart latte, Kyoto matcha, or tiger brown sugar boba!
                  </p>
                </div>
              ) : isCheckingOut ? (
                /* Checkout Form */
                <form id="checkout-form" onSubmit={handleInitiatePayment} className="space-y-4">
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs shadow-sm ${
                      isDark
                        ? 'bg-[#2B1B16] border-[#C28E5C]/40'
                        : 'bg-[#FFFFFF] border-[#C28E5C]/40'
                    }`}
                  >
                    <span className="font-medium">Order Total:</span>
                    <span className="font-bold font-mono text-sm text-[#6F4E37] dark:text-[#C28E5C]">
                      {formatNaira(grandTotal)}
                    </span>
                  </div>

                  {/* Fulfillment Method Toggle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C] mb-1.5">
                      Fulfillment Mode (Online Studio)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Delivery', 'Pickup'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setOrderType(type)}
                          className={`py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                            orderType === type
                              ? 'bg-[#6F4E37] border-[#C28E5C] text-[#FFFFFF] shadow-md ring-1 ring-[#C28E5C]'
                              : isDark
                              ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3]/75 hover:bg-[#34201A]'
                              : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16] hover:bg-[#F7F0E3]'
                          }`}
                        >
                          {type === 'Delivery' ? '🛵 Doorstep Delivery' : '📦 Studio Pickup'}
                          {type === 'Delivery' && (
                            <span className="block text-[10px] text-[#C28E5C]">+₦1,500</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Shatu Adamu"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm placeholder:opacity-40 focus:outline-none focus:border-[#6F4E37] ${
                        isDark
                          ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Phone Number (for SMS dispatch alerts) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm placeholder:opacity-40 focus:outline-none focus:border-[#6F4E37] ${
                        isDark
                          ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      {orderType === 'Delivery'
                        ? 'Delivery Address (Street, House/Flat No., Area) *'
                        : 'Estimated Pickup Time Note (optional)'}
                    </label>
                    <input
                      type="text"
                      required={orderType === 'Delivery'}
                      value={tableOrAddress}
                      onChange={(e) => setTableOrAddress(e.target.value)}
                      placeholder={
                        orderType === 'Delivery'
                          ? 'e.g. Flat 4B, Palmview Towers, Victoria Island'
                          : 'e.g. Ready around 12:30pm'
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm placeholder:opacity-40 focus:outline-none focus:border-[#6F4E37] ${
                        isDark
                          ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
                      }`}
                    />
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-2 border-t border-[#C28E5C]/20 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C]">
                      Choose Payment Method
                    </label>

                    <div className="space-y-2">
                      {/* Option 1: Pay Online Now */}
                      <label
                        className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                          paymentChoice === 'online'
                            ? 'bg-[#6F4E37]/15 border-[#6F4E37] dark:border-[#C28E5C] ring-1 ring-[#6F4E37]'
                            : isDark
                            ? 'bg-[#2B1B16] border-[#C28E5C]/30 hover:border-[#C28E5C]'
                            : 'bg-[#FFFFFF] border-[#C28E5C]/30 hover:border-[#6F4E37]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentChoice"
                          value="online"
                          checked={paymentChoice === 'online'}
                          onChange={() => setPaymentChoice('online')}
                          className="mt-0.5 accent-[#6F4E37]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-[#C28E5C]" />
                              Pay Online Now
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C28E5C]/20 text-[#6F4E37] dark:text-[#C28E5C] font-bold">
                              Instant Receipt
                            </span>
                          </div>
                          <p className="text-[11px] opacity-75 mt-0.5">
                            Card (Mastercard/Visa/Verve), Instant Bank Transfer, USSD, or Apple Pay.
                          </p>
                        </div>
                      </label>

                      {/* Option 2: Pay on Delivery */}
                      <label
                        className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                          paymentChoice === 'delivery'
                            ? 'bg-[#6F4E37]/15 border-[#6F4E37] dark:border-[#C28E5C] ring-1 ring-[#6F4E37]'
                            : isDark
                            ? 'bg-[#2B1B16] border-[#C28E5C]/30 hover:border-[#C28E5C]'
                            : 'bg-[#FFFFFF] border-[#C28E5C]/30 hover:border-[#6F4E37]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentChoice"
                          value="delivery"
                          checked={paymentChoice === 'delivery'}
                          onChange={() => setPaymentChoice('delivery')}
                          className="mt-0.5 accent-[#6F4E37]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-[#C28E5C]" />
                              Pay on Delivery
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold">
                              Cash / POS
                            </span>
                          </div>
                          <p className="text-[11px] opacity-75 mt-0.5">
                            Pay the dispatch courier with Cash or Card POS machine upon arrival.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                        isDark
                          ? 'bg-[#2B1B16] hover:bg-[#34201A] text-[#F7F0E3] border-[#C28E5C]/40'
                          : 'bg-[#FFFFFF] hover:bg-[#F7F0E3] text-[#2B1B16] border-[#C28E5C]/40'
                      }`}
                    >
                      Back to Cart
                    </button>
                    <button
                      id="submit-place-order-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      {paymentChoice === 'online' ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#C28E5C]" />
                          <span>Pay Online Now</span>
                        </>
                      ) : (
                        <span>Confirm Order</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Item List */
                cart.map((cartItem) => (
                  <div
                    key={cartItem.cartId}
                    className={`p-3.5 rounded-2xl border shadow-sm space-y-2.5 transition-colors ${
                      isDark
                        ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3]'
                        : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <img
                        src={cartItem.item.image}
                        alt={cartItem.item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{cartItem.item.name}</h4>
                        <p className="text-xs text-[#6F4E37] dark:text-[#C28E5C] font-mono font-bold">
                          {formatNaira(cartItem.itemTotalPrice)}
                        </p>
                        <div className="text-[11px] opacity-75 leading-tight space-y-0.5 mt-1">
                          <div>
                            {cartItem.customization.size} • {cartItem.customization.milk}
                          </div>
                          <div>
                            {cartItem.customization.sweetness} • {cartItem.customization.ice}
                          </div>
                          {cartItem.customization.toppings.length > 0 && (
                            <div className="text-[#C28E5C] font-medium">
                              + {cartItem.customization.toppings.join(', ')}
                            </div>
                          )}
                          {cartItem.customization.specialInstructions && (
                            <div className="italic opacity-70">
                              "{cartItem.customization.specialInstructions}"
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(cartItem.cartId)}
                        className="p-1.5 opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#C28E5C]/20">
                      <button
                        onClick={() => onUpdateQuantity(cartItem.cartId, cartItem.quantity - 1)}
                        className={`p-1 rounded-lg border transition-colors ${
                          isDark
                            ? 'bg-[#231612] hover:bg-[#34201A] border-[#C28E5C]/40 text-[#F7F0E3]'
                            : 'bg-[#F7F0E3] hover:bg-[#EFE4D2] border-[#C28E5C]/30 text-[#2B1B16]'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold px-2">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(cartItem.cartId, cartItem.quantity + 1)}
                        className={`p-1 rounded-lg border transition-colors ${
                          isDark
                            ? 'bg-[#231612] hover:bg-[#34201A] border-[#C28E5C]/40 text-[#F7F0E3]'
                            : 'bg-[#F7F0E3] hover:bg-[#EFE4D2] border-[#C28E5C]/30 text-[#2B1B16]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary (Visible when not checking out and cart has items) */}
            {cart.length > 0 && !isCheckingOut && (
              <div
                className={`p-6 border-t space-y-4 ${
                  isDark
                    ? 'bg-[#231612] border-[#C28E5C]/30'
                    : 'bg-[#FFFFFF] border-[#C28E5C]/30'
                }`}
              >
                {/* Tip Selection */}
                <div>
                  <div className="flex items-center justify-between text-xs opacity-80 mb-1.5 font-medium">
                    <span>Barista Gratitude Tip:</span>
                    <span className="text-[#6F4E37] dark:text-[#C28E5C] font-mono font-bold">
                      {formatNaira(tipAmount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPercentage(pct)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          tipPercentage === pct
                            ? 'bg-[#6F4E37] border-[#C28E5C] text-[#FFFFFF] shadow-sm'
                            : isDark
                            ? 'bg-[#2B1B16] border-[#C28E5C]/30 text-[#F7F0E3] hover:bg-[#34201A]'
                            : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16] hover:bg-[#EFE4D2]'
                        }`}
                      >
                        {pct === 0 ? 'No tip' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="space-y-1.5 text-xs opacity-80 border-t border-[#C28E5C]/20 pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (7.5%)</span>
                    <span className="font-mono">{formatNaira(vatTax)}</span>
                  </div>
                  {orderType === 'Delivery' && (
                    <div className="flex justify-between">
                      <span>Express Doorstep Delivery</span>
                      <span className="font-mono text-[#6F4E37] dark:text-[#C28E5C] font-bold">
                        {formatNaira(deliveryFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-[#C28E5C]/30">
                    <span>Total</span>
                    <span className="font-mono text-[#6F4E37] dark:text-[#C28E5C] text-base">
                      {formatNaira(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  id="proceed-to-checkout-btn"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] active:scale-[0.98] text-[#FFFFFF] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 border border-[#C28E5C]/40"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Online Payment Modal */}
      <OnlinePaymentModal
        isOpen={isOnlinePaymentModalOpen}
        onClose={() => setIsOnlinePaymentModalOpen(false)}
        totalAmount={grandTotal}
        customerName={customerName}
        customerPhone={customerPhone}
        orderType={orderType}
        theme={theme}
        onSuccess={handleOnlinePaymentSuccess}
      />
    </>
  );
};
