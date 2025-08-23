<script setup lang="ts">
import IconPlus from "~icons/tabler/plus";
import IconArrowLeft from "~icons/tabler/arrow-left";
import IconReload from "~icons/tabler/reload";
import { RouterLink } from "vue-router";
import { haptic } from "~/plugins/haptic";
import { computed } from "vue";
import SettingsDropdown from "./SettingsDropdown.vue";
import router from "~/router";

const props = defineProps<{
  date?: string;
  backButton?: boolean;
}>();

const formattedDate = computed(() => {
  const dateObj = new Date(props.date!);
  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC", // Use UTC to avoid timezone-related day shifts
  });
});


</script>

<template>
  <div class="navbar">

    <div class="navbar-start">
      <button
        v-if="backButton"
        to="/"
        tabindex="0"
        role="button"
        class="btn btn-ghost btn-circle"
        @click="() => {
          haptic();
          router.back();
        }"
      >
        <icon-arrow-left style="font-size: 1.5em" />
      </button>

      <settings-dropdown v-else />
    </div>

    <div class="navbar-center">
      <h1
        v-if="date"
        class="text-xl font-semibold"
      >{{ formattedDate }}</h1>

      <h1
        v-else
        class="text-xl font-semibold"
      >
        <slot />
      </h1>
    </div>

    <div class="navbar-end">
      <button
        v-if="backButton"
        tabindex="0"
        role="button"
        class="btn btn-ghost btn-circle"
        @click="() => {
          haptic();
          router.go(0);
        }"
      >
        <icon-reload style="font-size: 1.5em" />
      </button>
      <router-link
        v-else
        to="/habit/create"
        class="btn bg-base-200 btn-circle text-primary"
        @click="() => haptic()"
      >
        <icon-plus style="font-size: 1.4em" />
      </router-link>

    </div>



  </div>
</template>
