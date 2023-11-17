<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { nanoid } from "nanoid";
import { ref } from "vue";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
Select,
SelectContent,
SelectGroup,
SelectItem,
SelectLabel,
SelectTrigger,
SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useUserStore } from "~/store/user";
import { isUserHaveDefaultAddress } from "~/utils/useAddress";
import { useSupabaseClient } from "../../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";

const { $toast } = useNuxtApp();
const userStore = useUserStore();
const supabase = useSupabaseClient();
const router = useRouter();

const provinceChoices = ref<{ code: string; name: string }[]>([]);
const cityChoices = ref<{ code: string; name: string }[]>([]);
const districtChoices = ref<{ code: string; name: string }[]>([]);
const isLoading = ref(false)

const address = ref({
  name: "",
  province_code: "",
  province_name: "",
  city_code: "",
  city_name: "",
  ditrict: "",
  phone_number: "",
  post_code: "",
  full_address: "",
});

// get province choices
const getProvinceSuggestion = async () => {
  interface ProvinceData {
    status: number;
    message: string;
    result: { id: string; text: string }[];
  }

  const { data, pending } = await useFetch(
    "https://alamat.thecloudalert.com/api/provinsi/get/"
  );

  const provinceData: ProvinceData = data.value as ProvinceData;

  const tranformedProvinceData = provinceData.result.map((data) => {
    return { code: data.id, name: data.text };
  });
  provinceChoices.value = tranformedProvinceData;
};

// get city choiches
const getCities = async () => {
  interface CityData {
    status: number;
    message: string;
    result: { id: string; text: string }[];
  }

  const { data, pending } = await useFetch(
    `https://alamat.thecloudalert.com/api/kabkota/get/?d_provinsi_id=${address.value.province_code}`
  );

  const cityData: CityData = data.value as CityData;

  const tranformedCityData = cityData.result.map((data) => {
    return { code: data.id, name: data.text };
  });
  cityChoices.value = tranformedCityData;
};

// get district choices
const getDistricts = async () => {
  interface DistrictData {
    status: number;
    message: string;
    result: { id: string; text: string }[];
  }

  const { data, pending } = await useFetch(
    `https://alamat.thecloudalert.com/api/kecamatan/get/?d_kabkota_id=${address.value.city_code}`
  );

  const districtData: DistrictData = data.value as DistrictData;

  const tranformedDistrictData = districtData.result.map((data) => {
    return { code: data.id, name: data.text };
  });
  districtChoices.value = tranformedDistrictData;
};

watch(
  address,
  () => {
    if (address.value.province_code) {
      address.value.province_name = provinceChoices.value.filter(
        (item) => item.code === address.value.province_code
      )[0].name;
    }

    if (address.value.city_code) {
      address.value.city_name = cityChoices.value.filter(
        (item) => item.code === address.value.city_code
      )[0].name;
    }
  },
  { deep: true }
);

const addNewAddress = async () => {
  try {
    isLoading.value = true

    const isSetAsDefaultAddress = await isUserHaveDefaultAddress(supabase, userStore.user?.id as string)
    const addressData = {
      id: nanoid(16),
      user_id: userStore.user?.id,
      name: address.value.name,
      full_address: address.value.full_address,
      province: address.value.province_name,
      city: address.value.city_name,
      phone_number: address.value.phone_number,
      district: address.value.ditrict,
      is_default: !isSetAsDefaultAddress
    };

    const { error } = await supabase
      .from("addresses")
      .insert(addressData as never);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    throw new Error(error.message)
  } finally {
    isLoading.value = false
  }
};

const onSubmitHandler = async () => {
  return $toast.promise(addNewAddress, {
    loading: "Loading...",
    success: (data) => {
      return `Address added`;
    },
    error: (data: any) => (data.message ? `${data.message}` : "Error"),
  });
}

onMounted(async () => {
  await getProvinceSuggestion();
});

definePageMeta({
  layout: "my-layout",
  middleware: 'auth'
});

</script>
<template>
  <Toaster position="top-center" richColors />
  <section class="p-3 relative">
    <button class="absolute px-3 py-2 top-3 left-0 md:left-10 lg:left-80" @click="router.go(-1)">
      <ArrowLeft class="w-6 h-6" />
    </button>
    <form class="mx-2 mb-40 md:mx-10 lg:mx-80" @submit.prevent="onSubmitHandler">
      <h2 class="text-lg font-semibold text-center my-3 lg:text-2xl">Add Address</h2>
      <Label>Name</Label>
      <Input type="text" class="mt-2" v-model="address.name" required />

      <Label class="mt-3">Phone Number</Label>
      <Input type="number" class="mt-2" v-model="address.phone_number" required />

      <Label class="mt-3">Full Address</Label>
      <Textarea class="mt-2 textarea" v-model="address.full_address" required />

      <Label class="mt-3">Province</Label>
      <Select v-model="address.province_code" v-if="provinceChoices" @update:modelValue="() => getCities()" required>
        <SelectTrigger class="mt-2">
          <SelectValue placeholder="Select province" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup class="max-h-60">
            <SelectLabel>Provinces</SelectLabel>
            <template v-for="data in provinceChoices" :key="data.code">
              <SelectItem :value="data.code">{{
                data.name
              }}</SelectItem>
            </template>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Label class="mt-3">City</Label>
      <Select v-model="address.city_code" v-if="cityChoices" :disabled="!address.province_code"
        @update:modelValue="() => getDistricts()" required>
        <SelectTrigger class="mt-2">
          <SelectValue placeholder="Select city" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup class="max-h-60">
            <SelectLabel>Cities</SelectLabel>
            <template v-for="data in cityChoices" :key="data.code">
              <SelectItem :value="data.code">{{
                data.name
              }}</SelectItem>
            </template>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Label class="mt-3">District</Label>
      <Select v-model="address.ditrict" v-if="districtChoices" :disabled="!address.city_code" required>
        <SelectTrigger class="mt-2">
          <SelectValue placeholder="Select district" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup class="max-h-60">
            <SelectLabel>District</SelectLabel>
            <template v-for="data in districtChoices" :key="data.code">
              <SelectItem :value="data.name">{{
                data.name
              }}</SelectItem>
            </template>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button class="mt-10 w-full" type="submit" :disabled="isLoading">Submit</Button>
    </form>
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

/* Hide scrollbar for Chrome, Safari and Opera */
.textarea::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.textarea {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
