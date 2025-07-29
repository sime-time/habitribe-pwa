<script setup lang="ts">
import { RouterLink } from "vue-router";
import { haptic } from "~/plugins/haptic";
import IconChecklist from "~icons/solar/checklist-minimalistic-outline";
import IconGroup from "~icons/solar/users-group-rounded-linear";
import IconCalendar from "~icons/solar/calendar-outline"

defineProps<{
  tab: string;
}>();
</script>

<template>
  <nav class="dock bg-base-200">
    <router-link
      to="/"
      @click="() => haptic()"
      :class="tab === 'habits' ? 'dock-active text-primary' : ''"
    >
      <icon-checklist style="font-size: 1.2rem" />
      <span class="dock-label">Habits</span>
    </router-link>

    <router-link
      to="/history"
      @click="() => haptic()"
      :class="tab === 'stats' ? 'dock-active text-primary' : ''"
    >
      <icon-calendar style="font-size: 1.2rem" />
      <span class="dock-label">History</span>
    </router-link>

    <router-link
      to="/tribe"
      @click="() => haptic()"
      :class="tab === 'tribe' ? 'dock-active text-primary' : ''"
    >
      <icon-group style="font-size: 1.2rem" />
      <span class="dock-label">Tribe</span>
    </router-link>
  </nav>
</template>
