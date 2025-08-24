<script setup lang="ts">
import IconRefresh from "~icons/tabler/refresh";

defineProps<{
  closeToast: () => void;
}>();

const emit = defineEmits(["update"]);

</script>

<template>
  <div class="flex flex-col items-center text-center">
    <h3 class="font-bold text-lg">Update Available!</h3>
    <p class="text-sm">A new version of Habitribe has been downloaded.</p>
    <div class="mt-3 flex gap-4">
      <button
        class="btn btn-sm btn-neutral"
        @click="emit('update')"
      >
        <IconRefresh />
        Reload
      </button>
      <button
        class="btn btn-sm btn-ghost"
        @click="closeToast"
      >
        Close
      </button>
    </div>
  </div>
</template>
