<script setup lang="ts">
defineProps<{
  progress: number;
}>();
</script>

<template>
  <div class="radial-progress text-primary" :style="`--value:${progress}; --size:3.75rem; --thickness:0.5rem`"
    :aria-valuenow="progress" role="progressbar">
    <span class="text-md font-bold text-neutral-content">{{ progress }}</span>
  </div>
</template>
