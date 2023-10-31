import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabaseClient } from "../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { SupabaseClient } from '@supabase/supabase-js';
import { useStorage } from '@vueuse/core'
import { getUserCartItemCounts } from "../utils/useCart";
import { CartItem } from '../types';

const supabase = useSupabaseClient()

interface Cart {
    item_counts: number,
}

export const useCartStore = defineStore('cart', () => {
    const cart = ref<Cart | null>(null)
    const selectedCartItems = ref<CartItem[]>([])

    const getCartItemCounts = async (cartId: string) => {
        try {
            const itemCounts = await getUserCartItemCounts(supabase, cartId)
            if (!itemCounts) {
                return cart.value = { item_counts: 0 }
            }
            cart.value = { item_counts: itemCounts }
        } catch (err) {
            console.error(err)
        }
    }

    const setSelectedCartItems = (items: CartItem[]) => {
        selectedCartItems.value = items
    }

    return {
        cart, getCartItemCounts, selectedCartItems, setSelectedCartItems
    }
})