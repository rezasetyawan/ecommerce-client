<script setup lang="ts">
import Navbar from "../components/elements/Navbar.vue";
</script>
<template>
  <Navbar />
  <main class="pb-32 font-rubik p-3">
    <slot></slot>
  </main>
</template>
