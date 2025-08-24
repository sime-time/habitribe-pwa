<script setup lang="ts">
import IconX from "~icons/tabler/x";

const props = defineProps<{
  closePrompt: () => void;
  doNotShowAgain: () => void;
}>();

const searchUrl =
  "https://www.google.com/search?q=add+to+home+screen+for+common-mobile-browsers";
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 h-[60%] z-50 pb-12 px-4 text-white flex flex-col items-center justify-around"
  >
    <div class="relative bg-primary p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">
      <!-- Close button -->
      <button
        class="absolute top-0 right-0 p-3"
        @click="props.closePrompt"
      >
        <IconX class="text-2xl" />
      </button>

      <!-- Intro text -->
      <p class="text-lg">
        For the best experience, we recommend installing the Habitribe app to
        your home screen!
      </p>

      <!-- Browser unknown message -->
      <div class="flex flex-col gap-4 items-center text-lg">
        <p>
          Unfortunately, we were unable to determine which browser you are using.
          Please search for how to install a web app for your browser.
        </p>
        <a
          class="text-blue-300 underline"
          :href="searchUrl"
          target="_blank"
        >
          Try This Search
        </a>
      </div>

      <!-- Do not show again -->
      <button
        class="border-2 p-1"
        @click="props.doNotShowAgain"
      >
        Don’t show again
      </button>
    </div>
  </div>
</template>
