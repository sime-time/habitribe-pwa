<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { divide } from "~/plugins/divide";

const props = defineProps<{
  id: number;
  name: string;
  goal: number;
  progress: number;
  unit: string;
}>();

const incrementAmount = computed(() => divide(100, props.goal));

const progressPercent = ref(props.progress * incrementAmount.value);
const progressValue = computed(() => divide(progressPercent.value, incrementAmount.value));

const emit = defineEmits(["incrementProgress"])
function increment() {
  progressPercent.value += incrementAmount.value;
  emit("incrementProgress", progressValue.value, props.id);
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
</script>

<template>
  <div class="card bg-base-200 flex flex-row justify-between items-center">
    <div class="card-body p-4">
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
</template>
