<script setup lang="ts">
import TabDock from "~/components/TabDock.vue";
</script>

<template>
  <main class="flex flex-col items-center justify-center gap-8 mb-dock">
    <h1 class="text-2xl font-semibold text-neutral-content mt-16">Join a Tribe</h1>
    <p class="opacity-80">Tap "+" to add your first tribe</p>

  </main>
  <TabDock tab="tribe" />
</template>
