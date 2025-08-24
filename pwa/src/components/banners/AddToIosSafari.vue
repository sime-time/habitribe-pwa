<script setup lang="ts">
import IconX from "~icons/tabler/x";
import IconShare from "~icons/tabler/share-2";
import IconSquarePlus from "~icons/tabler/square-plus";
import IconArrowDown from "~icons/tabler/arrow-down";

const props = defineProps<{
  closePrompt: () => void
  doNotShowAgain: () => void
}>()
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 h-[60%] z-50 pb-12 px-4 text-white">
    <div class="relative bg-primary p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">

      <!-- Close button -->
      <button
        class="absolute top-0 right-0 p-3"
        @click="props.closePrompt"
      >
        <icon-x class="text-2xl" />
      </button>

      <!-- Text -->
      <p class="text-lg">
        For the best experience, we recommend installing the Habitribe app to your home screen!
      </p>

      <!-- Share instructions -->
      <div class="flex gap-2 items-center text-lg">
        <p>Click the</p>
        <icon-share class="text-4xl" />
        <p>icon</p>
      </div>

      <!-- Add to Home Screen instructions -->
      <div class="flex flex-col gap-2 items-center text-lg w-full px-4">
        <p>Scroll down and then click:</p>
        <div class="bg-zinc-800 flex justify-between items-center w-full px-4 py-2 rounded-lg">
          <p>Add to Home Screen</p>
          <icon-square-plus class="text-2xl" />
        </div>
      </div>

      <!-- Do not show again -->
      <button
        class="border-2 p-1"
        @click="props.doNotShowAgain"
      >
        Don't show again
      </button>

      <!-- Arrow -->
      <icon-arrow-down class="text-4xl absolute -bottom-[50px] text-indigo-700 -z-10 animate-bounce" />
    </div>
  </div>
</template>
