<script setup lang="ts">
// TODO: REFACTOR THIS
import { useElementVisibility } from "@vueuse/core";
import { ArrowLeft } from "lucide-vue-next";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { Carousel, Pagination, Slide } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import StarRating from "~/components/elements/StarRating.vue";
import ProductDetailSkeleton from '~/components/elements/product/ProductDetailSkeleton.vue';
import ReviewItem from "~/components/elements/review/ReviewItem.vue";
import { useCartStore } from "~/store/cart";
import { useUserStore } from "~/store/user";
import { toRupiah } from "~/utils";
import { Button } from "../../components/ui/button";
import { useMyFetch } from "../../composables/useMyFetch";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { ProductDetail } from "../../types";
import { addProductToCart, checkIsItemExist } from "../../utils/useCart";


const { $toast } = useNuxtApp();
const userStore = useUserStore();
const cartStore = useCartStore();

const supabase = useSupabaseClient();
const route = useRoute();
const slug = ref(route.params.slug as string);

interface ProductApiResponse {
  data: ProductDetail;
}

interface Review {
  id: string
  text: string
  created_at: string
  variant: string
  rating: string
  user_name: string
}

interface ReviewApiResponse {
  data: Review[]
}

const product = ref<ProductDetail>();

// const getProductInfo = async () => {
//   try {
// const { data: productCache } = useNuxtData(slug.value)

// // TODO: FIX ERROR DATA IS UNDEFINED WHEN REFRESH PAGE
// if (productCache.value?.data) {
//   product.value = productCache.value.data
//   return
// }

const { data: productResponse, pending } = await useMyFetch("/api/products/" + slug.value, {
  key: slug.value
});
const productData = productResponse.value as ProductApiResponse;
product.value = productData.data;
console.log(productData)

if (!productData.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product Not Found',
    data: "Sorry, we couldn't find your desired product",
    fatal: true
  })
}

//     if (!product.value) await getProductInfo()
//     return

//   } catch (error: any) {
//     return $toast.error(error.message ? error.message : 'Failed to fetch product')
//   }
// }

const reviews = ref<Review[]>()
const { data: reviewsCache } = useNuxtData(`${slug.value}-reviews`)
reviews.value = reviewsCache.value?.data

// const getReviews = async () => {
//   try {
//     if (!reviews.value) {
const { data: reviewsResponse } = await useMyFetch('/api/product-reviews/' + product.value?.id, {
  key: `${slug.value}-reviews`
})
const reviewData = reviewsResponse.value as ReviewApiResponse
reviews.value = reviewData.data
// return reviews.value
//     }
//   } catch (error: any) {
//     return $toast.error(error.message ? error.message : 'Failed to fetch product reviews')
//   }
// }

const seletedVariant = ref("");
// seletedVariant.value = product.value?.variants.find(
//   (variant) => variant.is_default === true
// )?.id;

watch(product, () => {
  seletedVariant.value = product.value?.variants.find(
    (variant) => variant.is_default === true
  )?.id as string
}, { immediate: true })

const price = ref(0);
if (product.value) {
  price.value = product.value.price
}

const variant = ref("");
variant.value = product.value?.variants.find(
  (variant) => variant.is_default === true
)?.value as string;

watch(seletedVariant, () => {
  price.value = product.value?.variants.find(
    (s) => s.id === seletedVariant.value
  )?.price as number;

  variant.value = product.value?.variants.find(
    (s) => s.id === seletedVariant.value
  )?.value as string;
});

const productQuantity = ref(1);

const subtotal = computed(() => {
  return productQuantity.value * price.value;
});

const productInfo = ref<HTMLElement | null>(null);
const isProductInfoInViewport = useElementVisibility(productInfo);

watch(isProductInfoInViewport, () => console.log(isProductInfoInViewport.value))

const addItemToCart = async () => {
  try {
    if (
      !!userStore.user &&
      product.value &&
      seletedVariant.value &&
      productQuantity.value
    ) {
      const isProductAlreadyInCart = await checkIsItemExist(
        supabase,
        userStore.user?.cart_id as string,
        seletedVariant.value as string
      );

      await addProductToCart(
        supabase,
        product.value?.id as string,
        seletedVariant.value as string,
        productQuantity.value,
        userStore.user?.id as string
      );

      if (!isProductAlreadyInCart) {
        await cartStore.getCartItemCounts(supabase, userStore.user?.cart_id as string);
      }
    }
  } catch (err: any) {
    throw new Error(err.message);
  }
};

const renderPromiseToast = () => {
  if (!userStore.user) {
    return useRouter().push("/auth/signin");
  }

  return $toast.promise(addItemToCart, {
    loading: "Loading...",
    success: (data) => {
      return `Product added to cart`;
    },
    error: (data: any) => (data.message ? `${data.message}` : "Error"),
  });
};

const totalRating = computed(() => {
  return reviews.value
    ? reviews.value.reduce((accumulator, currentValue) => {
      return accumulator + parseInt(currentValue.rating)
    }, 0)
    : 0;
})

const getRatingPercentageAndCounts = (rating: string) => {
  if (!reviews.value || !reviews.value.length) {
    return {
      percentage: 0,
      counts: 0
    };
  }

  const ratingCounts = reviews.value.filter(review => {
    return review.rating === rating;
  }).length

  const ratingPercentage = (ratingCounts / reviews.value.length) * 100;
  return {
    counts: ratingCounts.toFixed(0),
    percentage: ratingPercentage.toFixed(0),
  };
};


const RATINGS = ['1', '2', '3', '4', '5']

const showFullDesc = ref(false)

onMounted(async () => {
  // await getProductInfo()
  // const reviews = await getReviews()

  // if (!product) {
  //   await getProductInfo()
  // }

  // if (!reviews) {
  //   await getReviews()
  // }
})

definePageMeta({
  layout: "my-layout",
});

useHead({
  title: slug.value.replaceAll('-', ' ') + '|' + 'Ini Toko',
  titleTemplate: slug.value.replaceAll('-', ' ') + ' | ' + 'Ini Toko',
})
</script>
<template>
  <HeadMetaData :og-image-url="product?.images[0].url" :title="slug.replaceAll('-', ' ')" />
  <Toaster position="top-center" richColors />
  <div class="my-1 mx-1 z-10 sm:mx-2 sm:absolute lg:mx-8">
    <button @click="() => useRouter().go(-1)">
      <ArrowLeft />
    </button>
  </div>
  <section v-if="product"
    class="sm:flex gap-8 m-2 mt-4 lg:w-[65%] xl:w-[70%] sm:mx-10 lg:m-10 lg:mx-20 font-rubik relative border-b lg:pb-10">
    <div class="sm:w-[40%] lg:w-[25%] h-full w-full bg-white">
      <Carousel :items-to-show="1">
        <Slide v-for="(image, key) in product?.images" :key="key" class="">
          <NuxtImg :src="image.url ? image.url : ''" class="rounded-md object-contain aspect-[4/3]" :alt="product.name"
            quality="80" />
        </Slide>
        <template #addons>
          <Navigation />
          <Pagination class="rounded" />
        </template>
      </Carousel>
    </div>

    <!-- product info -->
    <div class="sm:w-[70%]" ref="productInfo" v-if="reviews && product">
      <h2 class="text-lg font-semibold lg:text-2xl">{{ product?.name }}</h2>
      <div class="flex items-center gap-2 text-sm lg:text-base">
        <p>{{ product.sold }} <span class="font-medium">Sold</span></p>
        <span>•</span>
        <div class="flex gap-3 items-center">
          <StarRating :rating-value="1" :rating-count="1" class="mr-3" rating-size="1.6rem" />
          <p>{{ totalRating ? (totalRating / reviews.length).toFixed(1) : 0 }} ({{ reviews.length }} rating)</p>
        </div>
      </div>
      <div class="my-5">
        <p class="text-lg font-semibold lg:text-2xl">{{ toRupiah(price) }}</p>
      </div>

      <div>
        <p class="text-base font-medium lg:text-lg">Variants:</p>
        <div class="flex gap-2 flex-wrap my-2">
          <template v-for="variant in product.variants" :key="variant.id">
            <label
              class="font-medium px-[0.8em] py-[0.4em] min-w-[50px] text-xs text-center rounded-xl hover:cursor-pointer md:text-sm"
              :class="{ 'bg-slate-200': variant.id === seletedVariant }">
              <input type="radio" :value="variant.id" v-model="seletedVariant" class="hidden w-full h-full" />
              {{ variant.value }}
            </label>
          </template>
        </div>
      </div>
      <hr />
      <p class="mt-3 text-sm" :class="{ 'line-clamp-6': !showFullDesc }">
        {{ product.description }}
      </p>
      <button type="button" class="text-sm mb-5" @click="showFullDesc = !showFullDesc">{{ showFullDesc ? 'See less' :
        'Seemore'
      }}</button>
    </div>
    <!-- end of product info -->

    <!-- product action (add to cart and select quantity) -->
    <div class="border rounded-lg p-3 w-[20%] flex-col justify-between fixed bg-white right-10 hidden lg:flex">
      <div>
        <h3 class="font-medium">Set quantity</h3>
        <p class="text-sm my-2">{{ variant }}</p>
        <div class="flex gap-3 items-center justify-between">
          <!-- TODO: LIMIT QUANTITY BASE ON EACH VARIANT STOCKS -->
          <div class="flex gap-2 border rounded-md px-1 py-1 justify-between items-center text-sm">
            <button @click="() => productQuantity--"
              class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md font-semibold"
              :class="{ 'cursor-not-allowed': productQuantity === 1 }" :disabled="productQuantity === 1">
              -
            </button>
            <input class="w-8 focus:outline-none text-center" :min="1" :max="product.stocks" v-model="productQuantity" />
            <button @click="() => productQuantity++"
              class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md font-semibold" :class="{
                'cursor-not-allowed': productQuantity === product.stocks,
              }" :disabled="productQuantity === product.stocks">
              +
            </button>
          </div>
          <div>Stocks: {{ product.stocks }}</div>
        </div>
        <div class="xl:flex justify-between items-center my-5">
          <p class="font-medium">Subtotal:</p>
          <p>{{ toRupiah(subtotal) }}</p>
        </div>
      </div>

      <div class="mt-12">
        <Button class="w-full" @click="renderPromiseToast" :disabled="productQuantity < 1">Add to cart</Button>
      </div>
    </div>
    <!-- end of product action -->
  </section>

  <!-- product reviews section -->
  <section>
    <div v-if="reviews && product" class="mx-2 lg:w-[65%] lg:mx-20 xl:w-[70%] sm:flex sm:mx-10 gap-10">
      <!-- user rating stat -->
      <div class="w-full max-md:border-b max-md:pb-4 sm:w-[40%] md:w-min">
        <h2 class="text-lg whitespace-nowrap font-medium lg:text-xl">Product Reviews</h2>
        <div class="flex items-center gap-5 mt-3">
          <StarRating :rating-value="1" :rating-count="1" class="mr-3" />
          <div class="flex items-end">
            <p class="text-2xl lg:text-6xl">
              {{ totalRating ? (totalRating / reviews.length).toFixed(1) : 0 }}
            </p>
            <p class="text-slate-500 text-sm lg:text-base">/5</p>
          </div>
        </div>
        <div class="text-sm mt-5">
          <template v-for="(rating, index) in RATINGS.reverse()" :key="index">
            <div class="w-full flex items-center gap-2">
              <div class="flex gap-5 items-center">
                <StarRating :rating-value="1" :rating-count="1" rating-size="1.4rem" />
                <p>{{ rating }}</p>
              </div>

              <div class="w-full bg-black/20 rounded-lg h-1.5">
                <div class="bg-black rounded-lg h-1.5"
                  :style="{ width: `${getRatingPercentageAndCounts(rating).percentage}%` }">
                </div>
              </div>
              <p>{{ getRatingPercentageAndCounts(rating).counts }}</p>
            </div>
          </template>
        </div>
      </div>

      <!-- user reviews -->
      <div class="w-full">
        <template v-for="review in  reviews" :key="review.id">
          <ReviewItem :review="review" />
        </template>
      </div>
    </div>
  </section>
  <!-- end of product reviews section -->

  <div class="fixed w-full bottom-0 z-20 bg-white lg:hidden">
    <Button class="w-full rounded-none" @click="renderPromiseToast">Add to cart</Button>
  </div>
  <ProductDetailSkeleton v-if="!product" />
</template>

