<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import {
Select,
SelectContent,
SelectGroup,
SelectItem,
SelectLabel,
SelectTrigger,
SelectValue,
} from "~/components/ui/select";
import { useMyFetch } from "~/composables/useMyFetch";
import { useCartStore } from "~/store/cart";
import { useUserStore } from "~/store/user";
import { Address, OrderData, PaymentData } from "~/types";
import { toRupiah } from "~/utils";
import { getUserMainAddress } from "~/utils/useAddress";
import { addOrder, addOrderProduct, addPayment } from "~/utils/useOrder";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";

interface Shipment {
  service: string;
  description: string;
  price: number;
  etd: string;
}

interface CityResponse {
  data: {
    city_id: string;
    province_id: string;
    province: string;
    type: string;
    city_name: string;
    postal_code: string;
  }[];
}

interface ShipmentCostResponse {
  rajaongkir: {
    status: {
      code: number;
      description: string;
    };
    results: {
      code: string;
      name: string;
      costs: {
        service: string;
        description: string;
        cost: { value: number; etd: string; note: string }[];
      }[];
    }[];
  };
}

const { $toast } = useNuxtApp();

// TODO: ADD INFO TABLE
const storeAddress = ref({
  name: "Ini Toko",
  full_address: "Jl.jalan",
  district: "Semarang Utara",
  city: "Kota Semarang",
  province: "Jawa Tengah",
  phone_number: "909090808",
});

interface CheckoutItem {
  id: string;
  product_id: string;
  name: string;
  variant_id: string;
  quantity: number;
  price: number;
  image_url: string;
  variant: string;
  weight: number;
}
const supabase = useSupabaseClient();
const userStore = useUserStore();
const cartStore = useCartStore();
const checkoutItems = ref<CheckoutItem[]>([]);

const shipmentCost = ref<Shipment[] | undefined>([]);
const selectedShipmentService = ref("");
const selectedShipment = computed(() => {
  if (selectedShipmentService.value) {
    return shipmentCost.value?.filter(
      (item) => item.service === selectedShipmentService.value
    )[0];
  }
});
const openShipmentItem = ref(false);

const address = ref<Address>({
  id: "",
  name: "",
  full_address: "",
  district: "",
  city: "",
  province: "",
  phone_number: "",
  is_default: false,
});

const itemsTotalPrice = computed(() => {
  if (selectedShipment.value) {
    return checkoutItems.value
      ? checkoutItems.value.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.price * currentValue.quantity;
      }, 0) + selectedShipment.value.price
      : 0;
  } else {
    return checkoutItems.value
      ? checkoutItems.value.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.price * currentValue.quantity;
      }, 0)
      : 0;
  }
});

const itemsTotalWeight = computed(() => {
  return checkoutItems.value
    ? checkoutItems.value.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.weight * currentValue.quantity;
    }, 0)
    : 0;
});

const userCityCode = ref("");
const storeCityCode = ref("");

// TODO: FIX ERROR GETTING SHIPMENT COST

// getting city code for calculate shipping cost
const getShipmentCost = async () => {
  try {
    // getting user city code
    const { data: userCity } = await useMyFetch("/api/city", {
      query: {
        search: address.value.city,
      },
    });

    const userCityData = userCity.value as CityResponse;
    userCityCode.value = userCityData.data[0].city_id;

    // getting store city code

    const { data: storeCity } = await useMyFetch("/api/city", {
      query: {
        search: storeAddress.value.city,
      },
    });

    const storeCityData = storeCity.value as CityResponse;
    storeCityCode.value = storeCityData.data[0].city_id;

    // getting shipment costs
    const { data: shipmentCost, error } = await useMyFetch(
      "/api/shipment/cost",
      {
        method: "POST",
        body: {
          origin: storeCityCode.value,
          destination: userCityCode.value,
          weight: itemsTotalWeight.value,
          courier: "jne",
        },
      }
    );

    const shipmentCostData = shipmentCost.value as ShipmentCostResponse;
    const data = shipmentCostData.rajaongkir.results[0].costs;

    return data.map((item) => {
      return {
        service: item.service,
        description: item.description,
        price: item.cost[0].value,
        etd: item.cost[0].etd,
      };
    });
  } catch (error) { }
};

onMounted(async () => {
  const addressData = await getUserMainAddress(
    supabase,
    userStore.user?.id as string
  );
  address.value = addressData as Address;

  // get items weight
  const checkoutItemsData = await Promise.all(
    cartStore.selectedCartItems.map(async (item) => {
      const { data, error } = await supabase
        .from("variants")
        .select("weight")
        .eq("id", item.variant_id)
        .single();

      if (!data) return;

      return {
        ...item,
        weight: parseInt(data.weight),
      };
    })
  );

  checkoutItems.value = checkoutItemsData as CheckoutItem[];

  const shipmentData = await getShipmentCost();
  shipmentCost.value = shipmentData;
});

const onSubmitHandler = async () => {
  try {
    if (itemsTotalWeight.value > 20000) {
      throw new Error("Sorry our maximum capacity is 20KG");
    }

    if (!selectedShipmentService.value || !selectedShipment.value) {
      throw new Error("Please chose shipment service");
    }

    const orderData: OrderData = {
      user_id: userStore.user?.id as string,
      status: "PENDING",
      created_at: Date.now().toString(),
      total: itemsTotalPrice.value,
    };

    const shipmentData = {
      service: "JNE " + selectedShipment.value.service,
      address_id: address.value.id,
      fee: selectedShipment.value.price,
    };

    const order = await addOrder(supabase, orderData, shipmentData);

    const payment: PaymentData = {
      order_id: order?.id,
      status: "PENDING",
      amount: itemsTotalPrice.value,
      struck: "",
    };

    await addPayment(supabase, payment);

    await Promise.all(
      cartStore.selectedCartItems.map(async (item) => {
        const data = {
          variant_id: item.variant_id,
          order_id: order?.id,
          quantity: item.quantity,
        };

        await addOrderProduct(supabase, data);
      })
    );

    // useRouter().push('/orders')
  } catch (err: any) {
    throw new Error(err.message);
  }
};

const renderPromiseToast = () => {
  return $toast.promise(onSubmitHandler, {
    loading: "Loading...",
    success: (data) => {
      return `Checkout success`;
    },
    error: (data: any) => (data.message ? `${data.message}` : "Error"),
  });
};

definePageMeta({
    layout: 'my-layout',
    middleware: 'auth'
});
</script>
<template>
   <div class="my-1 mx-1 z-10 sm:mx-20 md:mx-28 sm:absolute lg:mx-64">
    <NuxtLink :to="'/cart'" class="p-3 w-auto block"><ArrowLeft /></NuxtLink>
  </div>
  <section class="mx-5 my-3 sm:mx-28 md:mx-40 lg:my-10 lg:mx-80">
    <Toaster position="top-center" richColors />
    <div>
      <h2 class="font-semibold border-b w-full pb-1 text-sm lg:pb-2 lg:text-base">Shipping Address</h2>
      <div class="text-xs mt-3 lg:text-sm">
        <p class="font-semibold">{{ address?.name }}</p>
        <p class="">{{ address?.phone_number }}</p>
        <p>
          {{ address?.full_address }}, {{ address?.district }},
          {{ address?.city }}, {{ address?.province }}
        </p>
      </div>
    </div>
    <div class="mt-8 gap-10 w-full justify-between sm:flex">
      <div>
        <template v-for="product in cartStore.selectedCartItems">
          <div class="flex gap-3 mb-2">
            <img :src="product.image_url" class="w-14 lg:w-20" />
            <div>
              <h2 class="text-sm font-medium lg:text-base">{{ product.name }}</h2>
              <div>
                <p class="text-sm">{{ product.quantity }} products</p>
              </div>
              <p class="font-semibold text-xs">
                {{ toRupiah(product.quantity * product.price) }}
              </p>
            </div>
          </div>
        </template>
      </div>
      <div class="text-xs mt-10 sm:mt-0">
        <Select v-if="shipmentCost" v-model="selectedShipmentService" @update:open="(isOpen: boolean) => {
          openShipmentItem = isOpen
        }">
          <SelectTrigger class="mt-2">
            <SelectValue placeholder="Select shipment" class="w-full sm:w-60" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup class="max-h-60">
              <SelectLabel class="w-full">Shipment</SelectLabel>
              <template v-for="data in shipmentCost" :key="data.service">
                <SelectItem :value="data.service">
                  <p class="w-full h-full text-sm" v-show="selectedShipmentService === data.service ||
                    !openShipmentItem
                    ">
                    JNE {{ data.service }}
                  </p>

                  <div class="flex gap-10 text-sm justify-between w-full" v-show="!(selectedShipmentService === data.service)">
                    <div class="w-20">
                      <p class="font-semibold">JNE {{ data.service }}</p>
                      <p>{{ data.etd }} days</p>
                    </div>
                    <p class="font-medium">{{ toRupiah(data.price) }}</p>
                  </div>
                </SelectItem>
              </template>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div class="flex justify-between items-center font-semibold mt-8 border-t p-2 w-full text-sm lg:text-base">
      <p>Subtotal</p>
      <p>{{ toRupiah(itemsTotalPrice) }}</p>
    </div>

    <Button class="w-full mt-10 text-xs lg:text-sm" @click="renderPromiseToast">Checkout</Button>
  </section>
</template>
