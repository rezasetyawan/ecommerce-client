<script setup lang="ts">
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { useUserStore } from "~/store/user";
import { useCartStore } from "~/store/cart";
import { getUserMainAddress } from "~/utils/useAddress";
import { Address } from "~/types";
import { Button } from "../../components/ui/button";
import { toRupiah } from "~/utils/toRupiah";
import { useMyFetch } from "~/composables/useMyFetch";
import { addOrder, addPayment, addOrderProduct } from "~/utils/useOrder";
import { OrderData, PaymentData } from "~/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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

const storeAddress = ref({
  name: "Ini Toko",
  full_address: "Jl.jalan",
  district: "Semarang Utara",
  city: "Kota Semarang",
  province: "Jawa Tengah",
  phone_number: "909090808",
});

const supabase = useSupabaseClient();
const userStore = useUserStore();
const cartStore = useCartStore();

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

watch(
  selectedShipmentService,
  () => {
    console.log(selectedShipment.value);
    console.log(itemsTotalPrice.value);
  },
  { deep: true }
);

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
    return cartStore.selectedCartItems
      ? cartStore.selectedCartItems.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.price * currentValue.quantity;
        }, 0) + selectedShipment.value.price
      : 0;
  } else {
    return cartStore.selectedCartItems
      ? cartStore.selectedCartItems.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.price * currentValue.quantity;
        }, 0)
      : 0;
  }
});

const userCityCode = ref("");
const storeCityCode = ref("");

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
          weight: 800,
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
  } catch (error) {}
};

onMounted(async () => {
  const addressData = await getUserMainAddress(
    supabase,
    userStore.user?.id as string
  );

  address.value = addressData as Address;
  console.log(address.value);

  const shipmentData = await getShipmentCost();
  shipmentCost.value = shipmentData;
  console.log(shipmentCost.value);
});

watch(openShipmentItem, () => openShipmentItem.value);

const onSubmitHandler = async () => {
  try {
    const orderData: OrderData = {
      user_id: userStore.user?.id as string,
      status: "PENDING",
      created_at: Date.now().toString(),
      address_id: address.value.id,
      total: itemsTotalPrice.value,
    };

    const order = await addOrder(supabase, orderData);

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
  } catch (error) {}
};

definePageMeta({
  layout: "my-layout",
});
</script>
<template>
  <section class="mx-80 my-10">
    <div>
      <h2 class="font-semibold border-b w-full pb-2">Shipping Address</h2>
      <div class="text-sm mt-3">
        <p class="font-semibold">{{ address?.name }}</p>
        <p class="">{{ address?.phone_number }}</p>
        <p>
          {{ address?.full_address }}, {{ address?.district }},
          {{ address?.city }}, {{ address?.province }}
        </p>
      </div>
    </div>
    <div class="mt-8 flex gap-10 w-full">
      <div class="">
        <template v-for="product in cartStore.selectedCartItems">
          <div class="flex gap-3 mb-2">
            <img :src="product.image_url" class="w-40" />
            <div>
              <h2>{{ product.name }}</h2>
              <div>
                <p class="text-sm">{{ product.quantity }} products</p>
              </div>
              <p class="font-semibold">
                {{ toRupiah(product.quantity * product.price) }}
              </p>
            </div>
          </div></template
        >
      </div>
      <div class="">
        <Select
          v-if="shipmentCost"
          v-model="selectedShipmentService"
          @update:open="(isOpen:boolean) => {
            openShipmentItem = isOpen
            console.log(openShipmentItem)
          }"
        >
          <SelectTrigger class="mt-2">
            <SelectValue placeholder="Select shipment" class="w-60" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup class="max-h-60">
              <SelectLabel>Shipment</SelectLabel>
              <template v-for="data in shipmentCost" :key="data.service"
                ><SelectItem :value="data.service">
                  <p
                    class="bg-white w-full h-full"
                    v-show="
                      selectedShipmentService === data.service ||
                      !openShipmentItem
                    "
                  >
                    JNE {{ data.service }}
                  </p>

                  <div
                    class="flex gap-10"
                    v-show="!(selectedShipmentService === data.service)"
                  >
                    <div class="w-20">
                      <p class="font-semibold">
                        JNE {{ data.service }}
                      </p>
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
    <div
      class="flex justify-between items-center font-semibold mt-8 border-t p-2 w-full"
    >
      <p>Subtotal</p>
      <p>{{ toRupiah(itemsTotalPrice) }}</p>
    </div>

    <Button class="w-full mt-10" @click="onSubmitHandler">Checkout</Button>
  </section>
</template>
