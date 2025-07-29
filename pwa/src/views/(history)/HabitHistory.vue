<script setup lang="ts">
import HistoryNavBar from "~/components/history/HistoryNavBar.vue";
import TabDock from "~/components/TabDock.vue";
</script>

<template>
  <HistoryNavBar tab="habits" />
  <main class="flex flex-col items-center justify-center gap-8 mb-dock">
    <h1 class="text-2xl font-semibold text-neutral-content mt-16">Habit Stats</h1>

  </main>
  <TabDock tab="stats" />
</template>
