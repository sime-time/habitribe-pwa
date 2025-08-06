<script setup lang="ts">
import { ref } from "vue";
import IconMeditation from "~icons/solar/meditation-outline";
import IconBook from "~icons/solar/book-2-linear";
import IconDumbbell from "~icons/solar/dumbbell-large-outline";
import IconTreadmill from "~icons/solar/treadmill-bold";
import IconAlarm from "~icons/solar/alarm-outline";
import IconKitchen from "~icons/tabler/tools-kitchen-2";

const availableIcons = [
  { id: "solar:meditation-outline", component: IconMeditation },
  { id: "solar:dumbbell-large-outline", component: IconDumbbell },
  { id: "solar:book-2-linear", component: IconBook },
  { id: "solar:treadmill-bold", component: IconTreadmill },
  { id: "solar:alarm-outline", component: IconAlarm },
  { id: "tabler:tools-kitchen-2", component: IconKitchen },
];

const selectedIcon = ref<string | null>(null);

const emit = defineEmits(["habitIconSelected"]);
function onIconSelect(icon: string) {
  selectedIcon.value = icon;
  emit("habitIconSelected", icon);
}
</script>

<template>
  <div class="grid grid-cols-6 gap-2">
    <template v-for="icon in availableIcons" :key="icon.id">
      <button type="button" class="btn btn-circle btn-lg text-neutral-content text-xl"
        :class="selectedIcon === icon.id ? 'bg-primary' : 'bg-base-100'" @click="() => onIconSelect(icon.id)">
        <component :is="icon.component" />
      </button>
    </template>
  </div>
</template>
