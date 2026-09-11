export type DrinkCategory = 'all' | 'coffee' | 'matcha' | 'boba' | 'cold-brew' | 'pastries';

export type ThemeMode = 'light' | 'dark';

export type PaymentMethod =
  | 'card'
  | 'bank_transfer'
  | 'ussd'
  | 'apple_pay'
  | 'pay_on_delivery';

export interface OrderPaymentDetails {
  method: PaymentMethod;
  methodLabel: string;
  referenceId: string;
  status: 'paid' | 'pending_on_delivery';
  paidAt: string;
  cardLast4?: string;
  cardBrand?: string;
  bankName?: string;
}

export interface OrderSuccessData {
  id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  orderType: string;
  address: string;
  payment: OrderPaymentDetails;
  items: CartItem[];
}

export interface DrinkCustomizationOptions {
  size: 'Regular (12oz)' | 'Large (16oz)' | 'Grande (20oz)';
  milk: 'Whole Milk' | 'Oat Milk' | 'Almond Milk' | 'Coconut Milk' | 'Soy Milk' | 'Breve';
  sweetness: '0% (Unsweetened)' | '25% (Light)' | '50% (Half)' | '75% (Sweet)' | '100% (Standard)';
  ice: 'Hot' | 'No Ice' | 'Less Ice' | 'Regular Ice' | 'Extra Ice';
  toppings: string[];
  specialInstructions?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'coffee' | 'matcha' | 'boba' | 'cold-brew' | 'pastries';
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  dietary?: ('Vegan' | 'Dairy-Free' | 'Gluten-Free' | 'Caffeine-Free')[];
  temperature: 'hot' | 'cold' | 'both';
  threeDType?: 'cappuccino' | 'latte' | 'espresso' | 'matcha' | 'boba' | 'iced-brew';
  layers?: { name: string; percentage: number; color: string; description: string }[];
  flavorNotes?: string[];
  calories?: number;
}

export interface CartItem {
  cartId: string;
  item: MenuItem;
  quantity: number;
  customization: DrinkCustomizationOptions;
  itemTotalPrice: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}
