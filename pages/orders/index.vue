<script setup lang="ts">
import { useMyFetch } from "../../composables/useMyFetch";
import { useUserStore } from "~/store/user";
import { toRupiah } from "~/utils/toRupiah";
import { Button } from "~/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: "PENDING" | "PAYMENT" | "ONPROCESS" | "SHIPPING" | "CANCELLED";
  order_items: OrderItem[];
}

interface ApiResponse {
  data: {
    orders: Order[];
  };
}

const userStore = useUserStore();

const { data } = await useMyFetch("/api/orders", {
  query: {
    user: userStore.user?.id,
  },
});

const orders = ref<Order[]>([]);
const ordersData = data.value as ApiResponse;
orders.value = ordersData.data.orders;

const formatDate = (millisecondsTimestamp: string): string => {
  const dateObject = new Date(parseInt(millisecondsTimestamp));
  const options: object = {
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  const formattedDate = dateObject.toLocaleString(undefined, options);
  return formattedDate;
};

const getStatusMessage = (status: string) => {
  let statusMessage: string = "";

  switch (status) {
    case "PENDING":
      statusMessage = "Waiting confirmation.";
      break;
    case "PAYMENT":
      statusMessage = "Payment";
      break;
    case "ONPROCESS":
      statusMessage = "Onprocess";
      break;
    case "SHIPPING":
      statusMessage = "Shipping";
      break;
    case "CANCELLED":
      statusMessage = "Cancelled";
      break;
    case "FINISHED":
      statusMessage = "Finished";
      break;
    default:
      statusMessage = "Invalid status.";
  }

  return statusMessage;
};

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <section class="mx-20 my-10 space-y-5">
    <template v-for="order in orders" :key="order.id">
      <div class="p-3 rounded-lg shadow-md">
        <div class="flex gap-3 items-center">
          <p class="font-medium">{{ formatDate(order.created_at) }}</p>
          <p class="font-medium bg-slate-50 p-2 text-xs rounded-md">
            {{ getStatusMessage(order.status) }}
          </p>
        </div>
        <div class="flex gap-10 mt-4">
          <div class="w-full space-y-3">
            <template v-for="item in order.order_items" :key="item.id">
              <div class="flex gap-3 items-center">
                <img :src="item.image_url" class="w-20" />
                <div class="w-full">
                  <h2 class="text-lg font-semibold">{{ item.name }}</h2>
                  <p>
                    {{ item.quantity }} products x {{ toRupiah(item.price) }}
                  </p>
                </div>
              </div>
            </template>
          </div>
          <div class="w-full self-end">
            <p>Subtotal</p>
            <p class="font-medium">{{ toRupiah(order.total) }}</p>
          </div>
        </div>
        <div class="flex justify-end">
          <Button class="px-10" :disabled="order.status !== 'PAYMENT'"
            ><NuxtLink :to="'/pay/' + order.id">Pay Now</NuxtLink></Button
          >
        </div>
      </div>
    </template>
  </section>
</template>
