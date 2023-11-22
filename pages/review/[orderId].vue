<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMyFetch } from "../../composables/useMyFetch";
import { useUserStore } from "../../store/user";
import AddReview from '~/components/elements/review/AddReview.vue';
import { ArrowLeft } from 'lucide-vue-next';

interface ReviewItem {
    product_name: string
    image_url: string
    id: string
    variant: string
}

interface ApiResponse {
    data: ReviewItem[]
}
const userStore = useUserStore()
const route = useRoute()
const orderId = ref(route.params.orderId as string)
const reviewItems = ref<ReviewItem[]>([])

const { data } = await useMyFetch('/api/review-items', {
    query: {
        user: userStore.user?.id,
        orderId: orderId.value
    }
})

const apiResponse = data.value as ApiResponse

if (!apiResponse.data) {
    throw createError({
        statusCode: 404,
        message: 'Order Not Found',
        statusMessage: "Sorry we couldn't find order item for your order",
        fatal: true
    })
}
reviewItems.value = apiResponse.data

useHead({
  title: `Review | Ini Toko`,
  titleTemplate: `Review | Ini Toko`,
})

definePageMeta({
    layout: "my-layout",
    middleware: 'auth'
});
</script>
<template>
    <div class="my-1 mx-1 z-10 sm:mx-0 md:mx-2 sm:absolute lg:mx-48 xl:mx-64">
        <NuxtLink :to="'/orders'" class="p-3 w-auto block">
            <ArrowLeft />
        </NuxtLink>
    </div>
    <section class="m-5 sm:mx-10 md:mx-16 lg:mx-60 xl:mx-80">
        <div v-for="item in reviewItems" :key="item.id">
            <AddReview :item="item" :orderId="orderId" />
        </div>

        <h2 v-if="!reviewItems.length" class="font-semibold p-4">Empty, you already reviewed the products</h2>
    </section>
</template>