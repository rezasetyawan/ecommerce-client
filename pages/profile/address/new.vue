<script setup lang="ts">
import { useSupabaseClient } from "../../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { definePageMeta } from "../../../node_modules/nuxt/dist/pages/runtime/composables";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { ref } from "vue";
import { nanoid } from "nanoid";
import { useUserStore } from "../../../store/user";
import { ArrowLeft } from "lucide-vue-next";

definePageMeta({
  layout: "my-layout",
});

const userStore = useUserStore();
const supabase = useSupabaseClient();
const router = useRouter();

const provinceChoices = ref<{ code: string; name: string }[]>([]);
const cityChoices = ref<{ code: string; name: string }[]>([]);
const districtChoices = ref<{ code: string; name: string }[]>([]);

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

const onSubmitHandler = async () => {
  try {
    const addressData = {
      id: nanoid(16),
      user_id: userStore.user?.id,
      name: address.value.name,
      full_address: address.value.full_address,
      province: address.value.province_name,
      city: address.value.city_name,
      phone_number: address.value.phone_number,
      district: address.value.ditrict,
    };
    const { data, error } = await supabase
      .from("addresses")
      .insert(addressData as never);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.log(error.message);
  }
};

onMounted(async () => {
  await getProvinceSuggestion();
});
</script>
<template>
  <section class="p-3 relative">
    <button
      class="absolute px-3 py-2 top-3 left-[20%] border rounded-lg"
      @click="router.go(-1)"
    >
      <ArrowLeft class="w-6 h-6" />
    </button>
    <form class="mx-96 mb-40" @submit.prevent="onSubmitHandler">
      <Label>Name</Label>
      <Input type="text" class="mt-2" v-model="address.name" required />

      <Label class="mt-3">Phone Number</Label>
      <Input
        type="number"
        class="mt-2"
        v-model="address.phone_number"
        required
      />

      <Label class="mt-3">Full Address</Label>
      <Textarea class="mt-2 textarea" v-model="address.full_address" required />

      <Label class="mt-3">Province</Label>
      <Select
        v-model="address.province_code"
        v-if="provinceChoices"
        @update:modelValue="() => getCities()"
        required="true"
      >
        <SelectTrigger class="mt-2">
          <SelectValue placeholder="Select province" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup class="max-h-60">
            <SelectLabel>Provinces</SelectLabel>
            <template v-for="data in provinceChoices" :key="data.code"
              ><SelectItem :value="data.code">{{
                data.name
              }}</SelectItem></template
            >
          </SelectGroup>
        </SelectContent>
      </Select>

      <Label class="mt-3">City</Label>
      <Select
        v-model="address.city_code"
        v-if="cityChoices"
        :disabled="!address.province_code"
        @update:modelValue="() => getDistricts()"
        required="true"
      >
        <SelectTrigger class="mt-2">
          <SelectValue placeholder="Select city" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup class="max-h-60">
            <SelectLabel>Cities</SelectLabel>
            <template v-for="data in cityChoices" :key="data.code"
              ><SelectItem :value="data.code">{{
                data.name
              }}</SelectItem></template
            >
          </SelectGroup>
        </SelectContent>
      </Select>

      <Label class="mt-3">District</Label>
      <Select
        v-model="address.ditrict"
        v-if="districtChoices"
        :disabled="!address.city_code"
        required="true"
      >
        <SelectTrigger class="mt-2">
          <SelectValue placeholder="Select district" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup class="max-h-60">
            <SelectLabel>District</SelectLabel>
            <template v-for="data in districtChoices" :key="data.code"
              ><SelectItem :value="data.name">{{
                data.name
              }}</SelectItem></template
            >
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button class="mt-10 w-full" type="submit">Submit</Button>
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
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
