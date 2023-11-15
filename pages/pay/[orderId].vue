<script setup lang="ts">
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { toRupiah } from "~/utils";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { addImage } from "~/utils/useImage";
import { updateProductStocks } from "~/utils/useProduct";
import { ArrowLeft } from "lucide-vue-next";

const { $toast } = useNuxtApp();
const supabase = useSupabaseClient();
const config = useRuntimeConfig();
const route = useRoute();

const orderId = ref(route.params.orderId as string);
const paymentAmount = ref(0);
const showPaymentConfimation = ref(false);

const paymentConfirmationInfo = ref({
  name: "",
  bank_name: "",
  amount: 0,
});
const struck = ref<File | null>(null);

const isOrderValid = async (client: SupabaseClient, orderId: string) => {
  try {
    const { data, error } = await client.from('orders').select('id').eq('id', orderId)
    if (error) {
      throw new Error(error.message);
    }

    if (!data.length) return false

    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
};

const getPaymentAmount = async (client: SupabaseClient, orderId: string) => {
  try {
    const { data, error } = await client
      .from("orders")
      .select("total")
      .eq("id", orderId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.total;
  } catch (error: any) {
    throw new Error(error.message)
  }
};

const getOrderStatus = async (client: SupabaseClient, orderId: string) => {
  try {
    const { data, error } = await client
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.status;
  } catch (error: any) {
    throw new Error(error.message)
  }
};

const getOrderProductVariantIds = async (
  client: SupabaseClient,
  orderId: string
) => {
  try {
    const { data: variants, error } = await client
      .from("order_products")
      .select("variant_id")
      .eq("order_id", orderId);

    if (error) {
      throw new Error(error.message);
    }

    const data = variants.map((variant) => {
      return variant.variant_id as string;
    });

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

onBeforeMount(async () => {
  const isOrderExist = await isOrderValid(supabase, orderId.value)

  if (!isOrderExist) {
    useRouter().push('/404')
    return
  }

  const amount = await getPaymentAmount(supabase, orderId.value);
  paymentAmount.value = amount;

  const status = await getOrderStatus(supabase, orderId.value);
  if (status !== "PAYMENT") {
    useRouter().push("/orders");
    return
  }
});

const onFileChangeHandler = (event: Event) => {
  try {
    const target = event.target as HTMLInputElement;
    if (target.files) struck.value = target.files[0];
  } catch (error) { }
};

const getImageUrl = () => {
  if (struck.value) {
    return URL.createObjectURL(struck.value);
  }
};

const confirmPayment = async () => {
  try {
    if (paymentConfirmationInfo.value.amount !== paymentAmount.value) {
      throw new Error("Please provive correct transfer amount");
    }

    if (!struck.value) {
      throw new Error("Please add struck image");
    }

    const imageUrl = await addImage(
      supabase,
      struck.value,
      config.public.SUPABASE_URL
    );

    const { error } = await supabase
      .from("payments")
      .update({ status: "SUCCESS", struck: imageUrl } as never)
      .eq("order_id", orderId.value);

    if (error) {
      throw new Error(error.message);
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "ONPROCESS" } as never)
      .eq("id", orderId.value);

    const variantIds = await getOrderProductVariantIds(supabase, orderId.value);
    await updateProductStocks(supabase, orderId.value, variantIds);

    if (orderError) {
      throw new Error(orderError.message);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const onSubmitHandler = () => {
  return $toast.promise(confirmPayment, {
    loading: "Loading...",
    success: (data) => {
      return `Success`;
    },
    error: (data: any) => (data.message ? `${data.message}` : "Error"),
  });
};

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <Toaster position="top-center" richColors />
  <div class="my-1 mx-1 z-10 sm:mx-4 md:mx-12 sm:absolute lg:mx-48 xl:mx-64">
    <NuxtLink :to="'/orders'" class="p-3 w-auto block">
      <ArrowLeft />
    </NuxtLink>
  </div>
  <section class="m-5 sm:mx-10 md:mx-16 lg:mx-60 xl:mx-80">
    <h2 class="text-center font-semibold text-xl lg:text-2xl">Product Payment</h2>
    <p class="my-3 text-sm lg:text-base lg:my-5">
      Please make a payment of to
      <span class="font-medium">{{ toRupiah(paymentAmount) }}</span> the Account
      Number we have provided below, so that we can process your order.
    </p>

    <div class="text-sm lg:text-base">
      <p class="uppercase font-medium my-2">Ini toko</p>
      <div class="w-[50%]">
        <div class="flex gap-10">
          <p class="w-40 font-medium">Bank</p>
          <p class="text-gray-500">BCA</p>
        </div>
        <div class="flex gap-10">
          <p class="w-40 font-medium">Account Number</p>
          <p class="text-gray-500">12121212</p>
        </div>
        <div class="flex gap-10">
          <p class="w-40 font-medium">Bank Code</p>
          <p class="text-gray-500">014</p>
        </div>
      </div>
    </div>

    <form class="my-10" v-show="showPaymentConfimation" @submit.prevent="onSubmitHandler">
      <Label>Account name</Label>
      <Input type="text" class="mt-2" v-model="paymentConfirmationInfo.name" required />
      <Label class="mt-3 text-sm lg:text-base">Bank name</Label>
      <Input type="text" class="mt-2" v-model="paymentConfirmationInfo.bank_name" required />
      <Label class="mt-3 text-sm lg:text-base">Transfer amount</Label>
      <div class="relative">
        <Input type="number" class="mt-2" v-model="paymentConfirmationInfo.amount" required />
        <p class="absolute top-[25%] bg-white text-sm px-3">
          {{ toRupiah(paymentConfirmationInfo.amount) }}
        </p>
      </div>
      <Label class="mt-3 text-sm lg:text-base">Struck</Label>

      <img v-if="struck" :src="getImageUrl()" alt="Selected Image" class="max-w-[150px] mt-3" />
      <input type="file"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 mt-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        accept="image/png, image/jpeg, image/jpg" @change="(event: Event) => onFileChangeHandler(event)" required />

      <Button class="w-full my-16 py-2" type="submit">Submit</Button>
    </form>

    <Alert class="mt-10">
      <AlertDescription>
        After you make a payment, please confirm the payment.
        <button @click="showPaymentConfimation = !showPaymentConfimation" class="underline">
          Payment Confirmation
        </button>
      </AlertDescription>
    </Alert>
  </section>
</template>
<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
