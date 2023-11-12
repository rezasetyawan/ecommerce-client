<script setup lang="ts">
import { useSupabaseClient } from '../../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient';
import { useUserStore } from '../../../store/user';
import { addReview } from '../../../utils/useReview';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import StarRating from '../StarRating.vue';

interface ReviewItem {
    product_name: string
    image_url: string
    id: string
    variant: string
}
interface Props {
    item: ReviewItem
}
const props = defineProps<Props>()

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
const showComponent = ref(true)

const reviewData = ref({
    product_id: props.item.id,
    user_id: user?.id as string,
    rating: 5,
    text: '',
    variant: props.item.variant,
    order_id: route.params.orderId as string
})

const addNewReview = async () => {
    try {
        const review: AddReview = { ...reviewData.value, created_at: Date.now().toString(), rating: reviewData.value.rating.toString() }
        await addReview(supabase, review)

        showComponent.value = false
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const onSubmitHandler = async () => {
    return $toast.promise(addNewReview, {
        loading: "Loading...",
        success: (data) => {
            return `Review added, thank you :D ${props.item.product_name}`;
        },
        error: (data: any) => (data.message ? `${data.message}` : "Error"),
    });
}

console.log(props.item)
</script>
<template>
    <Toaster position="top-center" richColors />
    <div class="sm:flex gap-3 transition-all duration-300 rounded-lg" :class="{ 'h-0 hidden': !showComponent }">
        <img :src="props.item.image_url" class="w-full h-full sm:w-28 sm:h-28" :alt="props.item.product_name">
        <div class="w-full">
            <h2 class="font-medium text-sm lg:text-base">{{ props.item.product_name }}</h2>
            <StarRating :read-only="false" :ratingValue="reviewData.rating" @ratingSelected="(value: number) => reviewData
                .rating = value" />

            <div class="mt-5">
                <p class="my-3 text-sm">Give a review for this product</p>
                <Textarea :rows="5" v-model="reviewData
                    .text" />
                <div class="flex justify-end mt-3">
                    <Button @click="onSubmitHandler" class="px-5 text-xs lg:text-sm lg:px-10">Submit</Button>
                </div>
            </div>
        </div>
    </div>
</template>