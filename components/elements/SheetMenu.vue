<script setup lang="ts">
import {
    Sheet,
    SheetContent
} from "../ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { useUserStore } from "~/store/user";

const { signOut } = useUserStore();
const supabase = useSupabaseClient()

interface SheetMenuProps {
    open: boolean;
    routes: {
        href: string;
        label: string;
        active: boolean;
    }[];
}

const signOutHandler = async () => {
    await signOut(supabase);
    useRouter().push('/auth/signin')
};

const props = defineProps<SheetMenuProps>();
const emit = defineEmits(["route-click"])
</script>
<template>
    <Sheet :open="props.open">
        <SheetContent side="left" class="w-full mt-14 sm:max-w-sm">
            <div class="grid gap-4 py-4">
                <template v-for="route in props.routes" :key="route.href">
                    <NuxtLink :to="route.href" class="text-sm font-medium transition-colors hover:text-primary"
                        @click="emit('route-click')">{{
                            route.label }}</NuxtLink>
                </template>
            </div>
            <AlertDialog>
                <AlertDialogTrigger class="text-sm font-medium">
                    Sign out
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure want to sign out?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction @click="signOutHandler">
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SheetContent>
    </Sheet>
</template>