<script setup lang="ts">
import { RouterView } from "vue-router";
import { useToast } from "vue-toastification";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { watch, ref, onMounted } from "vue";
import UpdatePrompt from "./components/banners/UpdatePrompt.vue";
import InstallPrompt from "./components/banners/InstallPrompt.vue";

const toast = useToast();
const deferredPrompt = ref<Event | null>(null)

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

// --- PWA Install ---
onMounted(() => {
  window.addEventListener("beforeinstallprompt", (e) => {
    // prevent the default browser prompt
    e.preventDefault();
    // store the event so it can be triggered later
    deferredPrompt.value = e;

    // show the custom install toast
    toast.info(
      {
        component: InstallPrompt,
        listeners: {
          install: () => {
            if (deferredPrompt.value) {
              // Trigger the browser's native install prompt
              (deferredPrompt.value as any).prompt();

              // We'll reset the prompt variable after the user has been prompted
              // so the toast doesn't reappear
              (deferredPrompt.value as any).userChoice.then((choiceResult: { outcome: string; }) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                } else {
                  console.log('User dismissed the install prompt');
                }
                deferredPrompt.value = null;
              });
            }
          },
        },
      },
      {
        timeout: 20000,
        icon: false,
        closeButton: true,
      }
    );
  })
});
</script>

<template>
  <RouterView />
</template>
