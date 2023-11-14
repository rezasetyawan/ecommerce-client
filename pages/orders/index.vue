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
import { Order } from "~/types";
import { formatDate, toRupiah } from "~/utils";
import { updateOrderStatus } from "~/utils/useOrder";
import { updateProductSoldCounts } from "~/utils/useProduct";
import { useMyFetch } from "../../composables/useMyFetch";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";

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
  } catch (err: any) { }
};

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <section class="m-5 lg:mx-20 lg:my-10 space-y-2">
    <template v-for="order in orders" :key="order.id">
      <div class="p-3 rounded-lg shadow-md">
        <div class="flex gap-3 items-center">
          <p class="font-medium text-xs whitespace-nowrap lg:text-base">{{ formatDate(order.created_at) }}</p>
          <p class="font-medium bg-slate-50 p-2 text-xs rounded-md whitespace-nowrap">
            {{ getStatusMessage(order.status) }}
          </p>
        </div>
        <div class="gap-10 mt-4 md:flex">
          <div class="w-full space-y-2 lg:space-y-3">
            <template v-for="item in order.order_items" :key="item.id">
              <div class="flex gap-3 items-center">
                <img :src="item.image_url" class="w-14 lg:w-20" />
                <div class="w-full">
                  <h2 class="text-sm font-semibold truncate lg:text-base">
                    <NuxtLink :to="'/product/' + item.slug">{{
                      item.name
                    }}</NuxtLink>
                  </h2>
                  <p class="font-medium text-xs lg:text-sm">{{ item.variant }}</p>
                  <p class="text-black/70 font-medium text-xs lg:text-sm">
                    {{ item.quantity }} products x {{ toRupiah(item.price) }}
                  </p>
                </div>
              </div>
            </template>
          </div>
          <div class="w-full self-end text-xs flex justify-between mt-2 lg:text-base">
            <div>
              <p>Total</p>
              <p class="font-medium text-xs lg:text-base">{{ toRupiah(order.total) }}</p>
            </div>

            <!-- actions button -->
            <div class="flex justify-end self-end items-end gap-2">
              <Button variant="link" class="whitespace-nowrap text-xs lg:text-sm" size="xs">
                <NuxtLink :to="'/order/' + order.id">See detail</NuxtLink>
              </Button>
              <NuxtLink :to="'/pay/' + order.id" v-if="order.status === 'PAYMENT'">
                <Button class="text-xs whitespace-nowrap lg:text-sm" size="xs">
                  Pay Now
                </Button>
              </NuxtLink>
              <div v-if="order.status === 'SHIPPING'">
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <Button class="text-xs whitespace-nowrap lg:text-sm" size="xs" variant="outline">
                      Received
                    </Button>
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
                      <AlertDialogAction @click="receiveProductHandler(order.id)">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div v-if="order.status === 'FINISHED' && order.unreviewed_product_counts > 0">
                <NuxtLink :to="'/review/' + order.id">
                  <Button class="text-xs lg:text-sm" size="xs">
                    Review
                  </Button>
                </NuxtLink>
              </div>
            </div>
            <!-- end of actions button -->
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
