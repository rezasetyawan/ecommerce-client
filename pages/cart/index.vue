<script setup lang="ts">
import { Trash2 } from "lucide-vue-next";
import { ref } from "vue";
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
import { Checkbox } from "~/components/ui/checkbox";
import { useCartStore } from "~/store/cart";
import { useUserStore } from "~/store/user";
import { CartItem } from "~/types";
import { toRupiah } from "~/utils";
import {
deleteCartItem,
deleteCartItems,
getCartItems,
} from "~/utils/useCart";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";

const { $toast } = useNuxtApp();
const userStore = useUserStore();
const cartStore = useCartStore();

const supabase = useSupabaseClient();
const router = useRouter();

const cartItems = ref<CartItem[]>();
cartItems.value = (await getCartItems(
  supabase,
  userStore.user?.cart_id as string
)) as CartItem[];


const deleteLocalCartItem = (id: string) => {
  const index = cartItems.value?.findIndex((item) => item.id === id);

  if (index !== -1 && index !== undefined) {
    cartItems.value?.splice(index, 1);
  }
};

const selectedItemsId = ref<string[]>([]);

const handleProductSelectionChange = (item: string) => {
  const index = selectedItemsId.value.findIndex(
    (selectedItem) => selectedItem === item
  );

  if (index !== -1) {
    selectedItemsId.value.splice(index, 1);
  } else {
    selectedItemsId.value.push(item);
  }
};

const selectedItems = computed(() => {
  return cartItems.value?.filter((item) => {
    return selectedItemsId.value.includes(item.id);
  });
});

const selectedItemsTotalPrice = computed(() => {
  return selectedItems.value
    ? selectedItems.value.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.price * currentValue.quantity;
    }, 0)
    : 0;
});

const selectAllItemHandler = async (isChecked: boolean) => {
  if (cartItems.value && isChecked === true) {
    selectedItemsId.value = cartItems.value.map((item) => item.id);
  }

  if (
    selectedItemsId.value.length > 0 &&
    selectedItems.value?.length === cartItems.value?.length &&
    isChecked === false
  ) {
    selectedItemsId.value = [];
  }
};

const deleteCartItemHanlder = async (id: string) => {
  try {
    await deleteCartItem(supabase, id);
    deleteLocalCartItem(id);

    await cartStore.getCartItemCounts(supabase, userStore.user?.cart_id as string);
    return $toast.success('Items deleted')
  } catch (error: any) {
    return $toast.error(error.message ? error.message : 'Failed to delete product')
  }
};

const deleteSelectedCartItems = async () => {
  try {
    if (selectedItemsId.value.length > 0) {
      await deleteCartItems(supabase, selectedItemsId.value);

      await cartStore.getCartItemCounts(supabase, userStore.user?.cart_id as string);

      // delete local (memory) cart items
      cartItems.value = cartItems.value?.filter(
        (item) => !selectedItemsId.value.includes(item.id)
      );
    }
    return $toast.success('Items deleted')
  } catch (error: any) {
    return $toast.error(error.message ? error.message : 'Failed to delete order')
  }
};

const checkoutHandler = () => {
  if (!selectedItems.value?.length) {
    return $toast.error("Please select at least one product", {
      duration: 3000,
      dismissible: true,
    });
  }
  cartStore.setSelectedCartItems(selectedItems.value);
  router.push("/cart/shipment");
};

definePageMeta({
  layout: 'my-layout',
  middleware: 'auth'
});
</script>
<template>
  <Toaster position="top-center" richColors />
  <section v-if="cartItems" class="sm:flex gap-8 m-2 lg:m-10 font-rubik mb-[1200px] relative">
    <div class="md:w-[60%] lg:w-[75%]">
      <div class="border-b p-2">
        <h2 class="text-lg font-semibold w-full mb-2 pb-2 lg:text-2xl">Cart</h2>
        <div class="flex justify-between items-center">
          <div class="flex gap-3 items-center mb-2">
            <Checkbox class="w-5 h-5" :checked="selectedItemsId.length === cartItems.length &&
              selectedItems?.length !== 0
              " @update:checked="(ischecked: boolean) => selectAllItemHandler(ischecked)" />
            <p>Select all</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button v-show="selectedItemsId.length" class="px-10" size="sm">Delete </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will delete selected product
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="deleteSelectedCartItems()">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <template v-for="item in cartItems" :key="item.id">
        <div class="border-b p-2">
          <div class="flex gap-2 items-center">
            <Checkbox @update:checked="() => handleProductSelectionChange(item.id)" class="w-5 h-5"
              :checked="selectedItemsId.includes(item.id)" />
            <img class="ascpet-square w-16 lg:w-24" :src="item.image_url" />
            <div>
              <h3 class="text-base font-medium line-clamp-1">
                <NuxtLink :to="'/product/' + item.slug">{{
                  item.name
                }}</NuxtLink>
              </h3>
              <p class="font-medium text-sm text-black/70 my-1">
                {{ item.variant }}
              </p>
              <p class="font-medium text-sm">{{ toRupiah(item.price) }}</p>
            </div>
          </div>

          <div class="flex gap-4 justify-end mt-1">
            <button @click="deleteCartItemHanlder(item.id)">
              <Trash2 class="w-5" />
            </button>
            <div class="flex gap-2 border rounded-md px-1 py-1 justify-between items-center mt-1 text-sm lg:text-base">
              <button @click="item.quantity--"
                class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md" :class="{
                  'cursor-not-allowed': item.quantity === 1,
                }" :disabled="item.quantity === 1">
                -
              </button>
              <input class="w-8 focus:outline-none text-center" v-model="item.quantity" />
              <button @click="item.quantity++"
                class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md">
                +
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="border rounded-lg p-3 flex-col justify-between fixed bg-white right-10 hidden md:flex">
      <div>
        <h3 class="font-medium text-lg">Shopping summary</h3>
        <p class="text-base my-2"></p>
        <div class="flex gap-3 items-center w-full max-w-full text-slate-500 text-[14px] flex-wrap">
          <p class="">Total Price ({{ selectedItems?.length }} products)</p>
          <p class="">{{ toRupiah(selectedItemsTotalPrice) }}</p>
        </div>
        <div class="xl:flex justify-between items-center my-5">
          <p class="font-medium">Subtotal:</p>
          <p>{{ toRupiah(selectedItemsTotalPrice) }}</p>
        </div>
      </div>

      <div class="mt-12">
        <Button class="w-full" @click="checkoutHandler">Checkout</Button>
      </div>
    </div>
  </section>
  <div class="fixed bottom-0 left-0 w-full flex justify-end items-center bg-white p-3 gap-3 md:hidden">
    <div class="text-xs">
      <p>Subtotal</p>
      <p>{{ toRupiah(selectedItemsTotalPrice) }}</p>
    </div>
    <Button size="sm" class="text-sm">Checkout ({{ selectedItems?.length }})</Button>
  </div>
</template>
