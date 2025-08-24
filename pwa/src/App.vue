<script setup lang="ts">
import UpdateCheck from './components/banners/UpdateCheck.vue';
import AddToHomeScreen from './components/banners/AddToHomeScreen.vue';
</script>

<template>
  <UpdateCheck />
  <AddToHomeScreen />
  <RouterView />
</template>
