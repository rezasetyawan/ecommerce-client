<script setup lang="ts">
import { useElementVisibility } from "@vueuse/core";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { Carousel, Pagination, Slide } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import StartRating from "~/components/elements/StartRating.vue";
import { useCartStore } from "~/store/cart";
import { useUserStore } from "~/store/user";
import { Button } from "../../components/ui/button";
import { useMyFetch } from "../../composables/useMyFetch";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { ProductDetail } from "../../types";
import { addProductToCart, checkIsItemExist } from "../../utils/useCart";
import { formatDate, toRupiah } from "~/utils"

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

const { data: productResponse, pending } = await useMyFetch("/api/products/" + slug.value);
const productData = productResponse.value as ProductApiResponse;
const product = ref<ProductDetail>();
product.value = productData.data;

const { data: reviewsResponse } = await useMyFetch('/api/product-reviews/' + product.value?.id)
const reviews = ref<Review[]>([])
const reviewData = reviewsResponse.value as ReviewApiResponse
reviews.value = reviewData.data
reviews.value = [...reviews.value, {
  id: 'dfdfdfdf',
  text: 'gg bang',
  created_at: '1699709547403',
  variant: 'satu',
  rating: '4',
  user_name: 'asep'
},
{
  id: 'ghghghgh',
  text: 'awesome',
  created_at: '1699709557403',
  variant: 'dua',
  rating: '5',
  user_name: 'budi'
},
{
  id: 'ijklmnop',
  text: 'great job',
  created_at: '1699709567403',
  variant: 'tiga',
  rating: '3',
  user_name: 'charlie'
},
{
  id: 'qrstuvwx',
  text: 'nice work',
  created_at: '1699709577403',
  variant: 'empat',
  rating: '2',
  user_name: 'david'
},
{
  id: 'yzabcdef',
  text: 'fantastic',
  created_at: '1699709587403',
  variant: 'lima',
  rating: '1',
  user_name: 'eva'
},
{
  id: '12345678',
  text: 'gg bang',
  created_at: '1699709597403',
  variant: 'satu',
  rating: '4',
  user_name: 'asep'
},
{
  id: 'abcdefgh',
  text: 'awesome',
  created_at: '1699709607403',
  variant: 'dua',
  rating: '5',
  user_name: 'budi'
},
{
  id: 'ijklmnop',
  text: 'great job',
  created_at: '1699709617403',
  variant: 'tiga',
  rating: '3',
  user_name: 'charlie'
},
{
  id: 'qrstuvwx',
  text: 'nice work',
  created_at: '1699709627403',
  variant: 'empat',
  rating: '2',
  user_name: 'david'
},
{
  id: 'yzabcdef',
  text: 'fantastic',
  created_at: '1699709637403',
  variant: 'lima',
  rating: '1',
  user_name: 'eva'
}]
const seletedVariant = ref<string>();
seletedVariant.value = product.value.variants.find(
  (variant) => variant.is_default === true
)?.id;

const price = ref(product.value.price);
const variant = ref("");
variant.value = product.value.variants.find(
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
console.log(productInfo.value)
console.log(isProductInfoInViewport.value)

watch(isProductInfoInViewport, () => isProductInfoInViewport.value)
watch(productInfo, () => productInfo.value)

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

const totalStars = computed(() => {
  return reviews.value
    ? reviews.value.reduce((accumulator, currentValue) => {
      return accumulator + parseInt(currentValue.rating)
    }, 0)
    : 0;
})

const getRatingPercentageAndCounts = (rating: string) => {
  if (!reviews.value.length) {
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


definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <Toaster position="top-center" richColors />
  <section v-if="!pending && product" class="sm:flex gap-8 m-5 lg:m-10 lg:mx-20 font-rubik relative border-b pb-10">
    <div class="sm:w-[40%] lg:w-[25%] h-full w-full bg-white"
      :class="{ 'lg:sticky lg:top-10 lg:left-10': isProductInfoInViewport }">
      <Carousel :items-to-show="1">
        <Slide v-for="(image, key) in product?.images" :key="key" class="">
          <img :src="image.url" class="rounded-md object-cover aspect-[4/3]" />
        </Slide>
        <template #addons>
          <!-- <Navigation /> -->
          <Pagination class="rounded" />
        </template>
      </Carousel>
    </div>

    <!-- product info -->
    <div class="sm:w-[50%]" ref="productInfo">
      <h2 class="text-2xl font-semibold">{{ product?.name }}</h2>
      <div>
        <p>{{ product.sold }} <span class="font-medium">Sold</span></p>
      </div>
      <div class="my-5">
        <p class="text-2xl font-semibold">{{ toRupiah(price) }}</p>
      </div>

      <div>
        <p class="text-lg font-medium">Variants:</p>
        <div class="flex gap-2 flex-wrap my-4">
          <template v-for="variant in product.variants" :key="variant.id">
            <label
              class="font-medium px-[0.8em] py-[0.4em] min-w-[50px] text-sm text-center rounded-xl hover:cursor-pointer"
              :class="{ 'bg-slate-200': variant.id === seletedVariant }">
              <input type="radio" :value="variant.id" v-model="seletedVariant" class="hidden w-full h-full" />
              {{ variant.value }}
            </label>
          </template>
        </div>
      </div>
      <hr />
      <p class="my-3 line-clamp-6">
        {{ product.description }} Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Sed id justo a mauris aliquet hendrerit. Nullam aliquet
        ex vel aliquet fermentum. Nam commodo hendrerit sapien, et consequat
        velit efficitur non. Integer tincidunt, justo ut euismod efficitur,
        nulla augue efficitur quam, non euismod lectus ex vitae mauris.
        Vestibulum non orci non dolor congue semper. Nulla facilisi. Sed auctor
        velit vel ligula tempus, vel cursus justo feugiat. Curabitur vestibulum
        nunc vel nisi posuere, et dignissim lectus tincidunt. In hac habitasse
        platea dictumst. Sed eu libero a nisi volutpat egestas non vel ipsum.
        Pellentesque habitant morbi tristique senectus et netus et malesuada
        fames ac turpis egestas. In varius sapien eu libero venenatis, vitae
        cursus nisi venenatis. Nam vel libero a ligula fermentum consectetur.
        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
        cubilia Curae; Vivamus gravida, tortor id ultricies rhoncus, purus odio
        volutpat ipsum, nec fringilla mauris nunc eu dolor. Maecenas efficitur
        purus ut risus varius, non hendrerit libero condimentum. Sed non dolor
        non ligula iaculis ullamcorper. Phasellus vel nisl nec odio efficitur
        luctus. Morbi eu augue sed enim condimentum ultrices non a elit.
        Suspendisse nec nunc nec turpis aliquet facilisis in eget justo. Sed id
        ante non mi vulputate euismod. Etiam aliquet varius ligula, ut facilisis
        justo. Integer semper congue ligula, et finibus ante auctor nec. Integer
        volutpat, justo nec lacinia congue, lacus justo auctor quam, nec
        tincidunt velit quam vel mi. Aenean varius at dolor eu posuere. Vivamus
        ut ligula eu turpis hendrerit ultricies. Phasellus efficitur nunc vel
        metus auctor, id interdum lacus convallis. Maecenas rhoncus, quam nec
        tincidunt fermentum, urna velit semper mauris, vel egestas tellus mi
        vitae metus. Curabitur vitae condimentum metus, ut volutpat libero.
        Vivamus nec dui eu dui rhoncus hendrerit. Maecenas consectetur, metus in
        fringilla rhoncus, felis mi fermentum arcu, ut ultrices eros tortor nec
        metus. Duis id libero at velit commodo aliquam. Aenean nec turpis in
        turpis consequat interdum non et ante. Donec congue hendrerit tincidunt.
        Sed bibendum justo ut elit iaculis, eu ullamcorper libero efficitur. Sed
        non diam sit amet ipsum viverra varius eu vitae felis. Vivamus in
        hendrerit odio. Vivamus venenatis, odio in pharetra congue, sapien
        tortor luctus elit, ut imperdiet ligula mauris eu erat. Maecenas eget
        libero eu nisi cursus vehicula. Integer et metus volutpat, vehicula
        libero ac, laoreet dolor. Morbi in malesuada leo. Vestibulum in bibendum
        tortor, et viverra lorem. Nam semper, sem sit amet consequat hendrerit,
        dolor elit fermentum orci, vel imperdiet mauris sapien a massa. Sed
        fringilla nisi nec turpis sodales, vel pharetra elit condimentum.
        Integer venenatis nec massa at convallis. Curabitur tristique, turpis
        vel bibendum lacinia, urna nunc viverra mi, at fringilla orci mauris
        vitae arcu. Nam dignissim, elit at sodales laoreet, ligula sapien
        feugiat turpis, nec fermentum metus lectus nec urna. Quisque non mi eu
        tortor dictum euismod. Nulla facilisi. Sed nec nulla in elit tincidunt
        sodales. Sed consectetur eros vitae nulla bibendum, et egestas arcu
        efficitur. Sed ultrices, purus non ultrices auctor, augue metus cursus
        sapien, nec eleifend lectus purus id libero. Integer vitae massa vitae
        odio iaculis luctus non et mi. Praesent nec lacinia eros, sit amet
        tincidunt ligula. Fusce facilisis sagittis elit a vestibulum. Curabitur
        elementum, sapien vel lacinia hendrerit, odio quam dignissim massa, eu
        malesuada ex ligula et nulla. Sed nec fermentum orci. Sed dignissim
        bibendum nulla, eu aliquam justo luctus eu. Suspendisse ullamcorper
        libero non elit vehicula, ut fermentum massa consectetur. Sed facilisis
        dui at tristique pharetra. Vivamus quis sagittis tellus, in iaculis
        nulla. Donec eget lectus in velit ultrices fermentum. Vivamus at mi id
        dui imperdiet vulputate. Cras bibendum vehicula nibh, ac ultrices arcu
        fermentum sit amet. Sed eu condimentum odio. Vivamus in quam quis libero
        finibus malesuada. Nulla et ante nec odio hendrerit tristique ac non
        justo. Sed ullamcorper, felis sit amet luctus bibendum, velit nisi
        varius purus, eu sollicitudin mi sem id dui. Vivamus non lectus nec
        justo feugiat lacinia. Aenean malesuada efficitur metus, nec interdum
        turpis consectetur nec. Proin ac massa fermentum, laoreet orci vel,
        malesuada arcu. Integer feugiat nec dolor a vestibulum. Integer nec
        sagittis mi. Proin bibendum orci vel arcu elementum, a ultricies purus
        dapibus. Integer in orci ut ipsum facilisis tincidunt. Vivamus at
        convallis neque. Vestibulum varius id justo vel tincidunt. Integer
        interdum nec sem ac lacinia. Vivamus vel augue vitae elit iaculis
        tristique. Sed euismod bibendum bibendum. Ut consectetur justo in est
        hendrerit, eu vulputate nunc rhoncus. Nullam malesuada magna ut elit
        dictum, nec vehicula purus ultricies. Sed bibendum justo et libero
        tristique, vel condimentum felis tempor. In hac habitasse platea
        dictumst. Vivamus a felis non nulla pharetra dapibus et at quam.
        Phasellus eu finibus justo. Duis ut dui at nisl tincidunt viverra ut at
        lectus. Nunc ac fermentum libero. Cras pharetra purus a purus iaculis,
        vel sollicitudin dolor finibus. Vivamus gravida, ipsum ut fermentum
        cursus,
      </p>
    </div>
    <!-- end of product info -->

    <!-- product action (add to cart and select quantity) -->
    <div class="border rounded-lg p-3 w-[20%] flex-col justify-between fixed bg-white right-10 hidden lg:flex">
      <div>
        <h3 class="font-medium text-lg">Set quantity</h3>
        <p class="text-base my-2">{{ variant }}</p>
        <div class="flex gap-3 items-center justify-between">
          <div class="flex gap-2 border rounded-md px-1 py-1 justify-between items-center">
            <button @click="() => productQuantity--"
              class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md"
              :class="{ 'cursor-not-allowed': productQuantity === 1 }" :disabled="productQuantity === 1">
              -
            </button>
            <input class="w-8 focus:outline-none text-center" v-model="productQuantity" />
            <button @click="() => productQuantity++"
              class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md" :class="{
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
        <Button class="w-full" @click="renderPromiseToast">Add to cart</Button>
      </div>
    </div>
    <!-- end of product action -->
  </section>

  <!-- product reviews section -->
  <section>
    <div v-if="reviews" class="mx-20 flex gap-10">
      <!-- user rating -->
      <div class="w-min">
        <h2 class="text-xl whitespace-nowrap font-medium">Product Reviews</h2>
        <div class="flex items-center gap-5 mt-3">
          <StartRating :rating-value="1" :rating-count="1" class="mr-3" />
          <div class="flex items-end">
            <p class="text-6xl">
              {{ (totalStars / reviews.length).toFixed(1) }}
            </p>
            <p>/5</p>
          </div>
        </div>
        <div class="text-sm mt-5">
          <template v-for="(rating, index) in RATINGS.reverse()" :key="index">
            <div class="w-full flex items-center gap-2">
              <div class="flex gap-5 items-center">
                <StartRating :rating-value="1" :rating-count="1" rating-size="1.4rem" />
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
          <div class="border-b py-3">
            <div>
              <StartRating :read-only="true" :rating-value="+review.rating" rating-size="1.5rem" />
              <p>{{ formatDate(review.created_at) }}</p>
            </div>
            <div class="flex gap-3 items-center">
              <div class="w-10 h-10 overflow-hidden rounded-full">
                <img :src="'https://ui-avatars.com/api/?name=' + review.user_name.replaceAll(' ', ' + ')">
              </div>
              <p class="font-medium">
                {{ review.user_name }}
              </p>
            </div>
            <div class="mt-2">
              <p class="text-sm text-slate-500">Variant: {{ review.variant }}</p>
              <p>{{ review.text }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
  <!-- end of product reviews section -->

  <div class="fixed w-full bottom-0 bg-white lg:hidden">
    <Button class="w-full rounded-none" @click="renderPromiseToast">Add to cart</Button>
  </div>
</template>
