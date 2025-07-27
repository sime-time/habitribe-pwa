<script setup lang="ts">
import HabitProgress from "./HabitProgress.vue";
defineProps<{
  name: string;
  value: number;
  unit: string;
  progress: number;
}>();
</script>

<template>
  <div class="card bg-base-200 flex flex-row justify-between items-center">
    <div class="card-body p-4">
      <h2 class="card-title capitalize">{{ name }}</h2>
      <p class="opacity-70">{{ `Goal: ${value} ${unit}` }}</p>
    </div>
    <div class="card-actions p-2">
      <HabitProgress :progress="progress" />
    </div>
  </div>
</template>
