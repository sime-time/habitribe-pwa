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
    <div class="relative bg-base-100 p-4 h-full rounded-xl flex flex-col justify-around items-center text-center">

      <!-- Close button -->
      <button
        class="absolute top-0 right-0 p-2"
        @click="props.closePrompt"
      >
        <icon-x class="text-xl" />
      </button>

      <!-- Text -->
      <p class="text-lg">
        For the best experience, we recommend installing the Habitribe app to your home screen!
      </p>

      <!-- Share instructions -->
      <div class="flex gap-2 items-center text-lg">
        <p>Tap the</p>
        <icon-share class="text-3xl" />
        <p>icon</p>
      </div>

      <!-- Add to Home Screen instructions -->
      <div class="flex flex-col gap-2 items-center text-lg w-full px-4">
        <p>Scroll down and then tap:</p>
        <div class="btn btn-lg btn-block flex items-center justify-evenly">
          <p>Add to Home Screen</p>
          <icon-square-plus class="text-2xl" />
        </div>
      </div>

      <!-- Do not show again -->
      <button
        class="btn btn-outline"
        @click="props.doNotShowAgain"
      >
        Don't show again
      </button>

      <!-- Arrow -->
      <icon-arrow-down class="text-4xl absolute -bottom-[50px] text-base-content -z-10 animate-bounce" />
    </div>
  </div>
</template>
