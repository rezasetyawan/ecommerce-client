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
const addresses = ref<Address[]>();

onMounted(async () => {
  const addressData = await getUserAddress(
    supabase,
    userStore.user?.id as string
  );
  addresses.value = addressData;
});

definePageMeta({
  layout: "my-layout",
  middleware: 'auth'
});
</script>
<template>
  <section class="p-3 md:mx-20 lg:mx-40 ">
    <div class="flex justify-end">
      <Button><NuxtLink :to="'/profile/address/new'" size="sm" class="text-sm lg:text-sm">Add address</NuxtLink></Button>
    </div>

    <div class="mt-5">
      <template v-for="data in addresses">
        <div class="border rounded-lg p-3 space-y-1.5">
          <p class="text-sm font-semibold lg:text-base">
            {{ data.name }} <Badge v-if="data.is_default" class="ml-4 text-xs">main</Badge>
          </p>
          <p class="text-sm lg:text-base">{{ data.phone_number }}</p>
          <p class="text-sm lg:text-base">
            {{ data.full_address }}, {{ data.district }}, {{ data.city }},
            {{ data?.province }}
          </p>
          <span class="font-medium">Edit</span>
        </div>
      </template>
    </div>
  </section>
</template>
