<script setup lang="ts">
import IconArrowLeft from "~icons/tabler/arrow-left";
import { RouterLink } from "vue-router";
import { haptic } from "~/plugins/haptic";
</script>

<template>
  <header class="navbar">

    <div class="navbar-start">
      <router-link to="/" tabindex="0" role="button" class="btn btn-ghost btn-circle" @click="() => haptic()">
        <icon-arrow-left style="font-size: 1.5em" />
      </router-link>
    </div>

    <div class="navbar-center">
      <a class="text-xl font-semibold">New Habit</a>
    </div>

    <div class="navbar-end"></div>
  </header>
</template>
