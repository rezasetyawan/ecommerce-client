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
import { useMyFetch } from "~/composables/useMyFetch";
import { useUserStore } from "~/store/user";
import { Order } from "~/types";
import { formatDate, toRupiah } from "~/utils";
import { updateOrderStatus } from "~/utils/useOrder";
import { updateProductSoldCounts } from "~/utils/useProduct";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";

interface ApiResponse {
  data: {
    orders: Order[];
  };
}

const { $toast } = useNuxtApp();
const userStore = useUserStore();
const supabase = useSupabaseClient();
const user = computed(() => userStore.user)

const orders = ref<Order[]>([]);

const getOrders = async () => {
  try {
    const { data } = await useMyFetch("/api/orders", {
      query: {
        user: user.value?.id,
      },
    }); const ordersData = data.value as ApiResponse;
    if (ordersData.data.orders) {
      orders.value = ordersData.data.orders;
    }

    return
  } catch (error) {
    console.error(error)
  }
}


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

const getOrderItemIndex = (orderId: string) => {
  const index = orders.value.findIndex((order) => order.id === orderId);
  return index;
};

const receiveProductHandler = async (orderId: string) => {
  try {
    await updateOrderStatus(supabase, orderId, "FINISHED");
    await updateProductSoldCounts(supabase, orderId);
    const index = getOrderItemIndex(orderId);
    index !== -1 ? (orders.value[index].status = "FINISHED") : null;

    return $toast.success('Order received')
  } catch (error: any) {
    return $toast.error(error.message ? error.message : 'Failed to receive order')
  }
};

const cancelOrderHandler = async (orderId: string) => {
  try {
    await updateOrderStatus(supabase, orderId, "CANCELLED")
    const index = getOrderItemIndex(orderId);

    index !== -1 ? (orders.value[index].status = "CANCELLED") : null;
    return $toast.success('Order cancelled successfully')
  } catch (error: any) {
    return $toast.error(error.message ? error.message : 'Failed to cancel order')
  }
}


onMounted(async () => {
  await getOrders()
})

watch(user, async () => {
    await getOrders()
})

useHead({
  title: 'Orders | Ini Toko',
  titleTemplate: 'Orders | Ini Toko'
})

definePageMeta({
  layout: 'my-layout',
  middleware: 'auth'
});
</script>
<template>
  <Toaster position="top-center" richColors />
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
                <NuxtImg :src="item.image_url ? item.image_url : ''" class="w-14 lg:w-20" :alt="item.name" quality="50" />
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
          <div class="w-full self-end text-xs sm:flex justify-between mt-2 lg:text-base">
            <div>
              <p>Total</p>
              <p class="font-medium text-xs lg:text-base">{{ toRupiah(order.total) }}</p>
            </div>

            <!-- actions button -->
            <div class="flex justify-end self-end items-end gap-2 max-sm:mt-3">
              <Button variant="link" class="whitespace-nowrap text-xs lg:text-sm" size="xs">
                <NuxtLink :to="'/order/' + order.id">See detail</NuxtLink>
              </Button>

              <!-- cancel button -->
              <AlertDialog v-if="order.status === 'PENDING'">
                <AlertDialogTrigger as-child>
                  <Button class="text-xs whitespace-nowrap lg:text-sm" size="xs" variant="destructive">
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will cancel the order
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction @click="cancelOrderHandler(order.id)">Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <!-- end of cancel button -->

              <!-- render cancel and pay button -->
              <div v-if="order.status === 'PAYMENT'" class="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <Button class="text-xs whitespace-nowrap lg:text-sm" size="xs" variant="destructive">
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will cancel the order
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction @click="cancelOrderHandler(order.id)">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <NuxtLink :to="'/pay/' + order.id">
                  <Button class="text-xs whitespace-nowrap lg:text-sm" size="xs">
                    Pay Now
                  </Button>
                </NuxtLink>
              </div>
              <!-- end of cancel and pay button -->

              <!-- received button -->
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
              <!-- end received button -->

              <!-- review button -->
              <div v-if="order.status === 'FINISHED' && order.unreviewed_product_counts > 0">
                <NuxtLink :to="'/review/' + order.id">
                  <Button class="text-xs lg:text-sm" size="xs">
                    Review
                  </Button>
                </NuxtLink>
              </div>
              <!-- review button -->
            </div>
            <!-- end of actions button -->
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
