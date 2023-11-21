<script setup lang="ts">
import { Filter } from "lucide-vue-next";
import { ref } from "vue";
import StarRating from "~/components/elements/StarRating.vue";
import ProductItemSkeleton from "~/components/elements/product/ProductItemSkeleton.vue";
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
import { Category, Product } from "~/types/index";
import { toRupiah } from "~/utils";
import { useQueryStore } from "~/store/query";

interface ProductsApiResponse {
  data: Product[];
}

interface categoriesApiResponse {
  data: Category[];
}

const router = useRouter()
const route = useRoute();
const products = ref<Product[]>();
const isLoading = ref(true)
const { $toast } = useNuxtApp()
const cacheKey = ref("/products")
const categories = ref<Category[]>([])
const queryStore = useQueryStore()
queryStore.setQueryParams(route.query.search as string || "", route.query.category as string || "")

const getProducts = async () => {
  try {
    console.log(cacheKey.value)
    isLoading.value = true
    const { data: productsCache } = useNuxtData(cacheKey.value)
    if (productsCache.value?.data) {
      products.value = productsCache.value.data
      return
    }
    const { data } = await useMyFetch("/api/products", {
      method: "GET",
      query: {
        search: queryStore.queryParams.search,
        category: queryStore.queryParams.category
      },
      key: cacheKey.value
    });

    const productsApiResponse = data.value as ProductsApiResponse;
    products.value = productsApiResponse.data;
    return
  } catch (error: any) {
    return $toast.error(error.message ? `${error.message}` : "Failed to fetch product")
  } finally {
    isLoading.value = false
  }
};

const getCategories = async () => {
  try {
    const { data: categoriesCache } = useNuxtData('categories')
    if (categoriesCache.value?.data) {
      categories.value = categoriesCache.value.data
      return
    }
    const { data } = await useMyFetch("/api/categories", {
      method: "GET",
      key: 'categories'
    });

    const categoriesApiResponse = data.value as categoriesApiResponse;
    categories.value = categoriesApiResponse.data;
    return
  } catch (error: any) {
    return $toast.error(error.message ? `${error.message}` : "Failed to fetch categories")
  }
}

onMounted(async () => {
  cacheKey.value = route.fullPath

  if (route.fullPath === '/products?search=') {
    cacheKey.value = '/products'
  }
  await getProducts();
  if (!products.value) {
    await getProducts()
  }
  await getCategories()
});

onBeforeRouteUpdate(async (to, from) => {
  if (to.fullPath === '/products?search=' || to.fullPath === '/products?category=' || to.fullPath === '/products?search=&category=') {
    cacheKey.value = '/products'
    await getProducts();
    return
  }

  queryStore.setQueryParams(to.query.search as string, to.query.category as string)
  cacheKey.value = to.fullPath
  await getProducts();
});

const getAverageRating = (rating: string[]) => {
  if (!rating.length) return 0

  return +(rating.reduce((accumulator, currentValue) => {
    return accumulator + parseInt(currentValue)
  }, 0) / rating.length).toFixed(1)
}

useHead({
  title: 'Products | Ini Toko',
  titleTemplate: 'Products | Ini Toko'
})

definePageMeta({
  layout: "my-layout",
});

const onChoseCategorySubmit = () => {
  router.push({ name: "products", query: { search: queryStore.queryParams.search, category: queryStore.queryParams.category } });
};
</script>
<template>
  <HeadMetaData :title="'Products'"/>
  <div class="px-4 sm:px-6 lg:px-8 my-4">
    <div class="mb-2">
      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant="outline">
            <Filter class="stroke-slate-800 w-4 h-4 lg:w-5 lg:h-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="font-semibold">Choose Category</AlertDialogTitle>
            <AlertDialogDescription>
              <div class="flex flex-wrap max-w-[300px] gap-0.5">
                <label v-for="category in categories" :key="category.id"
                  class="border-2 border-slate-100 px-[0.8em] py-[0.4em] rounded-md hover:cursor-pointer text-sm"
                  :class="{ 'checked-label': category.id === queryStore.queryParams.category }">
                  <input type="radio" v-model="queryStore.queryParams.category" :value="category.id"
                    class="w-full h-full hidden" />
                  {{ category.name }}
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="() => {
              queryStore.queryParams.category = ''
              onChoseCategorySubmit()
            }">Reset</AlertDialogAction>
            <AlertDialogAction @click="onChoseCategorySubmit">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    <section class="space-y-4">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6"
        v-if="!isLoading">
        <template v-for="product in products">
          <NuxtLink class="bg-white group cursor-pointer rounded-xl border p-1 space-y-2 lg:text-p-3"
            :to="'/product/' + product.slug">
            <div class="aspect-square rounded-xl bg-gray-100 relative">
              <NuxtImg :src="product.image_url ? product.image_url : ''" fill
                class="aspect-square object-contain rounded-md" :alt="product.name" loading="lazy" quality="50" />
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
      <div v-if="!isLoading && products && !products.length" class="flex flex-col items-center justify-center">
        <NuxtImg :src="'/images/product-not-found.jpg'" class="block w-full md:w-1/3" />
        <p class="font-medium text-center text-base lg:text-lg">Product not found</p>
      </div>
    </section>
  </div>
</template>
<style scoped>
.checked-label {
  @apply bg-slate-100
}
</style>
