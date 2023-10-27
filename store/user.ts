import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabaseClient } from "../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { SupabaseClient } from '@supabase/supabase-js';
import { useStorage } from '@vueuse/core'
import { getCartId } from '~/utils/useCart';
import { RefSymbol } from '@vue/reactivity';


export interface UserIdentity {
    id: string;
    user_id: string;
    identity_data?: {
        [key: string]: any;
    };
    provider: string;
    created_at?: string;
    last_sign_in_at?: string;
    updated_at?: string;
}

interface Factor {
    /** ID of the factor. */
    id: string;
    /** Friendly name of the factor, useful to disambiguate between multiple factors. */
    friendly_name?: string;
    /**
     * Type of factor. Only `totp` supported with this version but may change in
     * future versions.
     */
    factor_type: 'totp' | string;
    /** Factor's status. */
    status: 'verified' | 'unverified';
    created_at: string;
    updated_at: string;
}
interface UserAppMetadata {
    provider?: string;
    [key: string]: any;
}
interface UserMetadata {
    [key: string]: any;
}
interface User {
    id: string;
    app_metadata: UserAppMetadata;
    user_metadata: UserMetadata;
    aud: string;
    confirmation_sent_at?: string;
    recovery_sent_at?: string;
    email_change_sent_at?: string;
    new_email?: string;
    new_phone?: string;
    invited_at?: string;
    action_link?: string;
    email?: string;
    phone?: string;
    created_at: string;
    confirmed_at?: string;
    email_confirmed_at?: string;
    phone_confirmed_at?: string;
    last_sign_in_at?: string;
    role?: string;
    updated_at?: string;
    identities?: UserIdentity[];
    factors?: Factor[];
    cart_id?: string
}

const supabase = useSupabaseClient()

export const useUserStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const localUser = useStorage<User>('user', null)

    const getUser = async () => {
      if (supabase) {
        console.log('getting user data...')
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()

        console.log(supabaseUser)
        const cartId = await getCartId(supabase, supabaseUser?.id as string)

        console.log(cartId)

        const userData = supabaseUser ? { ...supabaseUser, cart_id: cartId } : null
        user.value = userData as User
        localUser.value = userData as User
      }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()

            console.log(error)

            user.value = null
            localUser.value = null
        } catch (error) {
            console.log(error)
        }
    }
    return { user, getUser, localUser, signOut }
})