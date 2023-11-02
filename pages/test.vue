<script setup lang="ts">
import { useSupabaseClient } from "../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
const { $toast } = useNuxtApp();

const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

const supabase = useSupabaseClient();

const onSubmitHandler = async () => {
  try {
    const { error: orderError } = await supabase
      .from("ord")
      .update({ status: "ONPROCESS" } as never)
      .eq("id", "njBUC1BJNfirDIQ5");

    throw new Error("order error");
    if (orderError) {
      throw new Error(orderError.message);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const renderPromiseToast = () => {
  return $toast.promise(onSubmitHandler, {
    loading: "Loading...",
    success: (data) => {
      return `toast has been added`;
    },
    error: (data: any) => `${data.message}`,
  });
};
</script>
<template>
  <Toaster position="top-center" />
  <button @click="renderPromiseToast">Render a toast</button>
</template>
