import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

interface AddReview {
    product_id: string
    user_id: string
    rating: string
    text: string
    created_at: string
    variant: string
    order_id: string
}

const getReviewItem = async (client: SupabaseClient, productId: string) => {
    try {
        const { data: product, error } = await client.from('products').select('name,id').eq('id', productId).single()
        const { data: image } = await client.from('product_images').select('url').eq('product_id', productId).single()

        if (error) {
            throw new Error(error.message)
        }
        return {
            id: product ? product.id as string : '',
            name: product ? product.name as string : '',
            image_url: image ? image.url as string : ''
        }
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const addReview = async (client: SupabaseClient, reviewData: AddReview) => {
    try {
        const review = {
            ...reviewData,
            id: nanoid(16)
        }

        const { data, error } = await client.from('reviews').upsert(review).select('id')

        if (error) {
            throw new Error(error.message)
        }
        return data
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export { getReviewItem, addReview }