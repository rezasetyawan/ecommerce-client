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
  status: "PENDING" | "ONPROCESS" | "SHIPPING" | "CANCELEDED";
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

console.log(orders.value);

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
          <p
            v-if="order.status === 'PENDING'"
            class="font-medium bg-slate-50 p-2 text-xs rounded-md"
          >
            waiting confimation
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
          <Button class="px-10">Pay Now</Button>
        </div>
      </div>

      <!-- buat test lebih dari 1 item -->

      <div class="p-3 rounded-lg shadow-md">
        <div class="flex gap-3 items-center">
          <p class="font-medium">{{ formatDate(order.created_at) }}</p>
          <p
            v-if="order.status === 'PENDING'"
            class="font-medium bg-slate-50 p-2 text-xs rounded-md"
          >
            waiting confimation
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
          <Button class="px-10">Pay Now</Button>
        </div>
      </div>
    </template>
  </section>
</template>
