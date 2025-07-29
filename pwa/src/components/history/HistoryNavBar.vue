<script setup lang="ts">
import SettingsDropdown from "../SettingsDropdown.vue";
import IconPlus from "~icons/tabler/plus";
import { RouterLink } from "vue-router";
import { haptic } from "~/plugins/haptic";

defineProps<{
  tab: string;
}>();
</script>

<template>
  <div class="navbar">

    <div class="navbar-start">
      <settings-dropdown />
    </div>

    <div class="navbar-center">
      <div
        role="tablist"
        class="tabs tabs-box"
      >
        <router-link
          to="/history"
          @click="() => haptic()"
          role="tab"
          class="tab"
          :class="tab === 'overall' ? 'tab-active' : ''"
        >
          Overall
        </router-link>
        <router-link
          to="/history/habits"
          @click="() => haptic()"
          role="tab"
          class="tab"
          :class="tab === 'habits' ? 'tab-active' : ''"
        >
          Habits
        </router-link>
      </div>
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
