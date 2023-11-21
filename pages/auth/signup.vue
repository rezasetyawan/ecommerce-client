<script setup lang="ts">
import { useSupabaseClient } from "../../node_modules/@nuxtjs/supabase/dist/runtime/composables/useSupabaseClient";
import { Eye, EyeOff } from "lucide-vue-next";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useRuntimeConfig } from "nuxt/app";

const { $toast } = useNuxtApp()
const config = useRuntimeConfig();
const supabase = useSupabaseClient();
const router = useRouter();
const showPassword = ref(false);
const isLoading = ref(false)

const user = ref({
  name: "reza",
  email: "setyawanreza960@gmail.com",
  password: "12345678",
});


const signUpUser = async () => {
  try {
    isLoading.value = true
    const { data: { user: currentUser }, error } = await supabase.auth.signUp({
      email: user.value.email,
      password: user.value.password,
    });

    const userData = {
      id: currentUser?.id,
      name: user.value.name,
      email: user.value.email,
    };
    await supabase.from("users").insert(userData as never);

    if (error) {
      throw new Error(error.message)
    }
    return router.push("/");
  } catch (err: any) {
    throw new Error(err.message)
  } finally {
    isLoading.value = false
  }
}

const onSubmitHandler = async () => {
  return $toast.promise(signUpUser, {
    loading: "Loading...",
    success: (data) => {
      return `Signup success`;
    },
    error: (data: any) => (data.message ? `${data.message}` : "Failed to signup"),
  });
}

const signUpWithGoogleHandler = async () => {
  try {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: config.public.APP_BASE_URL as string,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

definePageMeta({
  layout: 'default'
})
</script>
<template>
  <section class="flex flex-col justify-center items-center h-screen font-rubik px-4 md:px-0">
    <form class="w-full md:max-w-sm" @submit.prevent="onSubmitHandler">
      <h1 class="font-semibold text-3xl my-10 text-center">SignUp</h1>
      <div class="relative">
        <Input type="text" class="w-full" placeholder="Name" required v-model="user.name" />
      </div>
      <div class="relative mt-5">
        <Input type="email" class="w-full" placeholder="Email" required v-model="user.email" />
      </div>
      <div class="relative mt-5">
        <Input :type="showPassword ? 'text' : 'password'" class="w-full" placeholder="Password" required minlength="8"
          v-model="user.password" />
        <Eye class="absolute top-[30%] right-[2%] h-5 w-5 stroke-gray-400" />
        <button type="button" @click="showPassword = !showPassword" class="absolute top-[30%] right-[2%] z-10">
          <Eye v-if="!showPassword" class="h-5 w-5 stroke-gray-400" />
          <EyeOff v-else class="h-5 w-5 stroke-gray-400" />
        </button>
      </div>
      <Button class="w-full mt-5" :disabled="isLoading">Sign Up</Button>
    </form>
    <div class="w-full md:max-w-sm mt-5">
      <Button class="bg-white text-black w-full flex gap-2 p-6 border hover:bg-white hover:text-black shadow-md"
        @click="signUpWithGoogleHandler"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="34"
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
        Sign Up With Google</Button>

      <p class="mt-4 font-medium text-sm">
        Already have an account?
        <NuxtLink :to="'/auth/signin'" class="font-semibold">SignIn</NuxtLink>
      </p>
    </div>
  </section>
</template>
