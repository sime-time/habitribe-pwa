<script setup lang="ts">
import IconX from "~icons/tabler/x";
import IconMenu2 from "~icons/tabler/menu-2";
import IconPlus from "~icons/tabler/plus";
import IconArrowDown from "~icons/tabler/arrow-down";

const props = defineProps<{
  closePrompt: () => void;
  doNotShowAgain: () => void;
}>();
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 h-[80%] z-50 pb-12 px-4 text-white">
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

      <!-- Step 1 -->
      <div class="flex gap-2 items-center text-lg">
        <p>Click the</p>
        <IconMenu2 class="text-4xl" />
        <p>icon</p>
      </div>

      <!-- Step 2 -->
      <div class="flex flex-col gap-2 items-center text-lg w-full px-4">
        <p>Scroll down and then click:</p>
        <div class="bg-white text-zinc-800 flex flex-col gap-2 items-center p-4 rounded-lg">
          <IconPlus class="text-2xl" />
          <p>Add page to</p>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="flex flex-col gap-2 items-center text-lg w-full px-4">
        <p>Then select:</p>
        <div class="bg-white text-zinc-800 flex flex-col gap-2 items-center py-2 px-4 rounded-lg">
          <p>Home screen</p>
        </div>
      </div>

      <!-- Do not show again -->
      <button
        class="border-2 p-1"
        @click="props.doNotShowAgain"
      >
        Don’t show again
      </button>

      <!-- Arrow -->
      <IconArrowDown class="text-4xl absolute -bottom-[50px] right-[-3px] text-indigo-700 z-10 animate-bounce" />
    </div>
  </div>
</template>
