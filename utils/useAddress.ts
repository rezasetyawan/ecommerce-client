import { SupabaseClient } from '@supabase/supabase-js';
import { Address, UpdateAddress } from '~/types';

const getUserAddresses = async (client: SupabaseClient, userId: string) => {
    try {
        const { data, error } = await client.from('addresses').select('id, name, full_address, phone_number, district, city, province, is_default').eq('user_id', userId)

        if (error) {
            throw new Error(error.message)
        }

        return data as Address[]
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const getUserMainAddress = async (client: SupabaseClient, userId: string) => {
    try {
        const { data, error } = await client.from('addresses').select('id, name, full_address, phone_number, district, city, province').eq('is_default', true).eq('user_id', userId)

        if (error) {
            throw new Error(error.message)
        }

        return data[0] as Address
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const getAddress = async (client: SupabaseClient, addressId: string) => {
    try {
        const { data, error } = await client.from('addresses').select('id, name, full_address, phone_number, district, city, province').eq('id', addressId)

        if (error) {
            throw new Error(error.message)
        }

        return data[0] as Address
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const updateAddress = async (client: SupabaseClient, addressId: string, updateData: UpdateAddress) => {
    try {
        const { data, error } = await client.from('addresses').update(updateData).eq('id', addressId)
        if (error) {
            throw new Error(error.message)
        }

        return data
    } catch (err: any) {
        throw new Error(err.message)
    }
}

const deleteAddress = async (client: SupabaseClient, addressId: string) => {
    try {
        const { data, error } = await client.from('addresses').delete().eq('id', addressId)

        if (error) {
            throw new Error(error.message)
        }

        return
    } catch (err: any) {
        throw new Error(err.message)
    }
}


export { getUserMainAddress, getUserAddresses, getAddress, updateAddress, deleteAddress }