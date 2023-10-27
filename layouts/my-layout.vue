<script setup lang="ts">
import Navbar from "../components/elements/Navbar.vue";
</script>
<template>
  <Navbar />
  <main class="pb-32 font-rubik">
    <slot></slot>
  </main>
</template>
