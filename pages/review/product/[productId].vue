<script setup lang="ts">
import StartRating from '~/components/elements/StartRating.vue';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { useUserStore } from '~/store/user';
import { addReview, getReviewItem } from '~/utils/useReview';
import { useSupabaseClient } from '../../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient';

interface AddReview {
    product_id: string
    user_id: string
    rating: string
    text: string
    created_at: string
    variant: string
    order_id: string
}

const { $toast } = useNuxtApp();
const { user } = useUserStore()
const supabase = useSupabaseClient()
const route = useRoute()
const productId = ref(route.params.productId as string)

const product = ref<{ id: string, name: string, image_url: string }>()

const reviewData = ref({
    product_id: productId.value,
    user_id: user?.id as string,
    rating: 5,
    text: '',
    variant: route.query.variant as string,
    order_id: route.query.orderId as string
})

onMounted(async () => {
    product.value = await getReviewItem(supabase, productId.value)
})

const addNewReview = async () => {
    try {
        const review: AddReview = { ...reviewData.value, created_at: Date.now().toString(), rating: reviewData.value.rating.toString() }

        console.log(review)
        await addReview(supabase, review)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const onSubmitHandler = async () => {
    return $toast.promise(addNewReview, {
        loading: "Loading...",
        success: (data) => {
            return `Review Added`;
        },
        error: (data: any) => (data.message ? `${data.message}` : "Error"),
    });
}

definePageMeta({
    layout: 'my-layout'
})

</script>
<template>
    <Toaster position="top-center" richColors />
    <section class="mx-80 mt-5" v-if="product">
        <div class="flex gap-3 ">
            <img :src="product.image_url" class="w-28 h-28" :alt="product.name">
            <div class="w-full">
                <h2 class="font-medium">{{ product.name }}</h2>
                <StartRating :read-only="false" :ratingValue="reviewData.rating" @ratingSelected="(value: number) => reviewData
                    .rating = value" />

                <div class="mt-10">
                    <p class="my-3">Give a review for this product</p>
                    <Textarea :rows="5" v-model="reviewData
                        .text" />
                    <div class="flex justify-end mt-3">
                        <Button @click="onSubmitHandler">Submit</Button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>