<script setup lang="ts">
import { useToast } from "vue-toastification";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { watch } from "vue";
import UpdatePrompt from "./UpdatePrompt.vue";

const toast = useToast();

const { needRefresh, updateServiceWorker } = useRegisterSW();

// --- PWA Update ---
watch(needRefresh, (isNeeded) => {
  if (isNeeded) {
    // when an update is available, show custom toast
    toast.info(
      {
        component: UpdatePrompt,
        listeners: { // listen for emits
          update: () => {
            // when user clicks "Reload", update the service worker
            updateServiceWorker();
          },
        },
      },
      {
        // toast options
        timeout: false, // don't auto-close this toast
        icon: false, // disable default icon
        closeButton: false,
      }
    );
  }
});
</script>

<template></template>
