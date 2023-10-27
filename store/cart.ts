import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabaseClient } from "../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { SupabaseClient } from '@supabase/supabase-js';
import { useStorage } from '@vueuse/core'
import { getUserCartItemCounts } from "../utils/useCart";

const supabase = useSupabaseClient()

interface Cart {
    item_counts: number,
}

export const useCartStore = defineStore('cart', () => {
    const cart = ref<Cart | null>(null)

    const getCartItemCounts = async (cartId: string) => {
        console.log('TESSSSSTTTTTT')
        try {
            // if (!cart.value) {
            console.log(cartId)
            console.log('getting cart data....')
            const itemCounts = await getUserCartItemCounts(supabase, cartId)
            if (!itemCounts) {
                return cart.value = { item_counts: 0 }
            }
            cart.value = { item_counts: itemCounts }
            // }
        } catch (err) { 
            console.error(err)
        }
    }

    return {
        cart, getCartItemCounts
    }
})