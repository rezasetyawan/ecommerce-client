import { SupabaseClient } from '@supabase/supabase-js';

const updateProductStocks = async (client: SupabaseClient, orderId: string, variantIds: string[]) => {
    try {
        const variants = await Promise.all(variantIds.map(async (id) => {
            const { data, error } = await client.from('variants').select('id, product_id, stocks').eq('id', id).single()
            return data as {
                id: string,
                product_id: string,
                stocks: number,
            }
        }))

        if (!variants || !variants.length) {
            throw new Error("Sorry, there's a error")
        }

        await Promise.all(variants.map(async (variant) => {
            const { data: order_product } = await client.from('order_products').select('quantity').eq('order_id', orderId).eq('variant_id', variant?.id).single()

            await client.from('variants').update({ stocks: variant?.stocks - order_product?.quantity }).eq('id', variant.id)
        }))
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const updateProductSoldCounts = async (client: SupabaseClient, orderId: string) => {
    try {
        const { data: order_products, error: orderProductError } = await client.from('order_products').select('variant_id, quantity').eq('order_id', orderId)

        if (orderProductError) {
            throw new Error(orderProductError.message)
        }

        const productIds = await Promise.all(order_products.map(async (item) => {
            const { data } = await client.from('variants').select('product_id').eq('id', item.variant_id).single()
            return data?.product_id as string
        }))

        await Promise.all(productIds.map(async (id, index) => {
            const { data } = await client.from('products').select('sold').eq('id', id).single()

            await client.from('products').update({ sold: data?.sold + order_products[index].quantity }).eq('id', id)
        }))

    } catch (err: any) {
        throw new Error(err.message)
    }
}

export { updateProductStocks, updateProductSoldCounts }