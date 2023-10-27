<script setup lang="ts">
import { useSupabaseClient } from "../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { getStringBeforeAtSign } from "../utils/stringFormat";
import { useMyFetch } from "../composables/useMyFetch";
import { Product } from "../types/index";
import { toRupiah } from "../utils/toRupiah";
import { nanoid } from "nanoid";
import { getUserCartItemCounts } from "../utils/useCart";

// import { useUserStore } from "~/store/user";

// const {user} = useUserStore()

interface ApiResponse {
  data: Product[];
}

const { data } = await useMyFetch("/api/featured-products");
const productData = data.value as ApiResponse;
const products = ref<Product[]>();
products.value = productData.data;

const billboards = ref([
  {
    image: "/images/hero-image.jpg",
    label: "Get Your Product",
  },
]);

const supabase = useSupabaseClient();
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log(event);
  try {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
      // if (session) {
      const user = session?.user;
      const userData = {
        id: user?.id,
        name:
          user?.user_metadata.full_name ||
          getStringBeforeAtSign(user?.email as string),
        email: user?.email,
      };

      // const { error: userError } = await supabase
      //   .from("users")
      //   .insert(userData as never);
      // const { error: cartError } = await supabase
      //   .from("cart")
      //   .insert({ id: nanoid(16), user_id: userData.id } as never);

      // console.log(userError);
      // console.log(cartError);
      // }
    }
  } catch (err) {
    console.error(err);
  }
});
definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <div class="mx-auto">
    <template v-for="billboard in billboards">
      <div class="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
        <div
          :style="{ backgroundImage: 'url(' + billboard.image + ')' }"
          class="rounded-xl relative aspect-square md:aspect-[2.8/1] overflow-hidden bg-cover"
        >
          <div
            class="h-full w-full flex flex-col justify-center items-center text-center gap-y-8"
          >
            <div
              class="font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-xs text-white"
            >
              {{ billboard.label }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <div class="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
    <div class="space-y-4">
      <h3 class="font-bold text-3xl">Products</h3>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <template v-for="product in products">
          <NuxtLink
            class="bg-white group cursor-pointer rounded-xl border p-3 space-y-2"
            :to="'/product/' + product.slug"
          >
            <div class="aspect-square rounded-xl bg-gray-100 relative">
              <img
                :src="product.image_url"
                alt=""
                fill
                class="aspect-square object-cover rounded-md"
              />
            </div>
            <div>
              <p class="font-semibold text-lg">{{ product.name }}</p>
              <p class="text-sm text-gray-500">{{ product.category }}</p>
            </div>
            <div class="flex items-center justify-between font-medium">
              {{ toRupiah(product.price) }}
            </div>

            <div
              class="flex items-center justify-between text-slate-600 text-sm"
            >
              {{ product.sold }} sold
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>
