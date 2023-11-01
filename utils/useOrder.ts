import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from "nanoid";
import { OrderData, PaymentData } from "~/types";

const addPayment = async (client: SupabaseClient, paymentData: PaymentData) => {

    try {
        const payment = {
            id: nanoid(16),
            ...paymentData
        }

        const { data, error } = await client.from('payments').insert(payment)

        if (error) {
            throw new Error(error.message)
        }

        return data
    } catch (err) {
        console.error(err)
    }

}

const addOrder = async (client: SupabaseClient, orderData: OrderData) => {
    try {
        const order = {
            id: nanoid(16),
            ...orderData
        }

        const { data, error } = await client.from('orders').insert(order).select('id').single()

        if (error) {
            throw new Error(error.message)
        }

        return data
    } catch (err) {
        console.error(err)
    }
}

const addOrderProduct = async (client: SupabaseClient, orderProductData: { variant_id: string, order_id: string, quantity: number }) => {
    try {
        const orderProduct = {
            id: nanoid(16),
            ...orderProductData
        }
        const { data, error } = await client.from('order_products').insert(orderProduct)

        if (error) {
            throw new Error(error.message)
        }

    } catch (error) {
        console.log(error)
    }
}

export { addOrder, addPayment, addOrderProduct }