<script setup lang="ts">
import IconSquarePlus from "~icons/tabler/square-plus";
import IconX from "~icons/tabler/x";
import IconArrowUp from "~icons/tabler/arrow-up";
import IconShare from "~icons/tabler/share-2";

const props = defineProps<{
  closePrompt: () => void;
  doNotShowAgain: () => void;
}>();
</script>

<template>
  <div class="fixed top-0 left-0 right-0 h-[70%] z-50 pt-12 px-4 text-white">
    <div class="relative bg-base-100 p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">
      <!-- Bouncing arrow -->
      <IconArrowUp class="text-4xl absolute -top-[40px] right-0 text-base-content z-10 animate-bounce" />

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

      <!-- Share instructions -->
      <div class="flex gap-2 items-center text-lg">
        <p>Click the</p>
        <IconShare class="text-3xl" />
        <p>icon</p>
      </div>

      <!-- Add to Home Screen instructions -->
      <div class="flex flex-col gap-2 items-center text-lg w-full px-4">
        <p>Scroll down and then click:</p>
        <div class="bg-zinc-800 flex items-center justify-between w-full px-8 py-2 rounded-lg">
          <p>Add to Home Screen</p>
          <IconSquarePlus class="text-2xl" />
        </div>
      </div>

      <!-- Do not show again -->
      <button
        class="border-2 p-1"
        @click="props.doNotShowAgain"
      >
        Don't show again
      </button>
    </div>
  </div>
</template>
