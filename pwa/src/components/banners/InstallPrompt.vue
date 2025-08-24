<script setup lang="ts">
import IconDownload from "~icons/tabler/download";

defineProps<{
  closeToast: () => void;
}>();

const emit = defineEmits(["install"]);

</script>

<template>
  <div class="flex flex-col items-center text-center">
    <h3 class="font-bold text-lg">Add to Home Screen</h3>
    <p class="text-sm">Install app to your home screen</p>
    <div class="mt-3 flex gap-4">
      <button
        class="btn btn-sm btn-neutral"
        @click="emit('install')"
      >
        <icon-download />
        Install
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
