<script setup lang="ts">
import { nanoid } from "nanoid";
import StarRating from "~/components/elements/StarRating.vue";
import { useUserStore } from "~/store/user";
import { useMyFetch } from "../composables/useMyFetch";
import { useSupabaseClient } from "../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { Product } from "../types/index";
import { getStringBeforeAtSign, toRupiah } from "../utils";

interface ApiResponse {
  data: Product[];
}

const supabase = useSupabaseClient();
const { getUser } = useUserStore()
const { data } = await useMyFetch("/api/featured-products");
const productData = data.value as ApiResponse;
const products = ref<Product[]>();
console.log(productData)
products.value = productData.data;

const billboards = ref([
  {
    image: "/images/hero-image.jpg",
    label: "Get Your Product",
  },
]);

supabase.auth.onAuthStateChange(async (event, session) => {
  try {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
      const user = session?.user;
      const userData = {
        id: user?.id,
        name:
          user?.user_metadata.full_name ||
          getStringBeforeAtSign(user?.email as string),
        email: user?.email,
      };

      await supabase.from("users").insert(userData as never);
      await supabase.from("cart").insert({ id: nanoid(16), user_id: userData.id } as never);
      await getUser(supabase)
    }
  } catch (err) {
    console.error(err);
  }
});

// TODO: UPDATE RATING CALCULATION
const getAverageRating = (rating: string[]) => {
  if (!rating.length) return 0

  return +(rating.reduce((accumulator, currentValue) => {
    return accumulator + parseInt(currentValue)
  }, 0) / rating.length).toFixed(1)
}

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <div class="mx-auto">
    <template v-for="billboard in billboards">
      <div class="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
        <div :style="{ backgroundImage: 'url(' + billboard.image + ')' }"
          class="rounded-xl relative aspect-square md:aspect-[2.8/1] overflow-hidden bg-cover">
          <div class="h-full w-full flex flex-col justify-center items-center text-center gap-y-8">
            <div class="font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-xs text-white">
              {{ billboard.label }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <div class="px-4 sm:px-6 lg:px-8 my-8" v-if="products">
    <div class="space-y-4">
      <h3 class="font-bold text-lg lg:text-2xl">Products</h3>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        <template v-for="product in products">
          <NuxtLink class="bg-white group cursor-pointer rounded-xl border p-1 space-y-2 lg:text-p-3"
            :to="'/product/' + product.slug">
            <div class="aspect-square rounded-xl bg-gray-100 relative">
              <img :src="product.image_url" alt="" fill class="aspect-square object-contain rounded-md" />
            </div>
            <div>
              <p class="font-medium truncate text-base">{{ product.name }}</p>
              <p class="text-xs text-gray-500 lg:text-sm">{{ product.category }}</p>
            </div>
            <div class="flex items-center justify-between font-medium truncate text-sm lg:text-base">
              {{ toRupiah(product.price) }}
            </div>

            <div class="flex gap-1 items-center text-slate-600 text-xs lg:text-sm">
              <div class="flex items-center">
                <StarRating :rating-value="1" :rating-count="1" class="w-[1.3rem] h-[1.3rem]" rating-size="1.3rem" />
                <p>{{ getAverageRating(product.rating) }}</p>
              </div>
              <span>|</span>
              <p>{{ product.sold }} sold</p>
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>
