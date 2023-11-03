<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useUserStore } from "~/store/user";
import { toRupiah } from "~/utils/toRupiah";
import { updateOrderStatus } from "~/utils/useOrder";
import { updateProductSoldCounts } from "~/utils/useProduct";
import { useMyFetch } from "../../composables/useMyFetch";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { Order } from "~/types";

interface ApiResponse {
  data: {
    orders: Order[];
  };
}

const userStore = useUserStore();
const supabase = useSupabaseClient();

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
      statusMessage = "Waiting confirmation";
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

const receiveProductHandler = async (orderId: string) => {
  try {
    await updateOrderStatus(supabase, orderId, "FINISHED");
    await updateProductSoldCounts(supabase, orderId);
  } catch (err: any) {}
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
                  <h2 class="text-lg font-semibold">
                    <NuxtLink :to="'/product/' + item.slug">{{
                      item.name
                    }}</NuxtLink>
                  </h2>
                  <p class="font-medium text-sm">{{ item.variant }}</p>
                  <p class="text-black/70 font-medium text-sm">
                    {{ item.quantity }} products x {{ toRupiah(item.price) }}
                  </p>
                </div>
              </div>
            </template>
          </div>
          <div class="w-full self-end">
            <p>Total</p>
            <p class="font-medium">{{ toRupiah(order.total) }}</p>
          </div>
        </div>
        <div class="flex justify-end">
          <Button variant="link"
            ><NuxtLink :to="'/order/' + order.id">See detail</NuxtLink></Button
          >
          <Button class="px-10" v-if="order.status === 'PAYMENT'"
            ><NuxtLink :to="'/pay/' + order.id">Pay Now</NuxtLink></Button
          >
          <div v-if="order.status === 'SHIPPING'">
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="outline" class="px-10">RECEIVED </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will finished the order
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction @click="receiveProductHandler(order.id)"
                    >Continue</AlertDialogAction
                  >
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div v-if="order.status === 'FINISHED'">
            <Button class="px-10">Review</Button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
