import React, { useState } from 'react';
import {
  Clock,
  X,
  MessageSquare,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Copy,
  Check,
  Receipt,
  Truck,
  Sparkles,
} from 'lucide-react';
import { formatNaira } from '../utils/formatCurrency';
import { OrderSuccessData, ThemeMode } from '../types';

interface OrderSuccessModalProps {
  orderData: OrderSuccessData | null;
  theme: ThemeMode;
  onClose: () => void;
  onOpenChat: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderData,
  theme,
  onClose,
  onOpenChat,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);

  if (!orderData) return null;

  const isDark = theme === 'dark';

  const handleCopyRef = () => {
    if (orderData.payment?.referenceId) {
      navigator.clipboard.writeText(orderData.payment.referenceId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const isPaidOnline = orderData.payment?.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden space-y-6 border transition-colors max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#231612] border-[#C28E5C]/40 text-[#F7F0E3]'
            : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors ${
            isDark
              ? 'bg-[#2B1B16] text-[#F7F0E3]/70 hover:text-[#FFFFFF] border-[#C28E5C]/40 hover:bg-[#34201A]'
              : 'bg-[#F7F0E3] text-[#2B1B16]/70 hover:text-[#2B1B16] border-[#C28E5C]/30 hover:bg-[#EFE4D2]'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Seal */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-[#6F4E37] text-[#FFFFFF] border border-[#C28E5C]/40 flex items-center justify-center mx-auto text-3xl shadow-md">
            ☕✨
          </div>
          <h3 className="text-2xl font-serif font-bold tracking-tight">
            Order Confirmed & Paid!
          </h3>
          <p className="text-xs opacity-75 max-w-sm mx-auto leading-relaxed">
            Thank you, <strong className="opacity-100">{orderData.customerName}</strong>! Your order has been scheduled for priority barista handcrafted brewing.
          </p>
        </div>

        {/* Payment Verified Ribbon */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
            isPaidOnline
              ? isDark
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : isDark
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <div>
              <span className="font-bold block">
                {isPaidOnline ? 'Online Payment Verified' : 'Payment on Delivery'}
              </span>
              <span className="text-[11px] opacity-80">
                {orderData.payment?.methodLabel || 'Digital Gateway Confirmation'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="opacity-75">{orderData.payment?.referenceId}</span>
            <button
              onClick={handleCopyRef}
              className="p-1 rounded hover:bg-black/10 transition-colors"
              title="Copy Reference"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Order Details Card */}
        <div
          className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
            isDark
              ? 'bg-[#2B1B16] border-[#C28E5C]/30'
              : 'bg-[#F7F0E3] border-[#C28E5C]/30'
          }`}
        >
          <div className="flex justify-between items-center pb-2 border-b border-[#C28E5C]/20">
            <span className="opacity-80 uppercase tracking-wider font-bold">Order Tracking ID</span>
            <span className="font-mono font-bold text-[#6F4E37] dark:text-[#C28E5C] text-sm">
              {orderData.id}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="opacity-75">Fulfillment Mode:</span>
            <span className="font-semibold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#C28E5C]" />
              {orderData.orderType}
            </span>
          </div>

          {orderData.address && (
            <div className="flex justify-between items-start gap-4">
              <span className="opacity-75">Address / Instructions:</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {orderData.address}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="opacity-75">Amount Paid:</span>
            <span className="font-mono font-bold text-[#6F4E37] dark:text-[#C28E5C] text-sm">
              {formatNaira(orderData.total)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-[#C28E5C]/20">
            <span className="opacity-75">Estimated Delivery Arrival:</span>
            <span className="font-semibold text-[#6F4E37] dark:text-[#C28E5C] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 25 - 35 mins
            </span>
          </div>
        </div>

        {/* Items Summary list */}
        {orderData.items && orderData.items.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C]">
              Items In This Order ({orderData.items.length})
            </span>
            <div
              className={`p-3 rounded-2xl border divide-y divide-[#C28E5C]/20 text-xs ${
                isDark
                  ? 'bg-[#2B1B16]/70 border-[#C28E5C]/30'
                  : 'bg-[#F7F0E3]/70 border-[#C28E5C]/30'
              }`}
            >
              {orderData.items.map((item, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <span className="font-semibold">
                      {item.quantity}x {item.item.name}
                    </span>
                    <span className="text-[10px] block opacity-70">
                      {item.customization.size} • {item.customization.milk}
                    </span>
                  </div>
                  <span className="font-mono font-bold opacity-80">
                    {formatNaira(item.itemTotalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Progress Steps */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] dark:text-[#C28E5C]">
            Live Kitchen & Dispatch Tracker
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div
              className={`p-2.5 rounded-xl border ${
                isDark
                  ? 'bg-[#2B1B16] border-[#C28E5C]/30'
                  : 'bg-[#F7F0E3] border-[#C28E5C]/30'
              }`}
            >
              <div className="font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>1. Verified</span>
              </div>
              <div className="text-[10px] opacity-70">Payment Confirmed</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#6F4E37] text-[#FFFFFF] border border-[#C28E5C] shadow-sm font-semibold animate-pulse">
              <div className="font-bold">2. Handcrafting</div>
              <div className="text-[10px] text-[#F7F0E3]/80">Steaming & Sealing</div>
            </div>
            <div
              className={`p-2.5 rounded-xl border opacity-60 ${
                isDark
                  ? 'bg-[#2B1B16] border-[#C28E5C]/20'
                  : 'bg-[#F7F0E3] border-[#C28E5C]/20'
              }`}
            >
              <div className="font-bold">3. Out on Bike</div>
              <div className="text-[10px]">Express Courier</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handlePrintReceipt}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-sm ${
              isDark
                ? 'bg-[#2B1B16] hover:bg-[#34201A] text-[#F7F0E3] border-[#C28E5C]/40'
                : 'bg-[#FFFFFF] hover:bg-[#F7F0E3] text-[#6F4E37] border-[#C28E5C]/40'
            }`}
          >
            <Printer className="w-4 h-4 text-[#C28E5C]" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-sm ${
              isDark
                ? 'bg-[#2B1B16] hover:bg-[#34201A] text-[#F7F0E3] border-[#C28E5C]/40'
                : 'bg-[#FFFFFF] hover:bg-[#F7F0E3] text-[#6F4E37] border-[#C28E5C]/40'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#C28E5C]" />
            <span>Chat with Concierge</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] text-xs font-bold transition-all shadow-md border border-[#C28E5C]/40"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
