interface Product {
    id: string
    name: string
    sold: number
    price: number
    category_id: number
    category: string
    image_url: string
    slug: string
    rating: string[] | []
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
    variant: string
    slug: string
}

interface Address {
    id: string
    name: string
    full_address: string
    district: string
    city: string
    province: string
    phone_number: string
    is_default: boolean
}

interface OrderData {
    user_id: string;
    total: number;
    status: "PENDING" | "PAYMENT" | "ONPROCESS" | "SHIPPING" | "CANCELLED" | "FINISHED";
    created_at: string;
}

interface PaymentData {
    order_id: string;
    status: "PENDING" | "SUCCESS" | "EXPIRED" | "UNACTIVE";
    amount: number;
    struck: string;
}

interface ShipmentData {
    service: string
    receipt_number?: string
    address_id: string
    fee: number
    order_id?: string
}

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image_url: string;
    variant: string;
    slug: string
}

interface Order {
    id: string;
    created_at: string;
    total: number;
    status:
    | "PENDING"
    | "PAYMENT"
    | "ONPROCESS"
    | "SHIPPING"
    | "CANCELLED"
    | "FINISHED";
    order_items: OrderItem[];
    unreviewed_product_counts: number
}

interface OrderDetail {
    id: string;
    created_at: string;
    total: number;
    status:
    | "PENDING"
    | "PAYMENT"
    | "ONPROCESS"
    | "SHIPPING"
    | "CANCELLED"
    | "FINISHED";
    order_items: OrderItem[];
    address: {
        name: string,
        phone_number: string,
        full_address: string,
        district: string,
        city: string,
        province: string
    }
    shipment: {
        receipt_number: string
        shipment_fee: number
        service: string
    }
    subtotal: number
}

export type { Address, CartItem, Order, OrderData, OrderDetail, OrderItem, PaymentData, Product, ProductDetail, ShipmentData }
