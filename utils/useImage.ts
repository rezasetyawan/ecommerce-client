import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

const addImage = async (client: SupabaseClient, imageFile: File, supabaseUrl: string) => {
    try {
        const { data, error } = await client.storage.from('payment-strucks').upload(nanoid(16), imageFile, {
            cacheControl: '60',
            upsert: true,
        })

        if (error) {
            throw new Error (error.message)
        }

        const url = supabaseUrl + '/storage/v1/object/public/payment-strucks/' + data?.path
        return url
    } catch (error) {
        console.error(error)
    }
}

export {addImage}