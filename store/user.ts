import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SupabaseClient } from '@supabase/supabase-js';
import { useStorage } from '@vueuse/core'
import { getCartId } from '~/utils/useCart';


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

export const useUserStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    // const localUser = useStorage<User>('user', {} as User, localStorage, { mergeDefaults: true })

    // const isUserExist = computed(() => {
    //     if (user === null) {
    //         return false
    //     }

    //     const isUserEmptyObject = JSON.stringify(user.value) === JSON.stringify({})

    //     if (isUserEmptyObject) {
    //         return false
    //     }

    //     return true
    // })

    const getUser = async (supabase: SupabaseClient) => {
        try {
            // if (!isUserExist.value) {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser()
            if (!supabaseUser) return
            const cartId = await getCartId(supabase, supabaseUser?.id as string)
            const userData = supabaseUser ? { ...supabaseUser, cart_id: cartId } : null
            user.value = userData as User
            // localUser.value = userData as User
            // } else {
            //     user.value = localUser.value
            // }
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    const signOut = async (supabase: SupabaseClient) => {
        try {
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw new Error(error.message)
            }
            user.value = {} as User
            // localUser.value = {} as User
            return
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
    return { user, getUser, signOut }
})