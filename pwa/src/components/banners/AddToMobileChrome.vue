<script setup lang="ts">
import IconX from "~icons/tabler/x";
import IconDots from "~icons/tabler/dots-vertical";
import IconHomeScreen from "~icons/tabler/square-circle";
import IconArrowUp from "~icons/tabler/arrow-up";

const props = defineProps<{
  closePrompt: () => void;
  doNotShowAgain: () => void;
}>();
</script>

<template>
  <div class="fixed top-0 left-0 right-0 h-[60%] z-50 pt-12 px-4 text-white">
    <!-- Bouncing arrow -->
    <IconArrowUp class="text-4xl absolute top-[10px] right-[10px] text-indigo-700 z-10 animate-bounce" />

    <div class="relative bg-primary p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">
      <!-- Close button -->
      <button
        class="absolute top-0 right-0 p-3"
        @click="props.closePrompt"
      >
        <IconX class="text-2xl" />
      </button>

      <!-- Text -->
      <p class="text-lg">
        For the best experience, we recommend installing the Habitribe app to your home screen!
      </p>

      <!-- Dots menu -->
      <div class="flex gap-2 items-center text-lg">
        <p>Click the</p>
        <IconDots class="text-4xl" />
        <p>icon</p>
      </div>

      <!-- Add to Home Screen instructions -->
      <div class="flex flex-col gap-2 items-center text-lg w-full px-4">
        <p>Scroll down and then click:</p>
        <div class="bg-zinc-50 flex justify-between items-center w-full px-4 py-2 rounded-lg text-zinc-900">
          <IconHomeScreen class="text-2xl" />
          <p>Add to Home Screen</p>
        </div>
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
