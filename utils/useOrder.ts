import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from "nanoid";
import { OrderData, PaymentData, ShipmentData } from "~/types";

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

const addOrder = async (client: SupabaseClient, orderData: OrderData, shipmentData: ShipmentData) => {
    try {
        const order = {
            id: nanoid(16),
            ...orderData
        }

        const shipment = {
            id: nanoid(16),
            ...shipmentData,
            order_id: order.id
        }

        const { data, error } = await client.from('orders').insert(order).select('id').single()
        const { error: shipmentError } = await client.from('order_shipment').insert(shipment)

        if (error) {
            console.log(error.message)
            throw new Error(error.message)
        }

        if (shipmentError) {
            console.log(shipmentError.message)
            throw new Error(shipmentError.message)
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