export type UserRole = 'BUYER' | 'SELLER';

export interface User {
  id: string;
  name: string;
  email: string;
  className: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: string;
}

export type ProductStatus = 'AVAILABLE' | 'SOLD_OUT' | 'HIDDEN';

export type ProductSaleState = 'AVAILABLE' | 'UPCOMING' | 'SOLD_OUT' | 'HIDDEN';

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  imageUrl: string; // Primary image
  price: number;
  status: ProductStatus;
  createdAt: string;
  openingAt: string; // Readable display, e.g. "08:30 — 24/08/2026"
  openSaleTimestamp?: number; // Authoritative UTC/Unix timestamp in ms
  openingHour?: number; // 0 - 23
  openingMinute?: number; // 0 - 59
  openingDate?: string; // YYYY-MM-DD
  deliveryPeriods: string[]; // e.g. ["Ra chơi sáng", "Ra chơi chiều", "10:00 - 11:00"]
  deliveryPeriod: string; // Primary/first delivery period for quick display
  soldOutAt?: number; // timestamp in ms when sold out
  createdBy: string;
  category?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  deliveryPeriod: string;
}

export type PickupMethod = 'CLASS' | 'OTHER';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';

export type RealtimeConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface RealtimeNotification {
  id: string;
  type: 'NEW_ORDER' | 'ORDER_STATUS' | 'PRODUCT_SOLD';
  title: string;
  message: string;
  details?: {
    orderId?: string;
    customerName?: string;
    className?: string;
    customerPhone?: string;
    productNames?: string[];
    pickupLocation?: string;
    orderNotes?: string;
    status?: OrderStatus;
    total?: number;
    orderedAt?: string;
  };
  timestamp: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  className: string;
  customerPhone: string;
  pickupMethod: PickupMethod;
  pickupLocation: string; // e.g. "Lớp 10A1" or "Căn tin / Thư viện"
  orderNotes?: string;
  createdAt: string;
  expectedDeliveryDate: string; // e.g. "Thứ Hai (24/08/2026)"
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

export interface Settings {
  hotline: string;
}

