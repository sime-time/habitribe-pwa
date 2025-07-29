<script setup lang="ts">
import IconPlus from "~icons/tabler/plus";
import { RouterLink } from "vue-router";
import { haptic } from "~/plugins/haptic";
import { computed } from "vue";
import SettingsDropdown from "../SettingsDropdown.vue";

const props = defineProps<{
  date: string;
}>();

const formattedDate = computed(() => {
  const dateObj = new Date(props.date);
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
      <settings-dropdown />
    </div>

    <div class="navbar-center">
      <a class="text-xl font-semibold">{{ formattedDate }}</a>
    </div>

    <div class="navbar-end">
      <router-link
        to="/create-habit"
        class="btn bg-base-200 btn-circle text-primary"
        @click="() => haptic()"
      >
        <icon-plus style="font-size: 1.4em" />
      </router-link>
    </div>

  </div>
</template>
