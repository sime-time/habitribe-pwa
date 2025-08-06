<script setup lang="ts">
import NavBar from "~/components/NavBar.vue";
import TabDock from "~/components/TabDock.vue";
import IconTrophy from "~icons/tabler/trophy"
import IconBonfire from "~icons/solar/bonfire-broken";
</script>

<template>
  <NavBar :tribe-options="true">
    <h1 class="text-xl font-semibold text-neutral-content">Tribe</h1>
  </NavBar>
  <main class="flex flex-col items-center justify-center gap-8 mb-dock mt-3 ">
    <section class="card bg-base-200 flex flex-row justify-between items-center">
      <IconBonfire />
      <h2>Tribe Name</h2>
    </section>
    <section class="card bg-base-200 flex flex-row justify-between items-center">
      <IconTrophy />
      <h2>Leaderboard</h2>
    </section>
  </main>
  <TabDock tab="tribe" />
</template>
