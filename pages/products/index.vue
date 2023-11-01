<script setup lang="ts">
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { useMyFetch } from "../../composables/useMyFetch";
import { Product } from "../../types/index";
import { toRupiah } from "../../utils/toRupiah";
import { ref } from "vue";

interface ApiResponse {
  data: Product[];
}

const supabase = useSupabaseClient();
const route = useRoute();

const searchKey = ref(route.query.search as string);
const products = ref<Product[]>();

const getProducts = async () => {
  try {
    const { data, error } = await useMyFetch("/api/products", {
      method: "GET",
      query: {
        search: searchKey.value
      },
    });

    const productData = data.value as ApiResponse;
    products.value = productData.data;
    console.log(products.value)
  } catch (error) {
    console.error(error);
  }
};

console.log(products.value);

onMounted(async () => {
  await getProducts();
});

onBeforeRouteUpdate(async (to, from) => {
  console.log("dari on before");
  searchKey.value = to.query.search as string
  await getProducts();
});

watch(
  [route],
  async () => {
    console.log("dari watcher");
    await getProducts();
  },
  { immediate: true }
);
definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <div class="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8 my-8" v-if="products">
    <div class="space-y-4">
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
