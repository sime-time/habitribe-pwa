<script setup lang="ts">
import { RouterLink } from "vue-router";
import { haptic } from "~/plugins/haptic";
import IconChecklist from "~icons/solar/checklist-minimalistic-outline";
import IconGroup from "~icons/solar/users-group-rounded-linear";
import IconChart from "~icons/tabler/chart-bar-popular";

defineProps<{
  tab: string;
}>();
</script>

<template>
  <nav class="dock bg-base-200">
    <router-link to="/" @click="() => haptic()" :class="tab === 'habits' ? 'dock-active text-primary' : ''">
      <icon-checklist style="font-size: 1.2rem" />
      <span class="dock-label">Habits</span>
    </router-link>

    <router-link to="/stats" @click="() => haptic()" :class="tab === 'stats' ? 'dock-active text-primary' : ''">
      <icon-chart style="font-size: 1.2rem" />
      <span class="dock-label">Stats</span>
    </router-link>

    <router-link to="/tribe" @click="() => haptic()" :class="tab === 'tribe' ? 'dock-active text-primary' : ''">
      <icon-group style="font-size: 1.2rem" />
      <span class="dock-label">Tribe</span>
    </router-link>
  </nav>
</template>
