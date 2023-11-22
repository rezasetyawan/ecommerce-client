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
            throw new Error(error.message)
        }

        if (shipmentError) {
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

const getOrderStatus = async (client: SupabaseClient, orderId: string) => {
    try {
        const { data, error } = await client
            .from("orders")
            .select("status")
            .eq("id", orderId)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data.status;
    } catch (error: any) {
        throw new Error(error.message)
    }
};

const getOrderProductVariantIds = async (client: SupabaseClient, orderId: string) => {
    try {
        const { data: variants, error } = await client
            .from("order_products")
            .select("variant_id")
            .eq("order_id", orderId);

        if (error) {
            throw new Error(error.message);
        }

        const data = variants.map((variant) => {
            return variant.variant_id as string;
        });

        return data;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export { addOrder, addPayment, addOrderProduct, updateOrderStatus, getOrderStatus, getOrderProductVariantIds }