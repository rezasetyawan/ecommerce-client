interface Product {
    id: string
    name: string
    sold: number
    price: number
    category_id: number
    category: string
    image_url: string
    slug: string
}

interface ProductDetail {
    id: string,
    name: string
    price: number
    description: string
    category_id: number
    sold: number
    category: string
    stocks: number
    images: { id: string, url: string }[]
    variants: { id: string, value: string, price: number, stocks: number, is_default: boolean }[]
}

interface CartItem {
    id: string
    product_id: string
    name: string
    variant_id: string
    quantity: number
    price: number
    image_url: string
}

interface Address {
    id: string
    name:string
    full_address: string
    district: string
    city: string
    province: string
    phone_number: string
    is_default: boolean
}

interface OrderData {
    user_id: string;
    address_id: string;
    total: number;
    receipt_number?: string;
    status: 'PENDING' | 'PAYMENT' | 'ONPROCESS' | 'SHIPPING' | 'CANCELEDED'
    created_at: string;
  }
  
  interface PaymentData {
    order_id: string;
    status: "PENDING" | "SUCCESS" | "EXPIRED" | "UNACTIVE";
    amount: number;
    struck: string;
  }
  
export type { Product, ProductDetail, CartItem, Address, OrderData, PaymentData }