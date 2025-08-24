<script setup lang="ts">
import IconX from "~icons/tabler/x";
import IconDotsVertical from "~icons/tabler/dots-vertical";
import IconArrowDownRight from "~icons/tabler/arrow-down-right";
import IconFireFox from "~icons/tabler/brand-firefox"

const props = defineProps<{
  closePrompt: () => void;
  doNotShowAgain: () => void;
}>();
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 h-[60%] z-50 pb-12 px-4 text-white">
    <div class="relative bg-base-100 p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">
      <!-- Close button -->
      <button
        class="absolute top-0 right-0 p-3"
        @click="props.closePrompt"
      >
        <IconX class="text-2xl" />
      </button>

      <!-- Intro text -->
      <p class="text-lg">
        For the best experience, we recommend installing the Habitribe app to your home screen!
      </p>

      <!-- Dots menu instruction -->
      <div class="flex gap-2 items-center text-lg">
        <p>Click the</p>
        <IconDotsVertical class="text-4xl" />
        <p>icon</p>
      </div>

      <!-- Install instruction -->
      <div class="flex flex-col gap-2 items-center text-lg w-full px-4">
        <p>Scroll down and then click:</p>
        <div class="bg-zinc-50 flex items-center justify-around w-full px-4 py-2 rounded-lg text-zinc-900">
          <div class="flex gap-6 items-center">
            <icon-fire-fox class="w-8 h-8" />
            <p>Install</p>
          </div>
        </div>
      </div>

      <!-- Do not show again -->
      <button
        class="border-2 p-1"
        @click="props.doNotShowAgain"
      >
        Don't show again
      </button>

      <!-- Bouncing arrow -->
      <IconArrowDownRight class="text-4xl absolute -bottom-[50px] right-1 text-base-content z-10 animate-bounce" />
    </div>
  </div>
</template>
