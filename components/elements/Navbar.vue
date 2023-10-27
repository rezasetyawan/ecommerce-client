<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ref } from "vue";
import { cn } from "../../lib/utils";
import {
  Menu,
  User2,
  ShoppingBag,
  LogOut,
  ShoppingCart,
} from "lucide-vue-next";
import { Button } from "../ui/button";

import { useUserStore } from "~/store/user";
import { useCartStore } from "~/store/cart";

const { getUser, signOut } = useUserStore();
const userStore = useUserStore();
const cartStore = useCartStore();

await getUser();

await cartStore.getCartItemCounts(userStore.user?.cart_id as string);

const sheetOpen = ref<boolean>(false);

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
  await signOut();
};
</script>
<template>
  <header
    class="flex items-center p-3 font-rubik border-b lg:px-8 w-full justify-between sticky top-0 z-[1000] bg-white"
  >
    <div class="flex gap-2 lg:gap-10">
      <Menu class="lg:hidden" @click="sheetOpen = !sheetOpen" />
      <h1 class="text-lg lg:text-2xl font-semibold">
        <NuxtLink to="/">Ini Toko</NuxtLink>
      </h1>

      <nav class="flex justify-between">
        <div class="gap-5 items-center hidden lg:flex">
          <template v-for="route in routes" :key="route.href">
            <NuxtLink
              :to="route.href"
              :class="
                cn('text-sm font-medium transition-colors hover:text-primary')
              "
              >{{ route.label }}</NuxtLink
            >
          </template>
        </div>
      </nav>
    </div>

    <div>
      <div v-if="!userStore.user" class="flex gap-2">
        <Button variant="outline"
          ><NuxtLink to="/auth/signin">Login</NuxtLink></Button
        >
        <Button variant="default"
          ><NuxtLink to="/auth/signup">Register</NuxtLink></Button
        >
      </div>
      <div v-else class="flex gap-5 items-center m-auto">
        <NuxtLink to="/cart">
          <div class="relative p-2">
            <span
              class="px-1 w-5 top-1 -right-1 text-center h-4 bg-red-500 text-[0.7rem] text-white font-medium rounded-full absolute"
              >{{ cartStore.cart ? cartStore.cart.item_counts : 0 }}</span
            ><ShoppingCart class="w-6 h-6" /></div
        ></NuxtLink>
        <DropdownMenu class="z-[1001]">
          <DropdownMenuTrigger>
            <div
              class="overflow-hidden rounded-[50%] w-6 h-6 flex justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path
                  fill="#d1d5db"
                  d="M224 256a128 128 0 1 0 0-256 128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512h388.6c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3h-91.4z"
                ></path>
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="z-[1001] mr-20">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              ><Nuxtlink :to="'/profile'" class="flex items-center gap-2"
                ><User2 class="w-5 h-5" /> Profile</Nuxtlink
              ></DropdownMenuItem
            >
            <DropdownMenuItem
              ><Nuxtlink :to="'/profile'" class="flex items-center gap-2"
                ><ShoppingBag class="w-5 h-5" /> My Orders</Nuxtlink
              ></DropdownMenuItem
            >
            <DropdownMenuItem
              ><button class="flex items-center gap-2" @click="signOutHandler">
                <LogOut class="w-5 h-5" /> Sign Out
              </button></DropdownMenuItem
            >
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
<style scoped>
/* html.dark {
  color-scheme: dark;
} */
</style>
