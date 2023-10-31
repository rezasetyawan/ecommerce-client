<script setup lang="ts">
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { useUserStore } from "~/store/user";
import { useCartStore } from "~/store/cart";
import { getUserMainAddress } from "~/utils/useAddress";
import { Address } from "~/types";
import { Button } from "../../components/ui/button";
import { toRupiah } from "~/utils/toRupiah";

const supabase = useSupabaseClient();
const userStore = useUserStore();
const cartStore = useCartStore();

const address = ref<Address>({
  id: "",
  name: "",
  full_address: "",
  district: "",
  city: "",
  province: "",
  phone_number: "",
  is_default: false
});

console.log(cartStore.selectedCartItems);

onMounted(async () => {
  const addressData = await getUserMainAddress(
    supabase,
    userStore.user?.id as string
  );

  address.value = addressData as Address
  console.log(address.value);
});

const itemsTotalPrice = computed(() => {
  return cartStore.selectedCartItems
    ? cartStore.selectedCartItems.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.price * currentValue.quantity;
      }, 0)
    : 0;
});

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <section class="mx-80 my-10">
    <div>
      <h2 class="font-semibold border-b w-full pb-2">Shipping Address</h2>
      <div class="text-sm mt-3">
        <p class="font-semibold">{{ address?.name }}</p>
        <p class="">{{ address?.phone_number }}</p>
        <p>
          {{ address?.full_address }}, {{ address?.district }},
          {{ address?.city }}, {{ address?.province }}
        </p>
      </div>
    </div>
    <div class="mt-8">
      <template v-for="product in cartStore.selectedCartItems">
        <div class="flex gap-3 mb-2">
          <img :src="product.image_url" class="w-40" />
          <div>
            <h2>{{ product.name }}</h2>
            <div>
              <p class="text-sm">{{ product.quantity }} products</p>
            </div>
            <p class="font-semibold">
              {{ toRupiah(product.quantity * product.price) }}
            </p>
          </div>
        </div></template
      >
    </div>
    <div class="flex justify-between items-center font-semibold mt-8 border-t p-2 w-full">
      <p>Subtotal</p>
      <p>{{ toRupiah(itemsTotalPrice) }}</p>
    </div>

    <Button class="w-full mt-10">Checkout</Button>
  </section>
</template>
