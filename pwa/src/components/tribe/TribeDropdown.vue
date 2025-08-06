<script setup lang="ts">
import IconUserPlus from "~icons/solar/user-plus-broken";
import IconPlus from "~icons/tabler/plus";
import IconGroup from "~icons/solar/users-group-two-rounded-broken"
import { haptic } from "~/plugins/haptic";
</script>

<template>
  <div class="dropdown dropdown-end">
    <div
      tabindex="0"
      role="button"
      class="btn bg-base-200 btn-circle text-primary"
      @click="() => haptic()"
    >
      <icon-plus style="font-size: 1.4em" />
    </div>
    <ul
      tabindex="0"
      class="menu menu-lg dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-3 shadow space-y-3"
    >

      <li>
        <router-link
          to="/tribe/join"
          class="bg-base-100"
        >
          <icon-user-plus />
          Join Tribe
        </router-link>
      </li>
      <li>
        <router-link
          to="/tribe/create"
          class="bg-base-100"
        >
          <icon-group />
          Create Tribe
        </router-link>
      </li>
    </ul>
  </div>
</template>
