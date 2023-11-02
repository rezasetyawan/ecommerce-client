// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@nuxtjs/supabase', '@vueuse/nuxt', '@pinia/nuxt'],
  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  ssr: false,
  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL as string,
      API_BASE_URL: process.env.API_BASE_URL as string,
      APP_BASE_URL: process.env.APP_BASE_URL as string,
      RAJA_ONGKIR_API_KEY: process.env.RAJA_ONGKIR_API_KEY as string
    }
  },
  build: {
    transpile: ['vue-sonner']
  }
})
