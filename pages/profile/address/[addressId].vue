<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { ref } from "vue";
import { Address } from "~/types";
import { getAddress } from "~/utils/useAddress";
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
import { useSupabaseClient } from "../../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { definePageMeta } from "../../../node_modules/nuxt/dist/pages/runtime/composables";
import { useUserStore } from "../../../store/user";
import { updateAddress } from "~/utils/useAddress"

const { $toast } = useNuxtApp();
const userStore = useUserStore();
const supabase = useSupabaseClient();
const route = useRoute()
const router = useRouter();
const addressId = ref(route.params.addressId as string)

const provinceChoices = ref<{ code: string; name: string }[]>([]);
const cityChoices = ref<{ code: string; name: string }[]>([]);
const districtChoices = ref<{ code: string; name: string }[]>([]);
const isLoading = ref(false)

const addressInitialValue = ref<Address>({
    id: '',
    name: '',
    province: '',
    city: '',
    district: '',
    phone_number: '',
    full_address: '',
    is_default: false
})

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
    async () => {
        if (address.value.province_code) {
            await getCities()
            address.value.province_name = provinceChoices.value.filter(
                (item) => item.code === address.value.province_code
            )[0].name;
        }

        if (address.value.city_code) {
            await getDistricts()
            address.value.city_name = cityChoices.value.filter(
                (item) => item.code === address.value.city_code
            )[0].name;
        }

        if (address.value.province_code && cityChoices.value.length && !address.value.city_code) {
            address.value.city_code = cityChoices.value.filter(item => {
                return item.name.toLowerCase() === addressInitialValue.value.city.toLowerCase()
            })[0].code
        }

        if (address.value.city_code && districtChoices.value.length && !address.value.ditrict) {
            address.value.ditrict = districtChoices.value.filter(item => {
                return item.name.toLowerCase() === addressInitialValue.value.district.toLowerCase()
            })[0].name
        }
    },
    { deep: true }
);

watch(addressInitialValue, () => {
    if (addressInitialValue.value.province && provinceChoices.value.length) {
        address.value.province_code = provinceChoices.value.filter(item => {
            return item.name.toLowerCase() === addressInitialValue.value.province.toLowerCase()
        })[0].code
    }
},
    { deep: true }
);


const updateAddressData = async () => {
    try {
        isLoading.value = true
        const addressData = {
            user_id: userStore.user?.id as string,
            name: address.value.name,
            full_address: address.value.full_address,
            province: address.value.province_name,
            city: address.value.city_name,
            phone_number: address.value.phone_number,
            district: address.value.ditrict,
            is_default: addressInitialValue.value.is_default
        };

        await updateAddress(supabase, addressId.value, addressData)

      
    } catch (error: any) {
        throw new Error(error.message)
    } finally {
        isLoading.value = false
    }
};

const onSubmitHandler = async () => {
    return $toast.promise(updateAddressData, {
        loading: "Loading...",
        success: (data) => {
            return `Address updated`;
        },
        error: (data: any) => (data.message ? `${data.message}` : "Failed to update address"),
    });
}

onMounted(async () => {
    await getProvinceSuggestion();
    addressInitialValue.value = await getAddress(supabase, addressId.value)
    address.value = {
        name: addressInitialValue.value.name,
        province_code: "",
        province_name: addressInitialValue.value.province,
        city_code: "",
        city_name: addressInitialValue.value.city,
        ditrict: addressInitialValue.value.district,
        phone_number: addressInitialValue.value.phone_number,
        full_address: addressInitialValue.value.full_address,
        post_code: ''
    }
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
            <h2 class="text-lg font-semibold text-center my-3 lg:text-2xl">Update Address</h2>
            <Label>Name</Label>
            <Input type="text" class="mt-2" v-model="address.name" required />

            <Label class="mt-3">Phone Number</Label>
            <Input type="number" class="mt-2" v-model="address.phone_number" required />

            <Label class="mt-3">Full Address</Label>
            <Textarea class="mt-2 textarea" v-model="address.full_address" required />

            <Label class="mt-3">Province</Label>
            <Select v-model="address.province_code" v-if="provinceChoices" required>
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
            <Select v-model="address.city_code" v-if="cityChoices" :disabled="!address.province_code" required>
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
