<script setup lang="ts">
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { Eye, EyeOff } from "lucide-vue-next";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useRuntimeConfig } from "nuxt/app";

const config = useRuntimeConfig();
const supabase = useSupabaseClient();
const router = useRouter();
const { $toast } = useNuxtApp()
const isLoading = ref(false)
const showPassword = ref(false);
const user = ref({
  email: "setyawanreza12@gmail.com",
  password: "12345678",
});

const signInUser = async () => {
  try {
    isLoading.value = true
    const { data, error } = await supabase.auth.signInWithPassword(user.value);

    if (error) {
      throw new Error(error.message)
    }

    return router.push("/");
  } catch (err: any) {
    throw new Error(err.message)
  } finally {
    isLoading.value = false
  }
};

const signInWithGoogleHandler = async () => {
  try {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: config.public.APP_BASE_URL as string,
      },
    });
  } catch (err: any) {
    throw new Error(err.message)
  }
};

const onSubmitHandler = async () => {
  return $toast.promise(signInUser, {
    loading: "Loading...",
    success: (data) => {
      return `Signin success`;
    },
    error: (data: any) => (data.message ? `${data.message}` : "Failed to signin"),
  });
}

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN") {
    if (session) {
      const user = session.user;
      if (user.app_metadata.provider !== 'email') {
        const userData = {
          id: user.id,
          name: user.user_metadata.full_name,
          email: user.email,
        };
        await supabase.from("users").upsert(userData as never);
      }
    }
  }
});

useHead({
  title: `Signin | Ini Toko`,
  titleTemplate: `Signin | Ini Toko`,
})

definePageMeta({
  layout: 'default'
})
</script>
<template>
  <HeadMetaData :title="'Signin'" />
  <Toaster position="top-center" richColors />
  <section class="flex flex-col justify-center items-center h-screen font-rubik px-4 md:px-0">
    <form class="w-full md:max-w-sm" @submit.prevent="onSubmitHandler">
      <h1 class="font-semibold text-3xl my-10 text-center">SignIn</h1>
      <div class="relative">
        <Input type="email" class="w-full" placeholder="Email" required v-model="user.email" />
      </div>
      <div class="relative mt-5">
        <Input :type="showPassword ? 'text' : 'password'" class="w-full" placeholder="Password" required minlength="8"
          v-model="user.password" />
        <button type="button" @click="showPassword = !showPassword" class="absolute top-[30%] right-[2%] z-10">
          <Eye v-if="!showPassword" class="h-5 w-5 stroke-gray-400" />
          <EyeOff v-else class="h-5 w-5 stroke-gray-400" />
        </button>
      </div>
      <Button class="w-full mt-5" :disabled="isLoading">Sign In</Button>
    </form>
    <div class="w-full md:max-w-sm mt-5">
      <Button class="bg-white text-black w-full flex gap-2 p-6 border hover:bg-white hover:text-black shadow-md"
        @click="signInWithGoogleHandler"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="34"
          viewBox="0 0 48 48">
          <path fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00"
            d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50"
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        Sign In With Google</Button>

      <p class="mt-4 font-medium text-sm">
        Doesn't have an account yet?
        <NuxtLink :to="'/auth/signup'" class="font-semibold">SignUp</NuxtLink>
      </p>
    </div>
  </section>
</template>
