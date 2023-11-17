<script setup lang="ts">
interface Props {
    counts: number
}

const props = withDefaults(defineProps<Props>(), {
    counts: 6
})
</script>
<template>
    <div v-for="(item, index) in props.counts" :key="index"
        class="bg-white group cursor-pointer rounded-xl border p-1 space-y-2 lg:text-p-3 animate-pulse">
        <div class="aspect-square rounded-xl bg-gray-100 relative">
            <div fill class="aspect-square object-contain rounded-md" />
        </div>
        <div class="space-y-1">
            <p class="w-4/5 bg-secondary h-4 rounded-sm"></p>
            <p class="w-3/5 bg-secondary h-3 rounded-sm"></p>
        </div>
        <div class="">
            <p class="w-4/5 bg-secondary h-4 rounded-sm"></p>
        </div>

        <div class="flex gap-1 items-center text-slate-600 text-xs lg:text-sm">
            <div class="flex items-center">
                <div class="bg-secondary w-5 h-4"></div>
            </div>
            <div class="flex items-center gap-1">
                <div class="w-4 h-4 bg-secondary rounded-sm"></div> <div class="w-8 h-4 bg-secondary rounded-sm"></div>
            </div>
            <p></p>
        </div>

    </div>
</template>