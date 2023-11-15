import { useSupabaseUser } from '../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseUser'

export default defineNuxtRouteMiddleware(async (to, from) => {
    try {
        const user = useSupabaseUser()
        if (!user.value) {
            return navigateTo('/auth/signin')
        }


        if (to.path === '/auth/signin' || to.path === '/auth/signup') {
            return
        }

    } catch (error) {
        throw new Error(error as any);
    }
});