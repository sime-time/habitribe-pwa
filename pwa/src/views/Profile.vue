<script setup lang="ts">
import NavBar from '~/components/NavBar.vue';
</script>

<template>
  <nav-bar :back-button="true">Profile</nav-bar>
  <main class="container mx-auto px-4 mt-3 mb-6">
    <form class="space-y-6">
      <!-- Username -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Username</label>
        <input
          class="input input-sm input-ghost text-lg px-0"
          placeholder="Public name"
        />
      </fieldset>

      <!-- Avatar -->
      <fieldset class="card bg-base-200 p-4 space-y-1">
        <label class="text-sm opacity-50">Avatar</label>
        <input
          class="input input-sm input-ghost text-lg px-0"
          placeholder="Public name"
        />
      </fieldset>

      <button
        type="submit"
        class="btn btn-primary btn-xl text-lg btn-block text-neutral-content"
      >
        Submit
      </button>


    </form>
  </main>
</template>
