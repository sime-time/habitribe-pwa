<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useUserAgent } from '~/plugins/useUserAgent';
import { useCookies } from "@vueuse/integrations/useCookies";

const COOKIE_NAME = 'addToHomeScreenPrompt';

type AddToHomeScreenPromptType =
  | 'safari'
  | 'chrome'
  | 'firefox'
  | 'other'
  | 'firefoxIos'
  | 'chromeIos'
  | 'samsung'
  | '';

const cookies = useCookies();

const displayPrompt = ref<AddToHomeScreenPromptType>('');

// Async components with fallback loading
const ModuleLoading = {
  template: `<p class="animate-bounce text-white font-bold">Loading...</p>`
};

const AddToIosSafari = defineAsyncComponent({
  loader: () => import("./AddToIosSafari.vue"),
  loadingComponent: ModuleLoading,
});
const AddToMobileChrome = defineAsyncComponent({
  loader: () => import('./AddToMobileChrome.vue'),
  loadingComponent: ModuleLoading,
});
const AddToMobileFirefox = defineAsyncComponent({
  loader: () => import('./AddToMobileFirefox.vue'),
  loadingComponent: ModuleLoading,
});
const AddToMobileFirefoxIos = defineAsyncComponent({
  loader: () => import('./AddToIosFirefox.vue'),
  loadingComponent: ModuleLoading,
});
const AddToMobileChromeIos = defineAsyncComponent({
  loader: () => import('./AddToIosChrome.vue'),
  loadingComponent: ModuleLoading,
});
const AddToSamsung = defineAsyncComponent({
  loader: () => import('./AddToSamsung.vue'),
  loadingComponent: ModuleLoading,
});
const AddToOtherBrowser = defineAsyncComponent({
  loader: () => import('./AddToOtherBrowser.vue'),
  loadingComponent: ModuleLoading,
});

const { userAgent, isMobile, isStandalone } = useUserAgent();

function closePrompt() {
  displayPrompt.value = '';
}

function doNotShowAgain() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  cookies.set(COOKIE_NAME, 'dontShow', { expires: date });
  displayPrompt.value = '';
}

onMounted(() => {
  const addToHomeScreenPromptCookie = cookies.get(COOKIE_NAME);

  if (addToHomeScreenPromptCookie !== 'dontShow') {
    if (isMobile.value && !isStandalone.value) {
      if (userAgent.value === 'Safari') {
        displayPrompt.value = 'safari';
      } else if (userAgent.value === 'Chrome') {
        displayPrompt.value = 'chrome';
      } else if (userAgent.value === 'Firefox') {
        displayPrompt.value = 'firefox';
      } else if (userAgent.value === 'FirefoxiOS') {
        displayPrompt.value = 'firefoxIos';
      } else if (userAgent.value === 'ChromeiOS') {
        displayPrompt.value = 'chromeIos';
      } else if (userAgent.value === 'SamsungBrowser') {
        displayPrompt.value = 'samsung';
      } else {
        displayPrompt.value = 'other';
      }
    }
  }
});
</script>

<template>
  <div
    v-if="displayPrompt !== ''"
    class="fixed inset-0 bg-black/70 z-50"
    @click="closePrompt"
  >
    <component
      :is="{
        safari: AddToIosSafari,
        chrome: AddToMobileChrome,
        firefox: AddToMobileFirefox,
        firefoxIos: AddToMobileFirefoxIos,
        chromeIos: AddToMobileChromeIos,
        samsung: AddToSamsung,
        other: AddToOtherBrowser,
        '': null
      }[displayPrompt]"
      v-bind="{ closePrompt, doNotShowAgain }"
    />
  </div>
</template>
