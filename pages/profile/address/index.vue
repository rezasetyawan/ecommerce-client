<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "~/store/user";
import { Address } from "~/types";
import { getUserAddresses, deleteAddress } from "~/utils/useAddress";
import { useSupabaseClient } from "../../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { definePageMeta } from "../../../node_modules/nuxt/dist/pages/runtime/composables";
import { Trash2 } from "lucide-vue-next";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
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

const { $toast } = useNuxtApp();
const supabase = useSupabaseClient();
const userStore = useUserStore();
const addresses = ref<Address[]>();

onMounted(async () => {
  const addressData = await getUserAddresses(
    supabase,
    userStore.user?.id as string
  );
  addresses.value = addressData;
});

const deleteAddressHandler = async (addressId: string) => {
  try {
    await deleteAddress(supabase, addressId)
    const index = addresses.value?.findIndex((item) => item.id === addressId);

    if (index !== -1 && index !== undefined) {
      addresses.value?.splice(index, 1);
    }
    return $toast.success('Address deleted')
  } catch (error: any) {
    return $toast.error(error.message ? `${error.message}` : "Failed to delete address")
  }
}

const setAddressAsDefault = async (addressId: string) => {
  try {
    if (!addresses.value) return
    const defaultAddressIndex = addresses.value.findIndex((item) => item.is_default);
    if (defaultAddressIndex === undefined || defaultAddressIndex === -1) return

    await supabase.from('addresses').update({ is_default: false } as never).eq('id', addresses.value[defaultAddressIndex].id)
    addresses.value[defaultAddressIndex].is_default = false

    await supabase.from('addresses').update({ is_default: true } as never).eq('id', addressId)

    const newDefautlAddressIndex = addresses.value?.findIndex((item) => item.id === addressId);
    if (newDefautlAddressIndex !== -1 && newDefautlAddressIndex !== undefined) {
      addresses.value[newDefautlAddressIndex].is_default = true
    }
    return $toast.success('Default Address updated')
  } catch (error: any) {
    return $toast.error(error.message ? `${error.message}` : "Failed to update default address")
  }
}

const compareByDefault = (a: Address, b: Address) => {
      if (a.is_default && !b.is_default) {
        return -1;
      } else if (!a.is_default && b.is_default) {
        return 1;
      } else {
        return 0;
      }
    };

    // Computed property
    const sortedArray = computed(() => {
      return addresses.value?.slice().sort(compareByDefault);
    });

definePageMeta({
  layout: "my-layout",
  middleware: 'auth'
});
</script>
<template>
  <Toaster position="top-center" richColors />
  <section class="p-3 md:mx-20 lg:mx-40 ">
    <div class="flex justify-end">
      <Button>
        <NuxtLink :to="'/profile/address/new'" size="sm" class="text-sm lg:text-sm">Add address</NuxtLink>
      </Button>
    </div>

    <div class="mt-5 space-y-2 transition-all duration-700">
      <template v-for="data in sortedArray">
        <div class="border rounded-lg p-3 space-y-1.5 relative">
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <button class="p-2 absolute top-2 right-2">
                <Trash2 />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will finished the order
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="deleteAddressHandler(data.id)">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <NuxtLink :to="'/profile/address/' + data.id">
            <div>
              <p class="text-sm font-semibold lg:text-base">
                {{ data.name }} <Badge v-if="data.is_default" class="ml-4 text-xs">main</Badge>
              </p>
              <p class="text-sm lg:text-base">{{ data.phone_number }}</p>
              <p class="text-sm lg:text-base">
                {{ data.full_address }}, {{ data.district }}, {{ data.city }},
                {{ data?.province }}
              </p>
            </div>
          </NuxtLink>
          <Button v-if="!data.is_default" size="sm" @click="setAddressAsDefault(data.id)">Set as default</Button>
        </div>
      </template>
    </div>
  </section>
</template>
