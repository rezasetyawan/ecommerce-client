<script setup lang="ts">
import {
  Home,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
} from "lucide-vue-next";
import { ref } from "vue";
import { cn } from "../../lib/utils";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import SheetMenu from './SheetMenu.vue'
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

import { useDebounceFn } from "@vueuse/core";
import { useMyFetch } from "~/composables/useMyFetch";
import { useCartStore } from "~/store/cart";
import { useUserStore } from "~/store/user";

const supabase = useSupabaseClient()
const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

await userStore.getUser(supabase);

await cartStore.getCartItemCounts(supabase, userStore.localUser.cart_id ? userStore.localUser.cart_id as string : '');

const sheetOpen = ref(false);
const routes = [
  {
    href: `/`,
    label: "Home",
    active: false,
  },
  {
    href: `/products`,
    label: "Products",
    active: false,
  },
  {
    href: `/how-to-order`,
    label: "How to order",
    active: false,
  },
  {
    href: `/about-us`,
    label: "About us",
    active: false,
  },
];

const signOutHandler = async () => {
  await userStore.signOut(supabase);
  useRouter().push('/auth/signin')
};

const searchKey = ref("");

const productSuggestions = ref<{ name: string; slug: string }[]>([]);

interface ProductSuggestionResponse {
  data: { name: string; slug: string }[];
}

const productSuggestionsLoading = ref(false);

// debouncing when using typing in search input
const getProductSuggestions = useDebounceFn(
  async () => {
    try {
      const { data } = await useMyFetch("/api/product-suggestions", {
        query: {
          search: searchKey.value,
        },
      });
      productSuggestionsLoading.value = false;
      const suggestionData = data.value as ProductSuggestionResponse;
      productSuggestions.value = suggestionData.data;
    } catch (err) { }
  },
  1000,
  {
    maxWait: 5000,
  }
);

const showProductSuggestions = ref(false);

const hideProductSuggetions = useDebounceFn(() => {
  showProductSuggestions.value = false;
}, 150);

const onSearchSubmit = () => {
  router.push({ name: "products", query: { search: searchKey.value } });
  showProductSuggestions.value = false;
};

const showMobileSearchSection = ref(false)

const isUserExist = computed(() => {
  if (userStore.user === null) {
    return false
  }

  const isUserEmptyObject = JSON.stringify(userStore.user) === JSON.stringify({})
  
  if (isUserEmptyObject) {
    return false
  }

  return true
})

</script>
<template>
  <!-- SEARCH SECTION FOR SMALL SCREEN -->
  <div
    class="fixed h-14 z-[2000] bg-white w-full top-0 flex items-center border-b shadow-sm -translate-y-full transition-transform md:hidden"
    :class="{ 'translate-y-0': showMobileSearchSection }">
    <div class="relative w-full">
      <div class="flex items-center gap-2 ml-4">
        <button @click="showMobileSearchSection = false">
          <ArrowLeft />
        </button>
        <form @submit.prevent="onSearchSubmit" class="items-center px-3 flex">
          <input
            class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search products..." v-model="searchKey" @input="() => {
              productSuggestions = [];
              productSuggestionsLoading = true;
              getProductSuggestions();
            }
              " @keyup.enter="onSearchSubmit" @focus="showProductSuggestions = true" @blur="hideProductSuggetions" />
        </form>
      </div>

      <div class="absolute bg-white w-full shadow-sm rounded-sm border top-14 p-3 z-[2000]"
        :class="{ 'hidden': !showMobileSearchSection }" v-show="showProductSuggestions">
        <template v-for="product in productSuggestions" :key="product.slug">
          <NuxtLink :to="'/product/' + product.slug" class="block mt-1 text-sm">{{ product.name }}</NuxtLink>
        </template>

        <div class="flex items-center justify-center" v-show="productSuggestionsLoading">
          <svg aria-hidden="true" class="w-6 h-6 text-primary/40 transition animate-spin duration-800 fill-primary"
            viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor" />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill" />
          </svg>
        </div>
      </div>
    </div>
  </div>
  <!-- END OF SEARCH SECTION FOR SMALL SCREEN -->

  <header
    class="flex items-center p-3 font-rubik border-b max-md:h-14 lg:px-8 w-full justify-between sticky top-0 z-[1000] bg-white">
    <div class="flex gap-2 lg:gap-10">
      <Menu class="lg:hidden" @click="sheetOpen = !sheetOpen" />
      <h1 class="text-lg lg:text-2xl font-semibold">
        <NuxtLink to="/">Ini Toko</NuxtLink>
      </h1>

      <nav class="flex justify-between">
        <div class="gap-5 items-center hidden lg:flex">
          <template v-for="route in routes" :key="route.href">
            <NuxtLink :to="route.href" :class="cn('text-sm font-medium transition-colors hover:text-primary')
              " @click="() => (searchKey = '')">{{ route.label }}</NuxtLink>
          </template>
        </div>
      </nav>
    </div>

    <div class="flex items-center gap-2">
      <div class="relative flex items-center">
        <button class="focus:outine-none md:hidden" @click="showMobileSearchSection = true" type="button">
          <Search class="w-5 h-5" />
        </button>
        <form @submit.prevent="onSearchSubmit" class="items-center px-3 hidden md:flex">
          <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search products..." v-model="searchKey" @input="() => {
              productSuggestions = [];
              productSuggestionsLoading = true;
              getProductSuggestions();
            }
              " @keyup.enter="onSearchSubmit" @focus="showProductSuggestions = true" @blur="hideProductSuggetions" />
        </form>
        <div class="absolute bg-white w-72 shadow-sm rounded-lg top-14 p-3 border z-[2000] hidden md:block"
          v-show="showProductSuggestions">
          <template v-for="product in productSuggestions" :key="product.slug">
            <NuxtLink :to="'/product/' + product.slug" class="block mt-1">{{ product.name }}</NuxtLink>
          </template>

          <div class="flex items-center justify-center" v-show="productSuggestionsLoading">
            <svg aria-hidden="true" class="w-6 h-6 text-primary/40 transition animate-spin duration-800 fill-primary"
              viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor" />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill" />
            </svg>
          </div>
        </div>
      </div>

      <!-- AUTH BUTTONS -->
      <div v-if="!isUserExist" class="flex gap-2">
        <Button variant="outline">
          <NuxtLink to="/auth/signin">Login</NuxtLink>
        </Button>
        <Button variant="default">
          <NuxtLink to="/auth/signup">Register</NuxtLink>
        </Button>
      </div>
      <!-- END OF AUTH BUTTONS -->

      <div v-else class="flex gap-2.5 items-center m-auto lg:gap-5">
        <NuxtLink to="/cart">
          <div class="relative p-2">
            <div
              class="px-[0.7em] py-[0] top-1 flex items-center justify-center -right-1 text-center bg-red-500 text-[0.6rem] text-white font-medium rounded-full absolute lg:text-[0.7rem]">
              {{
                cartStore.cart ? cartStore.cart.item_counts : 0 }}</div>
            <ShoppingCart class="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        </NuxtLink>
        <DropdownMenu class="z-[1001]">
          <DropdownMenuTrigger>
            <div class="overflow-hidden rounded-[50%] w-5 h-5 flex justify-center lg:w-6 lg:h-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="#d1d5db"
                  d="M224 256a128 128 0 1 0 0-256 128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512h388.6c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3h-91.4z">
                </path>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="z-[1001] mr-24 mt-4">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <NuxtLink :to="'/profile/address'" class="flex items-center gap-2">
                <Home class="w-5 h-5 mt-1" /> Address
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <NuxtLink :to="'/orders'" class="flex items-center gap-2">
                <ShoppingBag class="w-5 h-5 mt-1" /> My Orders
              </NuxtLink>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger class="text-sm font-medium flex items-center gap-2 my-1 mx-2">
                <LogOut class="w-5 h-5 mt-1" /> Sign out
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure want to sign out?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction @click="signOutHandler">
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
  <SheetMenu :open="sheetOpen" :routes="routes" @route-click="sheetOpen = false" />
</template>
<style scoped>
/* html.dark {
  color-scheme: dark;
} */
</style>
