<script setup lang="ts">
import { ref } from "vue";
import { useMyFetch } from "../../composables/useMyFetch";
import { Product } from "../../types/index";
import { toRupiah } from "../../utils";
import StarRating from "~/components/elements/StarRating.vue";
import ProductItemSkeleton from "~/components/elements/product/ProductItemSkeleton.vue"

interface ApiResponse {
  data: Product[];
}

const route = useRoute();
const searchKey = ref(route.query.search as string);
const products = ref<Product[]>();
const isLoading = ref(true)
const { $toast } = useNuxtApp()
const cacheKey = ref("/products")


const getProducts = async () => {
  try {
    isLoading.value = true
    const { data: productsCache } = useNuxtData(cacheKey.value)
    if (productsCache.value?.data) {
      products.value = productsCache.value.data
      return
    }
    const { data } = await useMyFetch("/api/products", {
      method: "GET",
      query: {
        search: searchKey.value
      },
      key: cacheKey.value
    });

    const productData = data.value as ApiResponse;
    products.value = productData.data;
    return
  } catch (error: any) {
    return $toast.error(error.message ? `${error.message}` : "Failed to fetch product")
  } finally {
    isLoading.value = false
  }
};

onMounted(async () => {
  await getProducts();
});

onBeforeRouteUpdate(async (to, from) => {
  if (to.fullPath === '/products?search=') {
    cacheKey.value = '/products'
    await getProducts();
    return
  }

  searchKey.value = to.query.search as string
  cacheKey.value = to.fullPath
  await getProducts();
});

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
  <div class="px-4 sm:px-6 lg:px-8 my-4">
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6"
        v-if="!isLoading">
        <template v-for="product in products">
          <NuxtLink class="bg-white group cursor-pointer rounded-xl border p-1 space-y-2 lg:text-p-3"
            :to="'/product/' + product.slug">
            <div class="aspect-square rounded-xl bg-gray-100 relative">
              <NuxtImg :src="product.image_url" fill class="aspect-square object-contain rounded-md" :alt="product.name"
                loading="lazy" quality="50" />
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
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6" v-else>
        <ProductItemSkeleton />
      </div>
    </div>
  </div>
</template>
