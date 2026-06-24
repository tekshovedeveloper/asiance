export type AdminOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';

export type AdminOrderItem = {
  productId?: string;
  slug?: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
  selectedVariationName?: string;
  selectedAttributes?: Record<string, string>;
};

export type AdminOrderNote = {
  message: string;
  type: 'private' | 'customer';
  createdAt: string;
};

export type AdminOrder = {
  _id: string;
  userId?: string;
  orderNumber: number;
  status: AdminOrderStatus;
  customerName: string;
  billingName?: string;
  email: string;
  billingEmail?: string;
  phone?: string;
  billingAddress: string;
  shippingAddress: string;
  orderNotes?: string;
  origin?: string;
  paymentMethod?: string;
  items: AdminOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: AdminOrderNote[];
  createdAt: string;
  updatedAt: string;
};