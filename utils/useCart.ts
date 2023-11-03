import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from "nanoid";
// import { useSupabaseClient } from "../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";

// const supabase = useSupabaseClient()

const getCartId = async (client: SupabaseClient, userId: string) => {
    try {
        const { data: cart, error } = await client.from('cart').select('id').eq('user_id', userId).single()

        if (error) {
            throw new Error(error.message)
        }

        if (cart) {
            return cart.id as string
        }
    } catch (err: any) {
        throw new Error(err.message)
    }
}

// using variant id because it already represent which product it is
const checkIsItemExist = async (client: SupabaseClient, cartId: string, variantId: string) => {
    try {
        const { data: cart_item, error } = await client.from('cart_items').select('id').eq('cart_id', cartId).eq('variant_id', variantId)

        if (error) {
            throw new Error(error.message)
        }

        if (cart_item) {

            if (cart_item.length) {
                return true
            }

            if (!cart_item?.length) {
                return false
            }
        }

        if (!cart_item) {
            return false
        }
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const addProductToCart = async (client: SupabaseClient, productId: string, variantId: string, quantity: number, userId: string) => {
    try {
        const data = {
            id: nanoid(16),
            product_id: productId,
            variant_id: variantId,
            quantity: quantity
        }

        const cartId = await getCartId(client, userId)
        const isItemAlreadyExist = await checkIsItemExist(client, cartId as string, variantId)

        if (!isItemAlreadyExist) {
            const { error: addItemError } = await client.from('cart_items').insert({ ...data, cart_id: cartId })
            console.log(addItemError)
        } else {
            const { data: cartItem, error: oldQuantityError } = await client.from('cart_items').select('id, quantity').eq('cart_id', cartId).eq('variant_id', variantId).single()
            console.log(oldQuantityError)
            const { error: updateItemQuantityError } = await client.from('cart_items').update({ quantity: quantity + cartItem?.quantity }).eq('id', cartItem?.id)
            console.log(updateItemQuantityError)
        }
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const getUserCartItemCounts = async (client: SupabaseClient, cartId: string) => {
    try {
        const { data, error } = await client.from('cart_items').select('id').eq('cart_id', cartId)
        console.log(data)
        console.log(error)

        if (data) {
            return data.length
        }
    } catch (err: any) {
        throw new Error(err.message)
    }
}


const getCartItems = async (client: SupabaseClient, cartId: string) => {
    try {
        const { data: cartItems, error: cartItemsError } = await client.from('cart_items').select('id, product_id, variant_id, quantity').eq('cart_id', cartId)

        if (cartItemsError) {
            return console.log(cartItemsError.message)
        }

        if (cartItems) {
            const data = await Promise.all(cartItems.map(async (item) => {
                const { data: product } = await client.from('products').select('name').eq('id', item.product_id).single()
                const { data: image } = await client.from('product_images').select('url').eq('product_id', item.product_id).single()
                const { data: variant } = await client.from('variants').select('price, value').eq('product_id', item.product_id).eq('id', item.variant_id).single()

                return {
                    ...item,
                    name: product ? product.name : '',
                    price: variant ? variant.price : NaN,
                    image_url: image ? image.url : '',
                    variant: variant ? variant.value : ''
                }
            }))
            return data
        }
    }
    catch (err: any) {
        throw new Error(err.message)

    }
}

const deleteCartItem = async (client: SupabaseClient, cartItemId: string) => {
    try {
        const { error } = await client.from('cart_items').delete().eq('id', cartItemId)

        if (error) {
            console.error(error.message)
        }
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const deleteMultipleCartItem = async (client: SupabaseClient, cartItemsId: string[]) => {
    try {
        const { error } = await client.from('cart_items').delete().in('id', cartItemsId)

        if (error) {
            console.error(error.message)
        }
    } catch (err: any) {
        throw new Error(err.message)
    }
}
export { addProductToCart, getUserCartItemCounts, getCartId, checkIsItemExist, getCartItems, deleteCartItem, deleteMultipleCartItem }