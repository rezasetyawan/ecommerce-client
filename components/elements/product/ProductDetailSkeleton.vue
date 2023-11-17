<script setup lang="ts">
</script>
<template>
    <section class="sm:flex gap-8 m-2 mt-4 lg:w-[65%] xl:w-[70%] sm:mx-10 lg:m-10 lg:mx-20 font-rubik relative
        lg:pb-10 animate-pulse">
        <div class="sm:w-[40%] lg:w-[25%] h-full w-full bg-white">
            <div class="rounded-md object-cover aspect-[4/3] bg-secondary" fill />
        </div>

        <!-- product info -->
        <div class="sm:w-[70%]">
            <div class="w-3/5 h-4 bg-sk mt-2"></div>
            <div class="flex items-center gap-2 mt-1">
                <div class="w-8 h-4 bg-sk"></div>
                <div class="flex gap-3 items-center">
                    <div class="w-12 h-4 bg-sk"></div>
                </div>
            </div>
            <div class="my-5">
                <div class="w-8 h-4 bg-sk"></div>
            </div>

            <div>
                <div class="w-16 h-4 bg-sk"></div>
                <div class="flex gap-2 flex-wrap my-2">
                    <template v-for="variant in 3" :key="variant">
                        <div class="w-8 h-3 bg-sk"></div>

                    </template>
                </div>
            </div>
            <hr class="my-3">
            <div class="space-y-1.5 mt-2">
                <template v-for="variant in 6" :key="variant">
                    <div class="h-3 w-11/12 bg-sk"></div>
                </template>
            </div>

        </div>
        <!-- end of product info -->

        <!-- product action (add to cart and select quantity) -->
        <div class="border rounded-lg p-3 w-[20%] flex-col justify-between fixed bg-white right-10 hidden lg:flex">
            <div>
                <div class="w-24 h-6 bg-sk"></div>
                <div class="w-16 h-3 mt-1 bg-sk"></div>
                <div class="flex gap-3 items-center justify-between mt-2">
                    <!-- TODO: LIMIT QUANTITY BASE ON EACH VARIANT STOCKS -->
                    <div class="flex gap-2 border rounded-md px-1 py-1 justify-between items-center text-sm">
                        <div class="w-6 h-5 bg-sk"></div>

                        <div class="w-12 h-5 bg-sk"></div>
                        <div class="w-6 h-5 bg-sk"></div>
                    </div>
                    <div class="w-16 h-4 bg-sk"></div>
                </div>
                <div class="xl:flex justify-between items-center my-5">
                    <div class="w-10 h-4 bg-sk"></div>
                    <div class="w-24 h-4 bg-sk"></div>
                </div>
            </div>

            <div class="mt-12">
                <div class="w-full h-8 bg-sk"></div>
            </div>
        </div>
        <!-- end of product action -->
    </section>

    <!-- product reviews section -->
    <section>
        <div class="mx-2 lg:w-[65%] lg:mx-20 xl:w-[70%] sm:flex sm:mx-10 gap-10">
            <!-- user rating stat -->
            <div class="w-full max-md:pb-4 md:max-w-[20%]">
                <h2 class="w-20 h-4 bg-sk"></h2>
                <div class="flex items-center gap-5 mt-3">
                    <div class="h-20 w-full bg-sk">
                    </div>
                </div>
                <div class="text-sm pt-8 space-y-2">
                    <template v-for="(rating, index) in 5" :key="index">
                        <div class="w-full flex items-center gap-2">
                            <div class="w-6 h-4 bg-sk">
                            </div>

                            <div class="w-full bg-sk h-3">

                            </div>
                            <div class="w-6 h-4 bg-sk"></div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- user reviews -->
            <div class="w-full space-y-3">
                <template v-for="review in  6" :key="review">
                    <div class="border-b pb-3">
                        <div class="flex justify-between items-center">
                            <div class="bg-sk w-32 h-4">

                            </div>
                        </div>
                        <div class="flex gap-3 items-center mt-1">
                            <div class="w-8 h-8 overflow-hidden rounded-full lg:w-10 lg:h-10 bg-secondary" fill>
                            </div>
                            <div class="bg-sk w-20 h-4">
                            </div>
                        </div>
                        <div class="mt-2">
                            <div class="w-12 h-4 bg-sk"></div>
                            <div class="space-y-1.5 mt-2">
                                <template v-for="item in 3" :key="item">
                                    <div class="h-3 w-11/12 bg-sk"></div>
                                </template>
                            </div>
                            
                        </div>
                    </div>
                </template>
            </div>
        </div>        
    </section>
    <!-- end of product reviews section -->
</template>
<style scoped>
.bg-sk {
    @apply bg-secondary rounded-sm
}
</style>