<script setup lang="ts">
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { ref } from "vue";
import { CartItem } from "../../types";
import { useUserStore } from "../../store/user";
import { useCartStore } from "~/store/cart";
import {
  getCartItems,
  deleteCartItem,
  deleteMultipleCartItem,
} from "../../utils/useCart";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Trash2 } from "lucide-vue-next";

const userStore = useUserStore();
const cartStore = useCartStore();

const supabase = useSupabaseClient();

const cartItems = ref<CartItem[]>();
cartItems.value = (await getCartItems(
  supabase,
  userStore.user?.cart_id as string
)) as CartItem[];

const toRupiah = (price: number) => {
  return "Rp. " + price.toLocaleString("id-ID");
};

const deleteLocalCartItem = (id: string) => {
  const index = cartItems.value?.findIndex((item) => item.id === id);

  if (index !== -1 && index !== undefined) {
    cartItems.value?.splice(index, 1);
  }
};
const deleteCartItemHanlder = async (id: string) => {
  try {
    await deleteCartItem(supabase, id);
    deleteLocalCartItem(id);

    await cartStore.getCartItemCounts(userStore.user?.cart_id as string);
  } catch (error) {}
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

const totalPriceOfSelectedItems = computed(() => {
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

const deleteSelectedItems = async () => {
  try {
    if (selectedItemsId.value.length > 0) {
      await deleteMultipleCartItem(supabase, selectedItemsId.value);

      await cartStore.getCartItemCounts(userStore.user?.cart_id as string);

      // delete local cart items
      cartItems.value = cartItems.value?.filter(
        (item) => !selectedItemsId.value.includes(item.id)
      );
    }
  } catch (error) {
    console.error(error);
  }
};

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <section
    v-if="cartItems"
    class="sm:flex gap-8 m-5 lg:m-10 font-rubik mb-[1200px] relative"
  >
    <div class="w-[75%]">
      <div class="border-b px-2">
        <h2 class="text-2xl font-semibold w-full mb-2 pb-2">Cart</h2>
        <div class="flex justify-between items-center">
          <div class="flex gap-3 items-center mb-2">
            <Checkbox
              class="w-5 h-5"
              :checked="
                selectedItemsId.length === cartItems.length &&
                selectedItems?.length !== 0
              "
              @update:checked="(ischecked: boolean) => selectAllItemHandler(ischecked)"
            />
            <p>Select all</p>
          </div>
          <button
            v-show="selectedItemsId.length"
            @click="deleteSelectedItems()"
          >
            Delete
          </button>
        </div>
      </div>

      <template v-for="item in cartItems" :key="item.id">
        <div class="border-b p-2">
          <div class="flex gap-2 items-center">
            <Checkbox
              @update:checked="() => handleProductSelectionChange(item.id)"
              class="w-5 h-5"
              :checked="selectedItemsId.includes(item.id)"
            />
            <img class="ascpet-square w-24" :src="item.image_url" />
            <div>
              <h3 class="text-base">{{ item.name }}</h3>
              <p class="font-medium text-sm">{{ toRupiah(item.price) }}</p>
            </div>
          </div>

          <div class="flex gap-4 justify-end mt-1">
            <button @click="deleteCartItemHanlder(item.id)"><Trash2 /></button>
            <div
              class="flex gap-2 border rounded-md px-1 py-1 justify-between items-center"
            >
              <button
                @click="item.quantity--"
                class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md"
                :class="{
                  'cursor-not-allowed': item.quantity === 1,
                }"
                :disabled="item.quantity === 1"
              >
                -
              </button>
              <input
                class="w-8 focus:outline-none text-center"
                v-model="item.quantity"
              />
              <button
                @click="item.quantity++"
                class="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div
      class="border rounded-lg p-3 w-[20%] flex-col justify-between fixed bg-white right-10 hidden lg:flex"
    >
      <div>
        <h3 class="font-medium text-lg">Shopping summary</h3>
        <p class="text-base my-2"></p>
        <div
          class="flex gap-3 items-center w-full max-w-full text-slate-500 text-[14px] flex-wrap"
        >
          <p class="">Total Price ({{ selectedItems?.length }} products)</p>
          <p class="">{{ toRupiah(totalPriceOfSelectedItems) }}</p>
        </div>
        <div class="xl:flex justify-between items-center my-5">
          <p class="font-medium">Subtotal:</p>
          <p>{{ toRupiah(totalPriceOfSelectedItems) }}</p>
        </div>
      </div>

      <div class="mt-12">
        <Button class="w-full">Buy</Button>
      </div>
    </div>
  </section>
</template>
