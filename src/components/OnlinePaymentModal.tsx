import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building2,
  PhoneCall,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { formatNaira } from '../utils/formatCurrency';
import { OrderPaymentDetails, PaymentMethod, ThemeMode } from '../types';

interface OnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  orderType: string;
  theme: ThemeMode;
  onSuccess: (paymentDetails: OrderPaymentDetails) => void;
}

export const OnlinePaymentModal: React.FC<OnlinePaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  customerName,
  customerPhone,
  orderType,
  theme,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<PaymentMethod>('card');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [ussdBank, setUssdBank] = useState<string>('GTBank');
  const [timeLeft, setTimeLeft] = useState<number>(899); // 15 mins

  // Card form state
  const [cardNumber, setCardNumber] = useState<string>('5399 4100 2893 1120');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('482');
  const [cardHolder, setCardHolder] = useState<string>(customerName || 'Shatu Adamu');

  // Virtual account timer
  useEffect(() => {
    if (activeTab !== 'bank_transfer') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardExpiry(val);
  };

  const handleQuickDemoCard = () => {
    setCardNumber('5399 4100 2893 1120');
    setCardExpiry('12/28');
    setCardCvv('482');
    setCardHolder(customerName || 'Shatu Adamu');
  };

  // Card brand detection
  const getCardBrand = () => {
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (cleanNum.startsWith('5')) return 'Mastercard';
    if (cleanNum.startsWith('506') || cleanNum.startsWith('650')) return 'Verve';
    return 'Mastercard';
  };

  // Execute realistic payment verification
  const executePayment = async (method: PaymentMethod, label: string) => {
    setIsProcessing(true);
    setProcessingStep('Connecting to secure banking gateway...');

    await new Promise((resolve) => setTimeout(resolve, 600));
    setProcessingStep('Encrypting 256-bit payment token...');

    await new Promise((resolve) => setTimeout(resolve, 800));
    setProcessingStep('Verifying 3D-Secure authorization...');

    await new Promise((resolve) => setTimeout(resolve, 700));
    setProcessingStep('Payment authorized & confirmed!');

    await new Promise((resolve) => setTimeout(resolve, 400));

    const referenceId = `SC-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const cardLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '1120';

    setIsProcessing(false);
    onSuccess({
      method,
      methodLabel: label,
      referenceId,
      status: 'paid',
      paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cardLast4: method === 'card' ? cardLast4 : undefined,
      cardBrand: method === 'card' ? getCardBrand() : undefined,
      bankName: method === 'bank_transfer' ? 'Wema Bank' : method === 'ussd' ? ussdBank : undefined,
    });
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDark
            ? 'bg-[#231612] border-[#C28E5C]/40 text-[#F7F0E3]'
            : 'bg-[#FFFFFF] border-[#C28E5C]/30 text-[#2B1B16]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#2B1B16] text-[#FFFFFF] flex items-center justify-between border-b border-[#C28E5C]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6F4E37] flex items-center justify-center text-sm border border-[#C28E5C]/50">
              🔒
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm tracking-tight">
                  Shatu's Secure Pay
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C28E5C] text-[#2B1B16] font-bold">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-[10px] text-[#F7F0E3]/70">
                Official Paystack / Interswitch Verified Checkout
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl text-[#F7F0E3]/70 hover:text-[#FFFFFF] hover:bg-[#6F4E37]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Summary Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark
              ? 'bg-[#2B1B16]/60 border-[#C28E5C]/20'
              : 'bg-[#F7F0E3] border-[#C28E5C]/30'
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold text-[#6F4E37] dark:text-[#C28E5C] uppercase tracking-wider block">
              Total Amount to Pay
            </span>
            <span className="font-serif font-bold text-2xl text-[#2B1B16] dark:text-[#FFFFFF]">
              {formatNaira(totalAmount)}
            </span>
          </div>

          <div className="text-right text-[11px]">
            <span className="text-[#2B1B16]/70 dark:text-[#F7F0E3]/70 block">
              Customer: <strong className="text-[#2B1B16] dark:text-[#FFFFFF]">{customerName || 'Valued Guest'}</strong>
            </span>
            <span className="text-[#6F4E37] dark:text-[#C28E5C] font-medium">
              Doorstep Delivery Order
            </span>
          </div>
        </div>

        {/* Processing State Overlay */}
        {isProcessing ? (
          <div className="p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-[#C28E5C]/30 border-t-[#6F4E37] dark:border-t-[#C28E5C] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                ☕
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-lg text-[#2B1B16] dark:text-[#FFFFFF]">
                Processing Secure Payment
              </h4>
              <p className="text-xs text-[#6F4E37] dark:text-[#C28E5C] animate-pulse font-medium">
                {processingStep}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#2B1B16]/60 dark:text-[#F7F0E3]/60">
              <Lock className="w-3.5 h-3.5 text-[#C28E5C]" />
              <span>Please do not close this window or refresh</span>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
                { id: 'bank_transfer' as PaymentMethod, label: 'Transfer', icon: Building2 },
                { id: 'ussd' as PaymentMethod, label: 'USSD', icon: PhoneCall },
                { id: 'apple_pay' as PaymentMethod, label: 'Apple Pay', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-[#6F4E37] text-[#FFFFFF] border-[#C28E5C] shadow-md ring-1 ring-[#C28E5C]'
                        : isDark
                        ? 'bg-[#2B1B16] text-[#F7F0E3]/70 border-[#C28E5C]/30 hover:text-[#FFFFFF]'
                        : 'bg-[#F7F0E3] text-[#2B1B16]/70 border-[#C28E5C]/30 hover:text-[#2B1B16]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: CARD PAYMENT */}
            {activeTab === 'card' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Visual Debit Card preview */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2B1B16] via-[#432A23] to-[#2B1B16] text-[#FFFFFF] border border-[#C28E5C]/50 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C28E5C]/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase tracking-widest text-[#C28E5C] font-mono font-bold">
                      Shatu's Debit Card
                    </span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#C28E5C] text-[#2B1B16] tracking-wider">
                      {getCardBrand()}
                    </span>
                  </div>

                  <div className="font-mono text-base sm:text-lg tracking-widest text-[#FFFFFF] my-2">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#F7F0E3]/75 mt-3 pt-2 border-t border-[#C28E5C]/30 font-mono">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#C28E5C] block">
                        Cardholder
                      </span>
                      <span className="font-sans font-medium text-xs text-[#FFFFFF]">
                        {cardHolder || 'Customer Name'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-[#C28E5C] block">
                        Expires
                      </span>
                      <span>{cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Card input fields */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold">Card Details</label>
                    <button
                      type="button"
                      onClick={handleQuickDemoCard}
                      className="text-[11px] font-bold text-[#6F4E37] dark:text-[#C28E5C] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Fill Demo Card
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="Card Number (5399 0000 0000 0000)"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#6F4E37] ${
                        isDark
                          ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#6F4E37] ${
                          isDark
                            ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                            : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
                        }`}
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.substring(0, 4))}
                        placeholder="CVV (3 digits)"
                        maxLength={4}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#6F4E37] ${
                          isDark
                            ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                            : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="confirm-card-payment-btn"
                  onClick={() => executePayment('card', `${getCardBrand()} •••• ${cardNumber.slice(-4)}`)}
                  className="w-full py-3 rounded-2xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 border border-[#C28E5C]/40 active:scale-[0.99]"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C28E5C]" />
                  <span>Pay {formatNaira(totalAmount)} with Card</span>
                </button>
              </div>
            )}

            {/* TAB 2: INSTANT BANK TRANSFER */}
            {activeTab === 'bank_transfer' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isDark
                      ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#F7F0E3]'
                      : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#C28E5C]/20">
                    <span className="text-[#6F4E37] dark:text-[#C28E5C] font-semibold uppercase tracking-wider text-[10px]">
                      Virtual Dynamic Account
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      Expires in: {formatTimer(timeLeft)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#2B1B16]/70 dark:text-[#F7F0E3]/70">Bank Name:</span>
                      <span className="font-bold">Wema Bank / Providus Bank</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#2B1B16]/70 dark:text-[#F7F0E3]/70">Account Name:</span>
                      <span className="font-medium">Shatu's Cozy Cup / Paystack Checkout</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[#2B1B16]/70 dark:text-[#F7F0E3]/70">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-[#6F4E37] dark:text-[#C28E5C]">
                          9938491024
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('9938491024')}
                          className="p-1 rounded-lg bg-[#6F4E37] text-[#FFFFFF] hover:bg-[#5A3E2B] transition-colors"
                          title="Copy Account Number"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-[#C28E5C]/20">
                      <span className="text-[#2B1B16]/70 dark:text-[#F7F0E3]/70">Exact Amount:</span>
                      <span className="font-mono font-bold text-sm text-[#2B1B16] dark:text-[#FFFFFF]">
                        {formatNaira(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#2B1B16]/70 dark:text-[#F7F0E3]/70 leading-relaxed text-center">
                  Please transfer the exact sum of <strong>{formatNaira(totalAmount)}</strong> to the virtual account above. Our automated gateway matches your payment within 10 seconds.
                </p>

                <button
                  type="button"
                  id="confirm-transfer-payment-btn"
                  onClick={() => executePayment('bank_transfer', 'Instant Bank Transfer (Wema Bank)')}
                  className="w-full py-3 rounded-2xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 border border-[#C28E5C]/40"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C28E5C]" />
                  <span>I Have Sent the Transfer ({formatNaira(totalAmount)})</span>
                </button>
              </div>
            )}

            {/* TAB 3: USSD CODE */}
            {activeTab === 'ussd' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div>
                  <label className="font-semibold block mb-1.5">Select Your Bank</label>
                  <select
                    value={ussdBank}
                    onChange={(e) => setUssdBank(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#6F4E37] ${
                      isDark
                        ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#FFFFFF]'
                        : 'bg-[#FFFFFF] border-[#C28E5C]/40 text-[#2B1B16]'
                    }`}
                  >
                    <option value="GTBank">Guaranty Trust Bank (*737#)</option>
                    <option value="Access Bank">Access Bank (*901#)</option>
                    <option value="Zenith Bank">Zenith Bank (*966#)</option>
                    <option value="UBA">United Bank for Africa (*919#)</option>
                    <option value="First Bank">First Bank of Nigeria (*894#)</option>
                  </select>
                </div>

                <div
                  className={`p-4 rounded-2xl border text-center space-y-2 ${
                    isDark
                      ? 'bg-[#2B1B16] border-[#C28E5C]/40 text-[#F7F0E3]'
                      : 'bg-[#F7F0E3] border-[#C28E5C]/30 text-[#2B1B16]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F4E37] dark:text-[#C28E5C]">
                    Dial This Code On Your Registered Phone:
                  </span>
                  <div className="font-mono font-bold text-lg text-[#2B1B16] dark:text-[#FFFFFF] flex items-center justify-center gap-2">
                    <span>
                      {ussdBank === 'GTBank' && '*737*000*8492#'}
                      {ussdBank === 'Access Bank' && '*901*000*8492#'}
                      {ussdBank === 'Zenith Bank' && '*966*000*8492#'}
                      {ussdBank === 'UBA' && '*919*000*8492#'}
                      {ussdBank === 'First Bank' && '*894*000*8492#'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyAccount(
                          ussdBank === 'GTBank'
                            ? '*737*000*8492#'
                            : ussdBank === 'Access Bank'
                            ? '*901*000*8492#'
                            : '*966*000*8492#'
                        )
                      }
                      className="p-1 rounded-lg bg-[#6F4E37] text-[#FFFFFF]"
                      title="Copy USSD Code"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#2B1B16]/60 dark:text-[#F7F0E3]/60">
                    Dial on your registered SIM, enter your 4-digit bank PIN, and click confirm below.
                  </p>
                </div>

                <button
                  type="button"
                  id="confirm-ussd-payment-btn"
                  onClick={() => executePayment('ussd', `USSD Transfer (${ussdBank})`)}
                  className="w-full py-3 rounded-2xl bg-[#6F4E37] hover:bg-[#5A3E2B] text-[#FFFFFF] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 border border-[#C28E5C]/40"
                >
                  <PhoneCall className="w-4 h-4 text-[#C28E5C]" />
                  <span>I Have Dialed & Authorized Payment</span>
                </button>
              </div>
            )}

            {/* TAB 4: APPLE PAY */}
            {activeTab === 'apple_pay' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-[#2B1B16] text-[#FFFFFF] flex items-center justify-center mx-auto text-2xl border border-[#C28E5C]/40 shadow-inner">
                  🍎
                </div>
                <div className="space-y-1">
                  <h5 className="font-serif font-bold text-sm text-[#2B1B16] dark:text-[#FFFFFF]">
                    Apple Pay / Google Pay Express
                  </h5>
                  <p className="text-xs text-[#2B1B16]/70 dark:text-[#F7F0E3]/70 max-w-xs mx-auto">
                    Complete your order in one touch with Face ID, Touch ID, or Google Wallet biometric security.
                  </p>
                </div>

                <button
                  type="button"
                  id="confirm-apple-pay-btn"
                  onClick={() => executePayment('apple_pay', 'Apple Pay Biometric Express')}
                  className="w-full py-3.5 rounded-2xl bg-[#2B1B16] hover:bg-[#1A100D] text-[#FFFFFF] text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 border border-[#C28E5C]/50"
                >
                  <span className="text-base"></span>
                  <span>Pay {formatNaira(totalAmount)} with Apple Pay</span>
                </button>
              </div>
            )}

            {/* Footer Trust Guarantee */}
            <div className="pt-2 border-t border-[#C28E5C]/20 flex items-center justify-between text-[10px] text-[#2B1B16]/60 dark:text-[#F7F0E3]/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C28E5C]" />
                <span>PCI-DSS Level 1 Compliant</span>
              </div>
              <span>Immediate Delivery Dispatch</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
