<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
definePageMeta({
    layout: 'my-layout'
})

const steps = [
    {
        name: '1. Register or login an account',
        image_url: '/images/how-to-order/step-1.png',
        description: "If you don't have an account register first, and if you have login with your account."
    },
    {
        name: '2. Choose a product',
        image_url: '/images/how-to-order/step-2.png',
        description: "Go to products page and choose a product you want to buy."
    },
    {
        name: '3. Add product to cart',
        image_url: '/images/how-to-order/step-3.png',
        description: "Once you choose a product, pick desired variant and set the quantity, and then add the product to cart."
    },
    {
        name: '4. Select product in cart',
        image_url: '/images/how-to-order/step-4.png',
        description: "Go to cart pages, and you can see products you've added to cart. You can select the products you want to checkout. Once you already select products you want to checkout, click the checkout button."
    },
    {
        name: '5. Checkout a product',
        image_url: '/images/how-to-order/step-5.png',
        description: "After you click the checkout button, you will directed to shipment page. In here you can choose shipment address and duration."
    },
    {
        name: '6. Pay you order',
        image_url: '/images/how-to-order/step-6b.png',
        description: "Go to orders page, and you can see your order there. Wait until the our confirm you order. Once the order confirmed you can see 'Pay now' button. Click that button, and you will directed to payment page, fill the required form and submit it."
    },
    {
        name: '7. Track you order',
        image_url: '/images/how-to-order/step-7b.png',
        description: "Go back to orders page, and the order status will be changed after you pay the order. Track you order here, there's a received button that you can click to confirm if you already received the order. Once you received your order, you can click review button for review our product."
    },
]

useHead({
  title: 'How to order | Ini Toko',
  titleTemplate: 'How to order | Ini Toko'
})
</script>
<template>
    <HeadMetaData :title="'Products'"/>
    <section class="mx-3 relative border border-transparent lg:mx-20 xl:mx-40">
        <NuxtLink class="absolute p-3 top-0" :to="'/'">
            <ArrowLeft />
        </NuxtLink>

        <h2 class="mt-5 text-center font-semibold text-lg lg:text-2xl lg:mb-10">How to order</h2>

        <template v-for="(step, index) in steps" :key="index">
            <div class="mb-5 p-3 border-b lg:mb-10">
                <h3 class="font-medium text-base my-3 lg:text-lg">{{ step.name }}</h3>
                <NuxtImg :src="step.image_url" class="border rounded-sm shadow-sm w-full" :alt="step.name" loading="lazy" />
                <p class="mt-3 text-sm lg:text-base">{{ step.description }}</p>
            </div>
        </template>
    </section>
</template>