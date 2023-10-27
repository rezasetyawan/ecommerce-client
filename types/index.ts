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
export type { Product, ProductDetail, CartItem }