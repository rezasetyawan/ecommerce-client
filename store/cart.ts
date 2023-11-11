import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SupabaseClient } from '@supabase/supabase-js';
import { getUserCartItemCounts } from "../utils/useCart";
import { CartItem } from '../types';

interface Cart {
    item_counts: number,
}

export const useCartStore = defineStore('cart', () => {
    const cart = ref<Cart | null>(null)
    const selectedCartItems = ref<CartItem[]>([])

    const getCartItemCounts = async (client: SupabaseClient, cartId: string) => {
        try {
            const itemCounts = await getUserCartItemCounts(client, cartId)
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