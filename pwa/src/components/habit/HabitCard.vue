<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { divide } from "~/plugins/divide";
import { haptic } from "~/plugins/haptic";
import IconX from "~icons/tabler/x";
import IconMinus from "~icons/tabler/minus";
import IconPlus from "~icons/tabler/plus";

const props = defineProps<{
  id: number;
  name: string;
  goal: number;
  progress: number;
  unit: string;
}>();

// --- Track Progress ---
const incrementAmount = computed(() => divide(100, props.goal));

const progressPercent = ref(props.progress * incrementAmount.value);
const progressValue = computed(() => divide(progressPercent.value, incrementAmount.value));

const emit = defineEmits(["updateProgress"])
function increment() {
  haptic();
  progressPercent.value += incrementAmount.value;
  emit("updateProgress", progressValue.value, props.id);
}
function decrement() {
  haptic();
  progressPercent.value -= incrementAmount.value;

  // progress cannot be negative
  if (progressPercent.value < 0) {
    progressPercent.value = 0;
  }

  emit("updateProgress", progressValue.value, props.id)
}

// change radial color to success color when progress >= goal
const goalReached = ref(props.progress >= props.goal);
watch(progressValue, (newProgress: number) => {
  if (newProgress >= props.goal) {
    goalReached.value = true;
  } else {
    goalReached.value = false;
  }
});

// -- Modal: Edit Habit Entry --
const dialog = ref<HTMLDialogElement | null>(null);

</script>

<template>
  <div class="card bg-base-200 flex flex-row justify-between items-center">
    <div
      class="card-body p-4 cursor-pointer"
      @click="dialog?.showModal()"
    >
      <h2 class="card-title capitalize">{{ name }}</h2>
      <p class="opacity-70">{{ `Goal: ${goal} ${unit}` }}</p>
    </div>

    <div class="card-actions p-2">
      <button
        class="radial-progress"
        :class="goalReached ? 'text-success' : 'text-primary'"
        :style="`--value:${progressPercent}; --size:3.75rem; --thickness:0.5rem`"
        :aria-valuenow="progressPercent"
        role="progressbar"
        @click="increment"
      >
        <span class="text-md font-bold text-neutral-content">{{ progressValue }}</span>
      </button>
    </div>
  </div>

  <dialog
    ref="dialog"
    class="modal modal-bottom sm:modal-middle"
  >
    <div class="modal-box space-y-6 pb-14">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-lg">
          <icon-x />
        </button>
      </form>

      <div class="text-center">
        <h3 class="text-2xl font-bold capitalize">{{ name }}</h3>
        <p class="text-sm opacity-70">{{ `Goal: ${goal} ${unit}` }}</p>
      </div>

      <div class="flex justify-center items-center gap-4">
        <button
          class="btn btn-circle text-lg"
          @click="decrement"
        >
          <icon-minus />
        </button>
        <div
          class="radial-progress"
          :class="goalReached ? 'text-success' : 'text-primary'"
          :style="`--value:${progressPercent}; --size:9rem; --thickness:1.25rem`"
          :aria-valuenow="progressPercent"
          role="progressbar"
        >
          <span class="text-3xl font-bold text-neutral-content">{{ progressValue }}</span>
        </div>
        <button
          class="btn btn-circle text-lg"
          @click="increment"
        >
          <icon-plus />
        </button>
      </div>
    </div>
  </dialog>
</template>
