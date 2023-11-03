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
    } catch (err: any) {
        throw new Error(err.message)
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
            console.log(error.message)
            throw new Error(error.message)
        }

        return data
    } catch (err: any) {
        throw new Error(err.message)
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

    } catch (err: any) {
        throw new Error(err.message)
    }
}

type OrderStatus = "PENDING" | "PAYMENT" | "ONPROCESS" | "SHIPPING" | "CANCELLED" | "FINISHED";

const updateOrderStatus = async (client: SupabaseClient, orderId: string, status: OrderStatus) => {
    try {
        const { data, error } = await client.from('orders').update({ status: status }).eq('id', orderId)

        if (error) {
            throw new Error(error.message)
        }

        return data
    } catch (err: any) {
        throw new Error(err.message)
    }
}

export { addOrder, addPayment, addOrderProduct, updateOrderStatus }