<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '~/components/ui/button';
import { useMyFetch } from "../../composables/useMyFetch";
import { useUserStore } from "../../store/user";

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

const router = useRouter()
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
reviewItems.value = apiResponse.data

const onReview = (id: string, variant: string) => {
    router.push({
        path: '/review/product/' + id, query: {
            orderId: orderId.value,
            variant: variant
        }
    })
}

definePageMeta({
    layout: 'my-layout'
})
</script>
<template>
    <section class="mx-80 pt-5">
        <template v-for="(item, index) in reviewItems" :key="index">
            <div class="flex gap-3 justify-between shadow-md rounded-lg p-2 mb-4">
                <div class="flex gap-3">
                    <img :src="item.image_url" class="w-28" :alt="item.product_name">
                    <h2 class="font-medium">{{ item.product_name }}</h2>
                </div>
                <Button class="self-end" @click="onReview(item.id, item.variant)">
                    Write a review
                </Button>
            </div>
        </template>
    </section>
</template>