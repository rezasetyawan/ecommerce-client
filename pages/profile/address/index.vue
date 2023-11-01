<script setup lang="ts">
import { definePageMeta } from "../../../node_modules/nuxt/dist/pages/runtime/composables";
import { useSupabaseClient } from "../../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { useUserStore } from "~/store/user";
import { useCartStore } from "~/store/cart";
import { getUserAddress } from "~/utils/useAddress";
import { Address } from "~/types";
import { ref } from "vue";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

const supabase = useSupabaseClient();
const userStore = useUserStore();
const cartStore = useCartStore();
const addresses = ref<Address[]>();

onMounted(async () => {
  const addressData = await getUserAddress(
    supabase,
    userStore.user?.id as string
  );
  addresses.value = addressData;
  console.log(addresses.value);
});

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <section class="p-3">
    <div class="flex justify-end">
      <Button><NuxtLink :to="'/profile/address/new'">Add address</NuxtLink></Button>
    </div>

    <div class="mx-40 mt-10">
      <template v-for="data in addresses">
        <div class="border rounded-lg p-3 space-y-1.5">
          <p class="text-lg font-semibold">
            {{ data.name }} <Badge v-if="data.is_default" class="">main</Badge>
          </p>
          <p>{{ data.phone_number }}</p>
          <p>
            {{ data.full_address }}, {{ data.district }}, {{ data.city }},
            {{ data?.province }}
          </p>
          <span class="font-medium">Edit</span>
        </div>
      </template>
    </div>
  </section>
</template>
