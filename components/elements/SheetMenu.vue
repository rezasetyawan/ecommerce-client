<script setup lang="ts">
import {
Sheet,
SheetContent,
SheetHeader,
SheetTitle
} from "../ui/sheet";

interface SheetMenuProps {
    open: boolean;
    routes: {
        href: string;
        label: string;
        active: boolean;
    }[];
}

const props = defineProps<SheetMenuProps>();
const emit = defineEmits(["route-click"])
</script>
<template>
    <Sheet :open="props.open">
        <SheetContent side="left" class="w-full mt-14 sm:max-w-sm">
            <div class="grid gap-4 py-4">
                <template v-for="route in props.routes" :key="route.href">
                    <NuxtLink :to="route.href" class="text-sm font-medium transition-colors hover:text-primary" @click="emit('route-click')">{{
                        route.label }}</NuxtLink>
                </template>
            </div>
        </SheetContent>
    </Sheet>
</template>